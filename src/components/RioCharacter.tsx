import { cn } from "@/lib/utils";
import rioImage from "@/assets/rio-character.png";

interface RioCharacterProps {
  isSpeaking: boolean;
  className?: string;
}

export const RioCharacter = ({ isSpeaking, className }: RioCharacterProps) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Glow effect when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 bg-gradient-accent blur-3xl opacity-30 animate-pulse" />
      )}
      
      {/* Character container */}
      <div className="relative">
        <img
          src={rioImage}
          alt="Rio Futaba"
          className={cn(
            "w-full h-full object-contain transition-all duration-500",
            isSpeaking ? "scale-105 shadow-glow" : "scale-100"
          )}
        />
        
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
};
