import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";
import { SubjectSelector } from "@/components/SubjectSelector";
import { FeaturesPanel } from "@/components/FeaturesPanel";
import { AutoNoteCapture } from "@/components/AutoNoteCapture";
import { Send, Loader2, Mic, MicOff, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { messageSchema } from "@/lib/validation";
import { useIsIOS } from "@/hooks/use-ios";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import type { User, Session } from "@supabase/supabase-js";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("physics");
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [isThinking, setIsThinking] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isIOS = useIsIOS();
  const { isRecording, transcript, startRecording, stopRecording, clearTranscript } = useVoiceRecording();

  // Auth check and initialization
  useEffect(() => {
    // Set up auth listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        // Defer Supabase calls with setTimeout to avoid deadlock
        setTimeout(() => {
          loadUserPreferences(session.user.id);
          createInitialConversation(session.user.id);
        }, 0);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        loadUserPreferences(session.user.id);
        createInitialConversation(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

  const handleVoiceToggle = async () => {
    if (isRecording) {
      stopRecording();
      toast({
        title: "Recording Stopped",
        description: "Processing your audio and capturing notes...",
      });
    } else {
      clearTranscript();
      await startRecording();
    }
  };

  const handleTextToSpeech = async (text: string) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      setIsSpeaking(true);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'nova' }
      });

      if (error) throw error;

      // Create audio element and play
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        setCurrentAudio(null);
        toast({
          title: "Playback Error",
          description: "Failed to play audio",
          variant: "destructive",
        });
      };

      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      toast({
        title: "Text-to-Speech Error",
        description: error instanceof Error ? error.message : "Failed to convert text to speech",
        variant: "destructive",
      });
    }
  };

  const stopSpeaking = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsSpeaking(false);
  };



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      toast({
        title: "Image Uploaded",
        description: "Image ready to analyze. Type a question or click send to detect problems.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if ((!input.trim() && !uploadedImage) || isLoading || !currentConversationId || !user) return;

    // Validate input
    try {
      messageSchema.parse(input);
    } catch (error: any) {
      toast({
        title: "Invalid Message",
        description: error.errors?.[0]?.message || "Message validation failed",
        variant: "destructive",
      });
      return;
    }

    const messageText = input || "Please analyze this image and solve any problems you can detect.";
    const userMessage: Message = { 
      role: "user", 
      content: messageText,
      imageUrl: uploadedImage || undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const currentImage = uploadedImage;
    setUploadedImage(null);
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
      // Build message content with image if present
      const userContent = currentImage 
        ? [
            { type: "text", text: `[Subject: ${selectedSubject}] ${messageText}` },
            { type: "image_url", image_url: { url: currentImage } }
          ]
        : `[Subject: ${selectedSubject}] ${messageText}`;

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
              ...messages.map((m) => ({ 
                role: m.role, 
                content: m.imageUrl 
                  ? [
                      { type: "text", text: m.content },
                      { type: "image_url", image_url: { url: m.imageUrl } }
                    ]
                  : m.content 
              })),
              { role: "user", content: userContent },
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
    return null; // Will redirect to auth
  }

  return (
    <div className={`min-h-screen bg-gradient-secondary flex flex-col ${isIOS ? 'ios-optimized' : ''}`}>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className={`container max-w-6xl mx-auto px-4 ${isIOS ? 'py-2' : 'py-3 md:py-4'}`}>
          <div className={`flex items-center justify-between gap-2 ${isIOS ? 'mb-2' : 'mb-3 md:mb-4'}`}>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Rio Futaba Study Bot
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <FeaturesPanel
                userId={user.id}
                subject={selectedSubject}
                selectedModel={selectedModel}
                currentConversationId={currentConversationId}
                onModelChange={setSelectedModel}
                onSelectConversation={loadConversation}
                onNewConversation={() => createInitialConversation(user.id)}
                onExport={exportConversation}
                onSignOut={handleSignOut}
                isIOS={isIOS}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SubjectSelector selected={selectedSubject} onSelect={setSelectedSubject} />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              role={message.role} 
              content={message.content}
              imageUrl={message.imageUrl}
              onSpeak={message.role === 'assistant' ? () => handleTextToSpeech(message.content) : undefined}
              isSpeaking={isSpeaking}
            />
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
      </main>

      <footer className={`border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0 ${isIOS ? 'pb-safe' : ''}`}>
        <div className="container max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex gap-2">
            <Button
              onClick={handleVoiceToggle}
              variant={isRecording ? "default" : "outline"}
              size="icon"
              className={`shrink-0 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}
              title={isRecording ? "Stop recording" : "Start voice recording"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="icon"
              className={`shrink-0 ${uploadedImage ? 'border-primary bg-primary/10' : ''}`}
              title="Upload image to analyze"
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                uploadedImage 
                  ? "Ask about the image or just click send..." 
                  : isRecording 
                    ? "Recording... speak now" 
                    : "Ask me anything about your studies..."
              }
              disabled={isLoading}
              className={`flex-1 bg-background/50 border-border focus:border-primary transition-colors ${isIOS ? 'text-lg' : 'text-base'}`}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !uploadedImage)}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {uploadedImage && (
            <div className="mt-2 relative inline-block">
              <img src={uploadedImage} alt="Upload preview" className="h-20 rounded border border-border" />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center mt-2">
            Using: {selectedModel.split("/")[1]}
            {isRecording && " • Recording & Taking Notes"}
          </p>
        </div>
      </footer>

      <AutoNoteCapture
        userId={user.id}
        subject={selectedSubject}
        conversationText={transcript}
        isActive={isRecording}
      />
    </div>
  );
};

export default Index;
