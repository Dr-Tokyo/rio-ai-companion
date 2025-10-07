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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, BookMarked, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StudyProgressProps {
  userId: string;
}

interface Stats {
  totalStudyTime: number;
  totalFlashcards: number;
  totalQuizzes: number;
  averageQuizScore: number;
}

export const StudyProgress = ({ userId }: StudyProgressProps) => {
  const [stats, setStats] = useState<Stats>({
    totalStudyTime: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    averageQuizScore: 0,
  });

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    // Get total study time
    const { data: sessions } = await supabase
      .from("study_sessions")
      .select("duration_minutes")
      .eq("user_id", userId);

    const totalStudyTime = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

    // Get flashcard count
    const { count: flashcardCount } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get quiz stats
    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("score, total_questions")
      .eq("user_id", userId)
      .not("score", "is", null);

    const totalQuizzes = quizzes?.length || 0;
    const averageQuizScore =
      totalQuizzes > 0
        ? quizzes.reduce((sum, q) => sum + ((q.score || 0) / q.total_questions) * 100, 0) / totalQuizzes
        : 0;

    setStats({
      totalStudyTime,
      totalFlashcards: flashcardCount || 0,
      totalQuizzes,
      averageQuizScore,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <TrendingUp className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Study Progress</DialogTitle>
          <DialogDescription>
            Track your learning journey
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudyTime} min</div>
              <p className="text-xs text-muted-foreground">
                Total time invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flashcards</CardTitle>
              <BookMarked className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFlashcards}</div>
              <p className="text-xs text-muted-foreground">
                Cards created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                Practice sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Quiz Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageQuizScore.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                Performance rate
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
