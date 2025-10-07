import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import rioIdle from "@/assets/rio-idle.png";
import rioSpeaking from "@/assets/rio-speaking.png";
import rioThinking from "@/assets/rio-thinking.png";
import rioHappy from "@/assets/rio-happy.png";

interface RioCharacterProps {
  isSpeaking: boolean;
  isThinking: boolean;
  className?: string;
}

type CharacterState = "idle" | "speaking" | "thinking" | "happy";

export const RioCharacter = ({ isSpeaking, isThinking, className }: RioCharacterProps) => {
  const [currentState, setCurrentState] = useState<CharacterState>("idle");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Character state management
  useEffect(() => {
    if (isSpeaking) {
      setCurrentState("speaking");
    } else if (isThinking) {
      setCurrentState("thinking");
    } else {
      // Random chance to show happy expression
      const showHappy = Math.random() > 0.7;
      setCurrentState(showHappy ? "happy" : "idle");
      
      if (showHappy) {
        setTimeout(() => setCurrentState("idle"), 3000);
      }
    }
  }, [isSpeaking, isThinking]);

  // Idle breathing/floating animation
  useEffect(() => {
    const breatheInterval = setInterval(() => {
      if (currentState === "idle") {
        setPosition({
          x: Math.sin(Date.now() / 2000) * 5,
          y: Math.sin(Date.now() / 1500) * 8,
        });
      }
    }, 50);

    return () => clearInterval(breatheInterval);
  }, [currentState]);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const getCharacterImage = () => {
    switch (currentState) {
      case "speaking":
        return rioSpeaking;
      case "thinking":
        return rioThinking;
      case "happy":
        return rioHappy;
      default:
        return rioIdle;
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Ambient glow effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-accent blur-3xl transition-opacity duration-1000",
        isSpeaking ? "opacity-40 animate-pulse" : "opacity-10"
      )} />
      
      {/* Character container with smooth transitions */}
      <div 
        className="relative transition-all duration-500 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${isSpeaking ? 1.05 : 1})`,
        }}
      >
        {/* Character sprite with smooth state transitions */}
        <div className="relative">
          <img
            src={getCharacterImage()}
            alt="Rio Futaba"
            className={cn(
              "w-full h-full object-contain transition-all duration-300",
              isSpeaking && "drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]",
              isBlinking && "opacity-90"
            )}
          />
          
          {/* Blink overlay */}
          {isBlinking && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-transparent" 
                 style={{ 
                   clipPath: "polygon(0 40%, 100% 40%, 100% 50%, 0 50%)",
                   animation: "blink 0.15s ease-in-out"
                 }} 
            />
          )}
        </div>
        
        {/* Speech indicator - animated dots */}
        {isSpeaking && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-glow">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-glow">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" style={{ animationDelay: "400ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Interactive glow on hover (desktop only) */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        @media (hover: hover) {
          .rio-character-container:hover .character-glow {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};
