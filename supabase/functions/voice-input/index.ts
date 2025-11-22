import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgradeHeader = req.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const ASSEMBLYAI_API_KEY = Deno.env.get('ASSEMBLYAI_API_KEY');
  if (!ASSEMBLYAI_API_KEY) {
    console.error('ASSEMBLYAI_API_KEY not configured');
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let assemblyWs: WebSocket | null = null;
  let connectionTimeout: number | null = null;

  socket.onopen = async () => {
    console.log('Client WebSocket connected');
    
    try {
      // Create WebSocket connection to AssemblyAI with opus encoding
      const url = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&encoding=opus&token=${ASSEMBLYAI_API_KEY}`;
      assemblyWs = new WebSocket(url);

      // Set connection timeout
      connectionTimeout = setTimeout(() => {
        if (!assemblyWs || assemblyWs.readyState !== WebSocket.OPEN) {
          console.error('AssemblyAI connection timeout');
          socket.send(JSON.stringify({ type: 'error', message: 'Connection timeout to transcription service' }));
          if (assemblyWs) {
            assemblyWs.close();
          }
        }
      }, 10000);

      assemblyWs.onopen = () => {
        console.log('Successfully connected to AssemblyAI');
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
        }
        socket.send(JSON.stringify({ type: 'connected' }));
      };

      assemblyWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('AssemblyAI full message:', JSON.stringify(data));
          
          // Check for errors first
          if (data.error) {
            console.error('AssemblyAI error:', data.error);
            socket.send(JSON.stringify({ type: 'error', message: data.error }));
            return;
          }
          
          // Forward transcription to client
          if (data.message_type === 'PartialTranscript' || data.message_type === 'FinalTranscript') {
            const transcript = data.text || '';
            if (transcript.trim()) {
              console.log(`Transcript (${data.message_type}):`, transcript);
              socket.send(JSON.stringify({
                type: data.message_type === 'FinalTranscript' ? 'final' : 'partial',
                text: transcript,
                confidence: data.confidence
              }));
            }
          }
          
          // Handle session events
          if (data.message_type === 'SessionBegins') {
            console.log('AssemblyAI session started:', data.session_id);
          }
          
          if (data.message_type === 'SessionTerminated') {
            console.log('AssemblyAI session ended');
            socket.send(JSON.stringify({ type: 'status', message: 'Session ended' }));
          }
        } catch (e) {
          console.error('Error parsing AssemblyAI message:', e);
        }
      };

      assemblyWs.onerror = (error) => {
        console.error('AssemblyAI WebSocket error:', error);
        socket.send(JSON.stringify({ type: 'error', message: 'Connection error' }));
      };

      assemblyWs.onclose = () => {
        console.log('AssemblyAI WebSocket closed');
        socket.send(JSON.stringify({ type: 'status', message: 'Disconnected' }));
      };
    } catch (error) {
      console.error('Error connecting to AssemblyAI:', error);
      socket.send(JSON.stringify({ type: 'error', message: 'Failed to connect' }));
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Forward audio data to AssemblyAI
      if (data.type === 'audio' && assemblyWs && assemblyWs.readyState === WebSocket.OPEN) {
        const audioLength = data.audio ? data.audio.length : 0;
        console.log(`Forwarding audio chunk: ${audioLength} bytes`);
        assemblyWs.send(JSON.stringify({ audio_data: data.audio }));
      } else if (data.type === 'audio' && (!assemblyWs || assemblyWs.readyState !== WebSocket.OPEN)) {
        console.warn('Cannot send audio: AssemblyAI WebSocket not ready');
      }
      
      // Handle terminate request
      if (data.type === 'terminate') {
        console.log('Termination requested');
        if (assemblyWs && assemblyWs.readyState === WebSocket.OPEN) {
          assemblyWs.send(JSON.stringify({ terminate_session: true }));
        }
      }
    } catch (e) {
      console.error('Error processing client message:', e);
    }
  };

  socket.onclose = () => {
    console.log('Client disconnected');
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
    }
    if (assemblyWs && assemblyWs.readyState === WebSocket.OPEN) {
      assemblyWs.close();
    }
  };

  socket.onerror = (error) => {
    console.error('Client WebSocket error:', error);
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
    }
    if (assemblyWs && assemblyWs.readyState === WebSocket.OPEN) {
      assemblyWs.close();
    }
  };

  return response;
});
