import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  conversation_id: string;
  conversation_title: string;
  message_content: string;
  message_role: string;
  created_at: string;
}

interface ConversationSearchProps {
  userId: string;
  onSelectConversation: (conversationId: string) => void;
}

export const ConversationSearch = ({ userId, onSelectConversation }: ConversationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Get user's conversations
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id, title")
        .eq("user_id", userId);

      if (!conversations) {
        setSearchResults([]);
        return;
      }

      const conversationIds = conversations.map(c => c.id);

      // Search messages
      const { data: messages } = await supabase
        .from("messages")
        .select("conversation_id, content, role, created_at")
        .in("conversation_id", conversationIds)
        .ilike("content", `%${searchQuery}%`)
        .limit(20);

      if (messages) {
        const results: SearchResult[] = messages.map(msg => ({
          conversation_id: msg.conversation_id,
          conversation_title: conversations.find(c => c.id === msg.conversation_id)?.title || "Untitled",
          message_content: msg.content,
          message_role: msg.role,
          created_at: msg.created_at,
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Failed to search conversations",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (conversationId: string) => {
    onSelectConversation(conversationId);
    setOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Search className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Search Conversations</DialogTitle>
          <DialogDescription>
            Search through your conversation history
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {searchResults.length === 0 && searchQuery && !isSearching && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No results found
            </p>
          )}
          {searchResults.map((result, index) => (
            <div
              key={index}
              onClick={() => handleResultClick(result.conversation_id)}
              className="p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">{result.conversation_title}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(result.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {result.message_role === "user" ? "You: " : "Rio: "}
                {result.message_content}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
