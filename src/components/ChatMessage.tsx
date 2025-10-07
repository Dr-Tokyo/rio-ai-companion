import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";
  
  // Parse content for code blocks
  const renderContent = () => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const text = content.substring(lastIndex, match.index);
        parts.push(
          <span key={`text-${key++}`} className="whitespace-pre-wrap break-words">
            {text}
          </span>
        );
      }

      // Add code block
      const language = match[1] || "javascript";
      const code = match[2];
      parts.push(
        <div key={`code-${key++}`} className="my-2 rounded-lg overflow-hidden">
          <div className="bg-muted px-3 py-1 text-xs text-muted-foreground border-b border-border">
            {language}
          </div>
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: "0.875rem",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const text = content.substring(lastIndex);
      parts.push(
        <span key={`text-${key++}`} className="whitespace-pre-wrap break-words">
          {text}
        </span>
      );
    }

    return parts.length > 0 ? parts : (
      <span className="whitespace-pre-wrap break-words">{content}</span>
    );
  };
  
  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg transition-all duration-300",
      isUser 
        ? "bg-primary/10 ml-auto max-w-[85%]" 
        : "bg-card max-w-[85%] shadow-card"
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
        <div className="text-sm text-foreground/90">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
