import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
  isRecording: boolean;
  isConnecting: boolean;
  onClick: () => void;
}

export const VoiceInputButton = ({ isRecording, isConnecting, onClick }: VoiceInputButtonProps) => {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={onClick}
      disabled={isConnecting}
      className={cn(
        "relative transition-all",
        isRecording && "text-destructive hover:text-destructive"
      )}
    >
      {isRecording ? (
        <>
          <MicOff className="h-5 w-5" />
          <span className="absolute inset-0 rounded-md animate-pulse bg-destructive/20" />
        </>
      ) : (
        <Mic className={cn("h-5 w-5", isConnecting && "animate-pulse")} />
      )}
    </Button>
  );
};
