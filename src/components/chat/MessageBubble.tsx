import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { Message } from "./ChatInterface";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  const downloadImage = () => {
    if (!message.imageUrl) return;
    
    const link = document.createElement("a");
    link.href = message.imageUrl;
    link.download = `generated-${Date.now()}.png`;
    link.click();
    toast.success("Image downloaded!");
  };

  const renderMarkdown = (text: string) => {
    let html = text;
    
    // Convert **bold**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Convert *italic* (but not already in bold)
    html = html.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>');
    
    // Convert `code`
    html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Convert [text](url) to links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:text-primary transition-colors">$1</a>');
    
    // Convert line breaks
    html = html.replace(/\n/g, '<br/>');
    
    return { __html: html };
  };

  return (
    <div className={`flex items-start gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="w-8 h-8 shrink-0">
        {isUser ? (
          <>
            <AvatarImage src="https://i.pravatar.cc/150?img=1" />
            <AvatarFallback>You</AvatarFallback>
          </>
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">AI</span>
          </div>
        )}
      </Avatar>

      <div className={`flex flex-col gap-2 max-w-[70%] ${isUser ? "items-end" : ""}`}>
        <div
          className={`rounded-2xl p-4 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <div 
            className="text-sm leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={renderMarkdown(message.content)}
          />
          
          {message.imageUrl && (
            <div className="mt-3 space-y-2">
              <div className="rounded-lg overflow-hidden border border-border">
                <img 
                  src={message.imageUrl} 
                  alt="Generated" 
                  className="w-full h-auto"
                />
              </div>
              <Button 
                onClick={downloadImage} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </div>
          )}
        </div>

        <span className="text-xs text-muted-foreground px-2">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
