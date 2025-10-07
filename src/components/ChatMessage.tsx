import { cn } from "@/lib/utils";
import { User, Bot, Copy, Check, Volume2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

export const ChatMessage = ({ role, content, imageUrl, onSpeak, isSpeaking }: ChatMessageProps) => {
  const isUser = role === "user";
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };
  
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
      const codeBlockIndex = key;
      parts.push(
        <div key={`code-${key++}`} className="my-2 rounded-lg overflow-hidden border border-border relative group">
          <div className="bg-muted px-3 py-1.5 text-xs text-muted-foreground border-b border-border flex items-center justify-between">
            <span className="font-medium">{language}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => copyToClipboard(code, codeBlockIndex)}
            >
              {copiedIndex === codeBlockIndex ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
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
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-foreground">
            {isUser ? "You" : "Rio Futaba"}
          </p>
          {!isUser && onSpeak && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSpeak}
              disabled={isSpeaking}
              className="h-6 px-2 opacity-60 hover:opacity-100 transition-opacity"
              title="Read aloud"
            >
              <Volume2 className={cn("w-3 h-3", isSpeaking && "animate-pulse text-primary")} />
            </Button>
          )}
        </div>
        {imageUrl && (
          <img src={imageUrl} alt="Uploaded" className="max-w-xs rounded border border-border my-2" />
        )}
        <div className="text-sm text-foreground/90">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
