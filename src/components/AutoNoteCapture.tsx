import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2, Check, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AutoNoteCaptureProps {
  userId: string;
  subject: string;
  conversationText: string;
  isActive: boolean;
}

interface CapturedNote {
  timestamp: string;
  summary: string;
  keyPoints: string[];
}

export const AutoNoteCapture = ({ userId, subject, conversationText, isActive }: AutoNoteCaptureProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedNotes, setCapturedNotes] = useState<CapturedNote[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isActive || !conversationText.trim()) return;

    const captureNotes = async () => {
      setIsProcessing(true);
      try {
        console.log('Starting real-time note capture:', conversationText.slice(0, 100));
        
        // Call AI to extract structured notes like NoteGPT
        const { data, error } = await supabase.functions.invoke('chat-rio', {
          body: {
            messages: [
              {
                role: "user",
                content: `You are a note-taking assistant like NoteGPT. Extract structured study notes from this conversation.

Format your response as JSON with this structure:
{
  "summary": "Brief 1-sentence summary of the main topic",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}

Focus on:
- Important concepts and definitions
- Problem-solving steps
- Formulas and equations
- Examples and applications

Conversation: ${conversationText}`,
              },
            ],
            model: "google/gemini-2.5-flash",
          },
        });

        if (error) throw error;
        if (!data?.message) throw new Error("No notes generated");
        
        // Parse AI response
        let parsedNote;
        try {
          parsedNote = JSON.parse(data.message);
        } catch {
          // Fallback if not JSON
          parsedNote = {
            summary: "Study notes captured",
            keyPoints: [data.message]
          };
        }

        const newNote: CapturedNote = {
          timestamp: new Date().toLocaleTimeString(),
          summary: parsedNote.summary,
          keyPoints: parsedNote.keyPoints
        };

        setCapturedNotes(prev => [...prev, newNote]);
        setShowPreview(true);
        setIsSaved(false);
        
        console.log('Real-time note captured:', newNote);
      } catch (error) {
        console.error("Auto-note capture error:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    // Capture notes every 30 seconds during active conversation
    const timer = setTimeout(captureNotes, 30000);
    return () => clearTimeout(timer);
  }, [conversationText, isActive, userId, subject, toast]);

  const handleSaveNotes = async () => {
    if (capturedNotes.length === 0) return;

    try {
      const consolidatedContent = capturedNotes.map((note, idx) => 
        `## ${note.timestamp}\n**${note.summary}**\n\n${note.keyPoints.map(point => `- ${point}`).join('\n')}`
      ).join('\n\n---\n\n');

      const { error } = await supabase.from("study_notes").insert({
        user_id: userId,
        title: `${subject} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        content: consolidatedContent,
        subject: subject,
        tags: ["auto-captured", subject, "timestamped"],
      });

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "Notes Saved ✓",
        description: `${capturedNotes.length} timestamped notes saved to your library`,
      });

      setTimeout(() => {
        setShowPreview(false);
        setCapturedNotes([]);
      }, 2000);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  const handleCopyNotes = () => {
    const text = capturedNotes.map(note => 
      `[${note.timestamp}] ${note.summary}\n${note.keyPoints.map(p => `• ${p}`).join('\n')}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Notes copied for easy pasting",
    });
  };

  if (!isActive) return null;

  return (
    <>
      {/* Processing indicator */}
      {isProcessing && (
        <div className="fixed bottom-20 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-bottom-2 z-50">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Capturing notes...</span>
        </div>
      )}

      {/* Real-time notes preview panel (like NoteGPT) */}
      {showPreview && capturedNotes.length > 0 && (
        <Card className="fixed bottom-20 right-4 w-96 max-h-[500px] shadow-2xl border-2 border-primary/20 animate-in slide-in-from-bottom-4 z-50">
          <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-primary/10">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">Captured Notes ({capturedNotes.length})</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowPreview(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-[300px] p-4">
            <div className="space-y-4">
              {capturedNotes.map((note, idx) => (
                <div key={idx} className="border-l-2 border-primary/50 pl-3 py-1">
                  <div className="text-xs text-muted-foreground mb-1">{note.timestamp}</div>
                  <div className="font-medium text-sm mb-2">{note.summary}</div>
                  <ul className="space-y-1">
                    {note.keyPoints.map((point, pidx) => (
                      <li key={pidx} className="text-xs text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-border flex gap-2 bg-card/50">
            <Button
              onClick={handleCopyNotes}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button
              onClick={handleSaveNotes}
              size="sm"
              className="flex-1"
              disabled={isSaved}
            >
              {isSaved ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Saved
                </>
              ) : (
                <>
                  <BookOpen className="w-3 h-3 mr-1" />
                  Save to Notes
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};
