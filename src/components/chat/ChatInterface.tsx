import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import MessageBubble from "./MessageBubble";
import StarterSuggestions from "./StarterSuggestions";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

const CHAT_URL = `https://jsuqipnblmjayovklhrf.supabase.co/functions/v1/chat`;

const initialMessages: Message[] = [];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load or create conversation on mount
  useEffect(() => {
    const convId = searchParams.get('conversation');
    
    if (convId) {
      loadConversation(convId);
    } else {
      initializeConversation();
    }
  }, [searchParams]);

  const loadConversation = async (id: string) => {
    try {
      setConversationId(id);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        setMessages(data.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          imageUrl: msg.image_url || undefined,
          timestamp: new Date(msg.created_at)
        })));
      }
      
      console.log('Loaded conversation:', id, 'with', data?.length || 0, 'messages');
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  const initializeConversation = async () => {
    try {
      // Create a new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          title: 'New Chat',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversationId(data.id);
      setSearchParams({ conversation: data.id });
      console.log('Created new conversation:', data.id);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to initialize chat');
    }
  };

  const saveMessage = async (message: Message) => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          image_url: message.imageUrl,
          created_at: message.timestamp.toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleNewChat = async () => {
    setMessages([]);
    setInput("");
    await initializeConversation();
    toast.success('Started new conversation');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: Message, isFirstMessage = false) => {
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    // Check if this is an image generation request
    const imageKeywords = [
      'generate image', 'create image', 'generate a image', 'create a image',
      'draw', 'draw me', 'draw a',
      'make an image', 'make a picture', 'make me a picture',
      'generate a picture', 'create a picture',
      'show me a picture', 'show me an image',
      'i want to see', 'can you show'
    ];
    
    const containsImageRequest = imageKeywords.some(keyword => 
      userMessage.content.toLowerCase().includes(keyword)
    );
    
    if (containsImageRequest) {
      setIsGeneratingImage(true);
    }

    const assistantMessageId = `${Date.now()}-${Math.random()}`;
    let assistantContent = "";

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          conversationId,
          isFirstMessage
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON (image generation response)
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        
        // Add assistant message with text and image
        const assistantMsg: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: data.content || "Here's your generated image!",
          imageUrl: data.imageUrl,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        await saveMessage(assistantMsg);
        
        setIsLoading(false);
        setIsGeneratingImage(false);
        return;
      }

      // For streaming responses, add placeholder now
      const assistantPlaceholder: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantPlaceholder]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantContent += content;
              
              // Update the assistant message that already exists
              setMessages(prev => {
                const updated = prev.map(m => 
                  m.id === assistantMessageId 
                    ? { ...m, content: assistantContent }
                    : m
                );
                
                // Save the complete message when stream ends
                const finalMessage = updated.find(m => m.id === assistantMessageId);
                if (finalMessage && content.includes('.') || content.includes('!')) {
                  saveMessage(finalMessage);
                }
                
                return updated;
              });
            }
          } catch (e) {
            // Ignore parse errors for incomplete JSON
            console.debug("JSON parse error (expected during streaming):", e);
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split("\n");
        for (const rawLine of lines) {
          if (!rawLine || rawLine.startsWith(":") || !rawLine.startsWith("data: ")) continue;
          const jsonStr = rawLine.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => prev.map(m =>
                m.id === assistantMessageId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch (e) {
            console.debug("Final buffer parse error:", e);
          }
        }
      }

      console.log("Stream completed successfully");
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("Stream aborted by user");
        // Remove the assistant placeholder on abort
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
      } else {
        console.error("Error streaming chat:", error);
        toast.error("Failed to get response. Please try again.");
        
        // Remove incomplete assistant message on error
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
      }
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
      abortControllerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const isFirstMsg = messages.length === 0;
    const userMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage);
    setInput("");

    await streamChat(userMessage, isFirstMsg);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <StarterSuggestions 
            onSelect={(prompt) => {
              setInput(prompt);
            }} 
          />
        ) : (
          <div className="p-6 space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground text-xs font-bold">AI</span>
                </div>
                <div className="bg-muted rounded-2xl p-4 max-w-[70%]">
                  <div className="typing-indicator flex gap-1">
                    <span className="w-2 h-2 bg-foreground/50 rounded-full"></span>
                    <span className="w-2 h-2 bg-foreground/50 rounded-full"></span>
                    <span className="w-2 h-2 bg-foreground/50 rounded-full"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleNewChat}
              disabled={isLoading}
              title="New Chat"
            >
              <Plus className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => toast.info("File attachment coming soon!")}
              disabled={isLoading}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="resize-none min-h-[60px] max-h-[200px] pr-12"
                rows={1}
                disabled={isLoading}
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => toast.info("Voice input coming soon!")}
              disabled={isLoading}
            >
              <Mic className="h-5 w-5" />
            </Button>

            {isLoading ? (
              <Button
                size="icon"
                variant="destructive"
                className="shrink-0"
                onClick={handleStop}
              >
                <Loader2 className="h-5 w-5 animate-spin" />
              </Button>
            ) : (
              <Button
                size="icon"
                className="shrink-0 gradient-primary text-primary-foreground hover:opacity-90"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {isGeneratingImage ? "Generating your image..." : isLoading ? "AI is thinking..." : "Press Enter to send, Shift + Enter for new line"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
