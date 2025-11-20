import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "./ChatInterface";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

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
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        <span className="text-xs text-muted-foreground px-2">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
