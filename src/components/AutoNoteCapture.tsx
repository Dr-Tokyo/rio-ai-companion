import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2 } from "lucide-react";

interface AutoNoteCaptureProps {
  userId: string;
  subject: string;
  conversationText: string;
  isActive: boolean;
}

export const AutoNoteCapture = ({ userId, subject, conversationText, isActive }: AutoNoteCaptureProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isActive || !conversationText.trim()) return;

    const captureNotes = async () => {
      setIsProcessing(true);
      try {
        // Call AI to extract key points from conversation
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
                {
                  role: "user",
                  content: `Extract key study notes from this conversation. Format as concise bullet points. Conversation: ${conversationText}`,
                },
              ],
              model: "google/gemini-2.5-flash",
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to generate notes");

        const data = await response.json();
        
        // Save auto-generated note
        const { error } = await supabase.from("notes").insert({
          user_id: userId,
          title: `Auto-captured Notes: ${subject} - ${new Date().toLocaleDateString()}`,
          content: data.message,
          subject: subject,
          tags: ["auto-generated", subject],
        });

        if (error) throw error;

        toast({
          title: "Notes Captured",
          description: "AI automatically saved study notes from your conversation",
        });
      } catch (error) {
        console.error("Auto-note capture error:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Debounce - capture notes after 5 seconds of conversation
    const timer = setTimeout(captureNotes, 5000);
    return () => clearTimeout(timer);
  }, [conversationText, isActive, userId, subject, toast]);

  if (!isActive || !isProcessing) return null;

  return (
    <div className="fixed bottom-20 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-glow flex items-center gap-2 text-sm">
      <Loader2 className="w-4 h-4 animate-spin text-primary" />
      <BookOpen className="w-4 h-4 text-primary" />
      <span className="text-muted-foreground">AI capturing notes...</span>
    </div>
  );
};
