import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  Edit, 
  Share2, 
  Copy, 
  Check,
  X,
  Tag
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NoteManagerProps {
  userId: string;
  subject: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface SharedNote {
  id: string;
  share_code: string;
  note_id: string;
  created_at: string;
  view_count: number;
}

export const NoteManager = ({ userId, subject }: NoteManagerProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [currentShareCode, setCurrentShareCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadNotes();
      loadSharedNotes();
    }
  }, [isOpen, userId, subject]);

  const loadNotes = async () => {
    const { data, error } = await supabase
      .from("study_notes")
      .select("*")
      .eq("user_id", userId)
      .eq("subject", subject)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
  };

  const loadSharedNotes = async () => {
    const { data, error } = await supabase
      .from("shared_notes")
      .select("*")
      .eq("shared_by", userId);

    if (!error && data) {
      setSharedNotes(data);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }

    const tagsArray = newNote.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const { error } = await supabase.from("study_notes").insert({
      user_id: userId,
      title: newNote.title,
      content: newNote.content,
      subject: subject,
      tags: tagsArray.length > 0 ? tagsArray : null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Note created!",
        description: "Your note has been saved",
      });
      setNewNote({ title: "", content: "", tags: "" });
      loadNotes();
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    const tagsArray = editingNote.tags || [];

    const { error } = await supabase
      .from("study_notes")
      .update({
        title: editingNote.title,
        content: editingNote.content,
        tags: tagsArray,
      })
      .eq("id", editingNote.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Note updated!",
        description: "Your changes have been saved",
      });
      setEditingNote(null);
      loadNotes();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase
      .from("study_notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Note deleted",
        description: "Your note has been removed",
      });
      loadNotes();
    }
  };

  const handleShareNote = async (noteId: string) => {
    // Generate share code
    const { data: codeData, error: codeError } = await supabase
      .rpc("generate_share_code");

    if (codeError || !codeData) {
      toast({
        title: "Error",
        description: "Failed to generate share code",
        variant: "destructive",
      });
      return;
    }

    const shareCode = codeData as string;

    const { error } = await supabase.from("shared_notes").insert({
      note_id: noteId,
      share_code: shareCode,
      shared_by: userId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to share note",
        variant: "destructive",
      });
    } else {
      setCurrentShareCode(shareCode);
      setShareDialogOpen(true);
      loadSharedNotes();
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared/${currentShareCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteShare = async (shareId: string) => {
    const { error } = await supabase
      .from("shared_notes")
      .delete()
      .eq("id", shareId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete share",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Share removed",
        description: "This note is no longer shared",
      });
      loadSharedNotes();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <StickyNote className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Notes - {subject.replace(/-/g, " ")}</DialogTitle>
            <DialogDescription>
              Create, organize, and share your study notes
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="my-notes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-notes">My Notes</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>

            <TabsContent value="my-notes" className="space-y-4">
              <ScrollArea className="h-[500px] pr-4">
                {notes.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No notes yet. Create your first note!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <Card key={note.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{note.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {new Date(note.updated_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingNote(note)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleShareNote(note.id)}
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {note.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Title</Label>
                  <Input
                    id="note-title"
                    placeholder="Enter note title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note-content">Content</Label>
                  <Textarea
                    id="note-content"
                    placeholder="Write your notes here..."
                    rows={12}
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note-tags">Tags (comma separated)</Label>
                  <Input
                    id="note-tags"
                    placeholder="e.g. important, exam, chapter-5"
                    value={newNote.tags}
                    onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                  />
                </div>

                <Button onClick={handleCreateNote} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="shared" className="space-y-4">
              <ScrollArea className="h-[500px] pr-4">
                {sharedNotes.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      You haven&apos;t shared any notes yet
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {sharedNotes.map((share) => {
                      const note = notes.find(n => n.id === share.note_id);
                      return (
                        <Card key={share.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">
                                  {note?.title || "Note"}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  Share Code: <code className="bg-muted px-2 py-0.5 rounded">{share.share_code}</code>
                                </CardDescription>
                                <CardDescription className="text-xs mt-1">
                                  Views: {share.view_count} • Created: {new Date(share.created_at).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteShare(share.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingNote.title}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  rows={8}
                  value={editingNote.content}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, content: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateNote} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingNote(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Note</DialogTitle>
            <DialogDescription>
              Anyone with this link can view your note
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={`${window.location.origin}/shared/${currentShareCode}`}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyShareLink} size="icon">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Share Code:</p>
              <code className="text-lg font-bold">{currentShareCode}</code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
