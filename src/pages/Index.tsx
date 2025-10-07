import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";
import { SubjectSelector } from "@/components/SubjectSelector";
import { RioCharacter } from "@/components/RioCharacter";
import { VoiceControls } from "@/components/VoiceControls";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I'm Rio Futaba. I can help you with Science, History, Math, English, or Coding/Debugging. What do you need help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("science");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { isRecording, toggleRecording } = useVoiceRecorder();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playAudio = async (text: string) => {
    if (!voiceEnabled) {
      console.log("Voice disabled, skipping audio");
      return;
    }

    try {
      console.log("Starting audio playback for text:", text.substring(0, 50));
      setIsSpeaking(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("TTS response error:", errorData);
        throw new Error(errorData.error || "TTS failed");
      }

      const data = await response.json();
      console.log("Received audio data, creating audio element");
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audioRef.current = audio;
      
      audio.onended = () => {
        console.log("Audio playback ended");
        setIsSpeaking(false);
      };
      
      audio.onerror = (e) => {
        console.error("Audio element error:", e);
        setIsSpeaking(false);
        toast({
          title: "Audio Error",
          description: "Failed to play audio. Check console for details.",
          variant: "destructive",
        });
      };
      
      console.log("Starting audio playback");
      await audio.play();
      console.log("Audio playing successfully");
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsSpeaking(false);
      toast({
        title: "Audio Error",
        description: error instanceof Error ? error.message : "Failed to play audio",
        variant: "destructive",
      });
    }
  };

  const handleVoiceInput = async () => {
    try {
      const audioData = await toggleRecording();
      
      if (!audioData) return; // Started recording

      // Transcribe audio
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-to-text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ audio: audioData }),
        }
      );

      if (!response.ok) throw new Error("Transcription failed");

      const data = await response.json();
      setInput(data.text);
      setIsLoading(false);

      toast({
        title: "Transcribed",
        description: "Your voice message has been converted to text.",
      });
    } catch (error) {
      console.error("Voice input error:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to process voice input",
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

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
      
      // Play audio response
      if (voiceEnabled) {
        await playAudio(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Rio Futaba AI Helper
              </h1>
              <p className="text-sm text-muted-foreground">
                Your analytical study companion
              </p>
            </div>
            <VoiceControls
              isRecording={isRecording}
              onToggleRecording={handleVoiceInput}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              disabled={isLoading}
            />
          </div>
          <SubjectSelector selected={selectedSubject} onSelect={setSelectedSubject} />
        </div>
      </header>

      {/* Main content with animated character */}
      <main className="flex-1 overflow-hidden flex">
        {/* Character panel - desktop */}
        <div className="hidden md:flex w-1/3 lg:w-1/4 items-center justify-center p-4 border-r border-border bg-gradient-to-b from-card/30 to-transparent">
          <RioCharacter 
            isSpeaking={isSpeaking} 
            isThinking={isLoading}
            className="w-full max-w-sm rio-character-container" 
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl mx-auto px-4 py-6 space-y-4">
            {/* Mobile character - shows at top */}
            <div className="md:hidden mb-6 flex justify-center">
              <RioCharacter 
                isSpeaking={isSpeaking} 
                isThinking={isLoading}
                className="w-64 rio-character-container" 
              />
            </div>
            
            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 rounded-lg bg-card max-w-[80%] shadow-card">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-foreground animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1 text-foreground">Rio Futaba</p>
                  <p className="text-sm text-muted-foreground">Analyzing your question...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              disabled={isLoading || isRecording}
              className="flex-1 bg-background/50 border-border focus:border-primary transition-colors"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || isRecording}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
