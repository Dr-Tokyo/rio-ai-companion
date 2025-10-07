import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { BookMarked, Plus, Trash2, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
}

interface FlashcardManagerProps {
  userId: string;
  subject: string;
}

export const FlashcardManager = ({ userId, subject }: FlashcardManagerProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [showingFront, setShowingFront] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFlashcards();
  }, [userId, subject]);

  const loadFlashcards = async () => {
    const { data } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .eq("subject", subject)
      .order("created_at", { ascending: false });

    if (data) {
      setFlashcards(data);
      setCurrentIndex(0);
    }
  };

  const createFlashcard = async () => {
    if (!newFront.trim() || !newBack.trim()) return;

    const { error } = await supabase
      .from("flashcards")
      .insert({
        user_id: userId,
        subject: subject,
        front: newFront,
        back: newBack,
      });

    if (!error) {
      setNewFront("");
      setNewBack("");
      setIsCreating(false);
      loadFlashcards();
      toast({
        title: "Flashcard created",
        description: "Your new flashcard has been added",
      });
    }
  };

  const deleteFlashcard = async (id: string) => {
    await supabase.from("flashcards").delete().eq("id", id);
    loadFlashcards();
    toast({
      title: "Flashcard deleted",
      description: "The flashcard has been removed",
    });
  };

  const flipCard = () => setShowingFront(!showingFront);
  const nextCard = () => {
    setCurrentIndex((i) => (i + 1) % flashcards.length);
    setShowingFront(true);
  };
  const prevCard = () => {
    setCurrentIndex((i) => (i - 1 + flashcards.length) % flashcards.length);
    setShowingFront(true);
  };

  const currentCard = flashcards[currentIndex];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <BookMarked className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Flashcards - {subject.replace(/-/g, ' ')}</DialogTitle>
          <DialogDescription>
            Study with flashcards to reinforce your learning
          </DialogDescription>
        </DialogHeader>

        {!isCreating ? (
          <div className="space-y-4">
            {flashcards.length > 0 ? (
              <>
                <Card 
                  className="min-h-64 cursor-pointer hover:shadow-lg transition-all"
                  onClick={flipCard}
                >
                  <CardContent className="flex items-center justify-center h-64 p-8">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {showingFront ? "Question" : "Answer"}
                      </p>
                      <p className="text-2xl">
                        {showingFront ? currentCard?.front : currentCard?.back}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <Button onClick={prevCard} variant="outline" size="icon">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex gap-2 items-center">
                    <Button onClick={flipCard} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Flip
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {currentIndex + 1} / {flashcards.length}
                    </span>
                  </div>

                  <Button onClick={nextCard} variant="outline" size="icon">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setIsCreating(true)} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Flashcard
                  </Button>
                  <Button 
                    onClick={() => deleteFlashcard(currentCard.id)}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No flashcards yet</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Flashcard
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Front (Question)</label>
              <Textarea
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                placeholder="Enter the question or term..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Back (Answer)</label>
              <Textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder="Enter the answer or definition..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createFlashcard} className="flex-1">
                Create Flashcard
              </Button>
              <Button onClick={() => setIsCreating(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
