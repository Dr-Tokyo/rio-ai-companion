import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Timer, Play, Pause, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudyTimerProps {
  userId: string;
  subject: string;
}

export const StudyTimer = ({ userId, subject }: StudyTimerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const sec = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startSession = async () => {
    const { data, error } = await supabase
      .from("study_sessions")
      .insert({
        user_id: userId,
        subject: subject,
        duration_minutes: 0,
      })
      .select()
      .single();

    if (data && !error) {
      setSessionId(data.id);
      setIsRunning(true);
      toast({
        title: "Study session started",
        description: "Focus time begins now!",
      });
    }
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const endSession = async () => {
    if (!sessionId) return;

    const minutes = Math.floor(seconds / 60);
    await supabase
      .from("study_sessions")
      .update({
        duration_minutes: minutes,
        ended_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    toast({
      title: "Study session completed",
      description: `You studied for ${minutes} minutes!`,
    });

    setIsRunning(false);
    setSeconds(0);
    setSessionId(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Timer className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Study Timer</DialogTitle>
          <DialogDescription>
            Track your study time for {subject.replace(/-/g, ' ')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="text-6xl font-bold font-mono mb-4">
              {formatTime(seconds)}
            </div>
            {sessionId && (
              <p className="text-sm text-muted-foreground">
                Session in progress
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-center">
            {!sessionId ? (
              <Button onClick={startSession} className="bg-gradient-primary">
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button onClick={pauseSession} variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button onClick={() => setIsRunning(true)} variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
                <Button onClick={endSession} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  End Session
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
