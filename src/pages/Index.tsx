import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";
import { SubjectSelector } from "@/components/SubjectSelector";
import { RioCharacter } from "@/components/RioCharacter";
import { Settings } from "@/components/Settings";
import { ConversationList } from "@/components/ConversationList";
import { ConversationSearch } from "@/components/ConversationSearch";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { StudyTimer } from "@/components/StudyTimer";
import { FlashcardManager } from "@/components/FlashcardManager";
import { QuizGenerator } from "@/components/QuizGenerator";
import { StudyProgress } from "@/components/StudyProgress";
import { Send, Loader2, LogOut, Download, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ADMIN_EMAIL = "admin@rio.ai";
const ADMIN_PASSWORD = "admin123";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("physics");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [isThinking, setIsThinking] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-login admin
  useEffect(() => {
    const autoLoginAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log("No session found, attempting admin auto-login...");
        const { data, error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });

        if (error) {
          console.error("Admin auto-login failed:", error);
          navigate("/auth");
        } else {
          console.log("Admin auto-logged in successfully");
        }
      }
    };

    autoLoginAdmin();
  }, []);

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
            loadUserPreferences(session.user.id);
            createInitialConversation(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
        loadUserPreferences(session.user.id);
        createInitialConversation(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

  const loadUserPreferences = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("preferred_model")
      .eq("user_id", userId)
      .maybeSingle();

    if (data?.preferred_model) {
      setSelectedModel(data.preferred_model);
    }
  };

  const createInitialConversation = async (userId: string) => {
    const { data: existingConvs } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!existingConvs || existingConvs.length === 0) {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          title: "New Conversation",
          subject: "physics",
        })
        .select()
        .single();

      if (newConv) {
        setCurrentConversationId(newConv.id);
        const welcomeMessage = "I'm Rio Futaba. I can help you with Physics, Chemistry, Biology, Mathematics, Programming, Languages, History, and more. What do you need help with?";
        
        await supabase.from("messages").insert({
          conversation_id: newConv.id,
          role: "assistant",
          content: welcomeMessage,
        });
        
        setMessages([{
          role: "assistant",
          content: welcomeMessage,
        }]);
      }
    } else {
      loadConversation(existingConvs[0].id);
    }
  };

  const loadConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    
    // Load conversation details
    const { data: conv } = await supabase
      .from("conversations")
      .select("subject")
      .eq("id", conversationId)
      .single();
    
    if (conv?.subject) {
      setSelectedSubject(conv.subject);
    }
    
    // Load messages
    const { data } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data as Message[]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const handleSend = async () => {
    if (!input.trim() || isLoading || !user || !currentConversationId) return;

    const userMessage: Message = { role: "user", content: input };
    const messageText = input;

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsThinking(true);

    // Save user message to database
    await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      role: "user",
      content: messageText,
    });

    // Update conversation updated_at and subject
    await supabase
      .from("conversations")
      .update({ 
        updated_at: new Date().toISOString(),
        subject: selectedSubject,
      })
      .eq("id", currentConversationId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-rio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: `[Subject: ${selectedSubject}] ${input}` },
            ],
            model: selectedModel,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message to database
      await supabase.from("messages").insert({
        conversation_id: currentConversationId,
        role: "assistant",
        content: data.message,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const exportConversation = () => {
    const exportData = {
      conversation_id: currentConversationId,
      subject: selectedSubject,
      model: selectedModel,
      messages: messages,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rio-conversation-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Conversation downloaded as JSON",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Rio Futaba Study Bot
              </h1>
              {isAdmin && <Crown className="w-5 h-5 text-yellow-500" />}
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <>
                  <StudyProgress userId={user.id} />
                  <StudyTimer userId={user.id} subject={selectedSubject} />
                  <FlashcardManager userId={user.id} subject={selectedSubject} />
                  <QuizGenerator userId={user.id} subject={selectedSubject} />
                </>
              )}
              <Button variant="outline" size="icon" onClick={exportConversation}>
                <Download className="w-4 h-4" />
              </Button>
              {user && (
                <ConversationSearch
                  userId={user.id}
                  onSelectConversation={loadConversation}
                />
              )}
              {user && (
                <ConversationList
                  userId={user.id}
                  currentConversationId={currentConversationId}
                  onSelectConversation={loadConversation}
                  onNewConversation={() => createInitialConversation(user.id)}
                />
              )}
              {user && (
                <Settings
                  userId={user.id}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  isAdmin={isAdmin}
                />
              )}
              <Button variant="outline" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <KeyboardShortcutsHelp />
            <SubjectSelector selected={selectedSubject} onSelect={setSelectedSubject} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        <div className="hidden md:flex w-1/3 lg:w-1/4 items-center justify-center p-4 border-r border-border bg-gradient-to-b from-card/30 to-transparent">
          <RioCharacter 
            isSpeaking={false} 
            isThinking={isThinking}
            className="w-full max-w-sm rio-character-container" 
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl mx-auto px-4 py-6 space-y-4">
            <div className="md:hidden mb-6 flex justify-center">
              <RioCharacter 
                isSpeaking={false} 
                isThinking={isThinking}
                className="w-64 rio-character-container" 
              />
            </div>
            
            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 rounded-lg bg-card max-w-[85%] shadow-card">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-foreground animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1 text-foreground">Rio Futaba</p>
                  <p className="text-sm text-muted-foreground">Analyzing with {selectedModel.split("/")[1]}...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies or code..."
              disabled={isLoading}
              className="flex-1 bg-background/50 border-border focus:border-primary transition-colors"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Using: {selectedModel.split("/")[1]} {isAdmin && "• Admin Mode"}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
