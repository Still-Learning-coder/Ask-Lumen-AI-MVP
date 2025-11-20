import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";
import MessageBubble from "./MessageBubble";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CHAT_URL = `https://jsuqipnblmjayovklhrf.supabase.co/functions/v1/chat`;

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm Lumen AI, your intelligent assistant. I can help you with images, 3D models, videos, research, and much more. What would you like to explore today?",
    timestamp: new Date(Date.now() - 10000),
  },
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: Message) => {
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    // Create assistant message placeholder immediately
    const assistantMessageId = Date.now().toString();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    
    // Add placeholder to messages right away to prevent race conditions
    setMessages(prev => [...prev, assistantPlaceholder]);
    
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
          }))
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: assistantContent }
                  : m
              ));
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
      abortControllerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    await streamChat(userMessage);
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
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

      {/* Input Area */}
      <div className="border-t border-border bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
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
            {isLoading ? "AI is thinking..." : "Press Enter to send, Shift + Enter for new line"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
