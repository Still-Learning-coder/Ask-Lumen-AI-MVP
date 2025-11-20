import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Mic } from "lucide-react";
import { toast } from "sonner";
import MessageBubble from "./MessageBubble";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachment?: {
    type: "image" | "video" | "audio" | "3d";
    url?: string;
    placeholder?: string;
  };
}

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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateMockResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    const id = Date.now().toString();
    const timestamp = new Date();

    // Image generation
    if (lowerMessage.includes("image") || lowerMessage.includes("picture") || lowerMessage.includes("photo")) {
      return {
        id,
        role: "assistant",
        content: "Here's the image I generated for you based on your request:",
        timestamp,
        attachment: {
          type: "image",
          url: `https://via.placeholder.com/600x400/00B4D8/FFFFFF?text=${encodeURIComponent("AI Generated: " + userMessage.slice(0, 30))}`
        }
      };
    }

    // Video content
    if (lowerMessage.includes("video")) {
      return {
        id,
        role: "assistant",
        content: "I've prepared a video for you:",
        timestamp,
        attachment: {
          type: "video",
          placeholder: "🎬 Video Player Placeholder"
        }
      };
    }

    // Audio content
    if (lowerMessage.includes("audio") || lowerMessage.includes("music") || lowerMessage.includes("sound")) {
      return {
        id,
        role: "assistant",
        content: "Here's the audio content:",
        timestamp,
        attachment: {
          type: "audio",
          placeholder: "🎵 Audio Player Placeholder"
        }
      };
    }

    // 3D models
    if (lowerMessage.includes("3d") || lowerMessage.includes("model")) {
      return {
        id,
        role: "assistant",
        content: "I've created an interactive 3D model for you:",
        timestamp,
        attachment: {
          type: "3d",
          placeholder: "🎮 3D Model Viewer Placeholder"
        }
      };
    }

    // Default text response
    const responses = [
      "That's a great question! Based on my analysis, I can tell you that this is a complex topic. Let me break it down for you in detail...",
      "Interesting! I've processed your request and here's what I found: The key aspects to consider are accuracy, efficiency, and user experience...",
      "I understand what you're looking for. Let me provide you with a comprehensive answer that covers all the important points...",
      "Excellent question! After analyzing the context, here's my detailed response: We should consider multiple perspectives on this...",
    ];

    return {
      id,
      role: "assistant",
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp,
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateMockResponse(input);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
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
              onClick={() => toast.info("Mock: File attachment would open here")}
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
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => toast.info("Mock: Voice input would activate here")}
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              className="shrink-0 gradient-primary text-primary-foreground hover:opacity-90"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
