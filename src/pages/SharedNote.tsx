import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Tag, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[] | null;
  created_at: string;
}

export default function SharedNote() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadSharedNote();
  }, [shareCode]);

  const loadSharedNote = async () => {
    if (!shareCode) {
      setError(true);
      setLoading(false);
      return;
    }

    try {
      // Get the shared note
      const { data: sharedData, error: sharedError } = await supabase
        .from("shared_notes")
        .select("note_id, view_count")
        .eq("share_code", shareCode)
        .single();

      if (sharedError || !sharedData) {
        setError(true);
        setLoading(false);
        return;
      }

      // Get the actual note
      const { data: noteData, error: noteError } = await supabase
        .from("study_notes")
        .select("*")
        .eq("id", sharedData.note_id)
        .single();

      if (noteError || !noteData) {
        setError(true);
        setLoading(false);
        return;
      }

      setNote(noteData);

      // Increment view count
      await supabase
        .from("shared_notes")
        .update({ view_count: (sharedData.view_count || 0) + 1 })
        .eq("share_code", shareCode);

      setLoading(false);
    } catch (err) {
      console.error("Error loading shared note:", err);
      setError(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Note Not Found</CardTitle>
            <CardDescription>
              This shared note doesn&apos;t exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Shared Note</h1>
            <p className="text-sm text-muted-foreground">Read-only view</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{note.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Shared on {new Date(note.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant="secondary">{note.subject}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground">{note.content}</p>
            </div>
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-2 mt-6 flex-wrap pt-6 border-t">
                <span className="text-sm text-muted-foreground font-medium">Tags:</span>
                {note.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4 bg-accent/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Want to create your own study notes?
              </p>
              <Button onClick={() => navigate("/")}>
                Try Rio Futaba Study Bot
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
