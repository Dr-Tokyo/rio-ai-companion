import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Conversation {
  id: string;
  title: string;
  subject?: string;
  created_at: string;
}

interface ConversationListProps {
  userId: string;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export const ConversationList = ({
  userId,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (data) {
      setConversations(data);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (!error) {
      loadConversations();
      if (currentConversationId === id) {
        onNewConversation();
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MessageSquare className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Conversations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onNewConversation}>
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {conversations.map((conv) => (
          <DropdownMenuItem
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="flex justify-between items-center"
          >
            <div className="flex-1 truncate">
              <div className="font-medium truncate">{conv.title}</div>
              {conv.subject && (
                <div className="text-xs text-muted-foreground capitalize">{conv.subject.replace(/-/g, ' ')}</div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 ml-2"
              onClick={(e) => deleteConversation(conv.id, e)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </DropdownMenuItem>
        ))}
        
        {conversations.length === 0 && (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No conversations yet
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
