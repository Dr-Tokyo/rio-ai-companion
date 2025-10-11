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
        console.log('Starting note capture for:', conversationText.slice(0, 100));
        
        // Call AI to extract key points from conversation
        const { data, error } = await supabase.functions.invoke('chat-rio', {
          body: {
            messages: [
              {
                role: "user",
                content: `Extract key study notes from this conversation. Format as clear, organized bullet points with main topics and subtopics. Focus on important concepts, definitions, and explanations. Conversation: ${conversationText}`,
              },
            ],
            model: "google/gemini-2.5-flash",
          },
        });

        if (error) {
          console.error('AI response error:', error);
          throw error;
        }

        if (!data?.message) {
          throw new Error("No notes generated from AI");
        }
        
        console.log('AI generated notes:', data.message?.slice(0, 100));
        
        // Save auto-generated note to the notes table
        const { error: insertError } = await supabase.from("notes").insert({
          user_id: userId,
          title: `Auto-Notes: ${subject} - ${new Date().toLocaleDateString()}`,
          content: data.message,
          subject: subject,
          tags: ["auto-generated", subject, "voice-notes"],
        });

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw insertError;
        }

        toast({
          title: "Notes Saved",
          description: "AI automatically captured and saved your study notes",
        });
      } catch (error) {
        console.error("Auto-note capture error:", error);
        toast({
          title: "Note Capture Failed",
          description: error instanceof Error ? error.message : "Failed to capture notes",
          variant: "destructive",
        });
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
    <div className="fixed bottom-20 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-bottom-2">
      <Loader2 className="w-4 h-4 animate-spin text-primary" />
      <BookOpen className="w-4 h-4 text-primary" />
      <span className="text-muted-foreground">AI capturing notes to Notes tab...</span>
    </div>
  );
};
