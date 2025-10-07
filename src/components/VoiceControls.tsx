import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  disabled?: boolean;
}

export const VoiceControls = ({
  isRecording,
  onToggleRecording,
  voiceEnabled,
  onToggleVoice,
  disabled,
}: VoiceControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={voiceEnabled ? "default" : "outline"}
        size="icon"
        onClick={onToggleVoice}
        className={cn(
          "transition-all duration-300",
          voiceEnabled && "bg-gradient-primary hover:shadow-glow"
        )}
      >
        {voiceEnabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </Button>
      
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        onClick={onToggleRecording}
        disabled={disabled}
        className={cn(
          "transition-all duration-300",
          isRecording && "animate-pulse shadow-glow"
        )}
      >
        {isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
};
