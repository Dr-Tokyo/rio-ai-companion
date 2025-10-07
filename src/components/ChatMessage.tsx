import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";
  
  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg transition-all duration-300",
      isUser 
        ? "bg-primary/10 ml-auto max-w-[80%]" 
        : "bg-card max-w-[80%] shadow-card"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-gradient-primary" 
          : "bg-gradient-accent"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium mb-1 text-foreground">
          {isUser ? "You" : "Rio Futaba"}
        </p>
        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>
    </div>
  );
};
