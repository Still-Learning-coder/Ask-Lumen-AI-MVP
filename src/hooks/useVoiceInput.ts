import { useState, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseVoiceInputProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export const useVoiceInput = ({ onTranscript, onError }: UseVoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Store stream for cleanup
      streamRef.current = stream;

      // Connect to WebSocket (no auth needed with verify_jwt = false)
      const wsUrl = `wss://jsuqipnblmjayovklhrf.supabase.co/functions/v1/voice-input`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected to voice input service');
        setIsConnecting(false);
        setIsRecording(true);
      };

      // Add connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout');
          onError?.('Connection timeout');
          toast({
            title: "Connection Timeout",
            description: "Failed to connect to voice service. Please try again.",
            variant: "destructive",
          });
          disconnect();
        }
      }, 10000);

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data.type);
          
          if (data.type === 'connected') {
            console.log('AssemblyAI connection confirmed');
            clearTimeout(connectionTimeout);
          } else if (data.type === 'partial' || data.type === 'final') {
            console.log('Transcript:', data.type, data.text);
            onTranscript(data.text, data.type === 'final');
          } else if (data.type === 'error') {
            console.error('Transcription error:', data.message);
            onError?.(data.message);
            toast({
              title: "Error",
              description: data.message,
              variant: "destructive",
            });
          }
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('Connection error');
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice input service",
          variant: "destructive",
        });
        disconnect();
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsRecording(false);
        setIsConnecting(false);
        // Don't call disconnect() here to avoid recursive cleanup
      };

      // Create AudioContext with 16kHz sample rate for PCM16 audio
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Convert Float32 audio to Int16 PCM and send as base64
      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(inputData.length);
          
          // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // Convert to base64
          const uint8Array = new Uint8Array(pcm16.buffer);
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const base64Audio = btoa(binary);

          wsRef.current.send(JSON.stringify({
            type: 'audio',
            audio: base64Audio
          }));
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      console.log('Web Audio API started with PCM16 encoding');

    } catch (error) {
      console.error('Error starting recording:', error);
      setIsConnecting(false);
      onError?.('Failed to access microphone');
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to use voice input",
        variant: "destructive",
      });
    }
  }, [onTranscript, onError]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting voice input...');
    
    // Send terminate signal
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'terminate' }));
    }

    // Stop Web Audio API
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsRecording(false);
    setIsConnecting(false);
    console.log('Voice input disconnected');
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording || isConnecting) {
      disconnect();
    } else {
      connect();
    }
  }, [isRecording, isConnecting, connect, disconnect]);

  return {
    isRecording,
    isConnecting,
    toggleRecording,
    disconnect
  };
};
