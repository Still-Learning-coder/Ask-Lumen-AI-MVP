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
      // Create WebSocket connection to AssemblyAI v3 streaming API with PCM16 encoding
      const url = `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&token=${ASSEMBLYAI_API_KEY}`;
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
          
          // Forward transcription to client (v3 API format)
          if (data.type === 'Turn') {
            // Only send formatted utterance, not raw transcript (prevents duplicates)
            const text = data.utterance || '';
            if (text.trim()) {
              console.log(`Transcript (${data.end_of_turn ? 'final' : 'partial'}):`, text);
              socket.send(JSON.stringify({
                type: data.end_of_turn ? 'final' : 'partial',
                text: text,
                confidence: data.end_of_turn_confidence
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
    // Handle binary audio data
    if (event.data instanceof ArrayBuffer || event.data instanceof Uint8Array) {
      if (assemblyWs && assemblyWs.readyState === WebSocket.OPEN) {
        console.log(`Forwarding binary audio: ${event.data.byteLength} bytes`);
        assemblyWs.send(event.data); // Forward raw binary PCM16 data
      } else {
        console.warn('Cannot send audio: AssemblyAI WebSocket not ready');
      }
      return;
    }

    // Handle text/JSON messages (control messages)
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'terminate') {
        console.log('Termination requested');
        if (assemblyWs && assemblyWs.readyState === WebSocket.OPEN) {
          assemblyWs.send(JSON.stringify({ terminate_session: true }));
        }
      }
    } catch (e) {
      console.error('Error processing message:', e);
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
