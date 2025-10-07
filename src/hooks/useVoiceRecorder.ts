import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder) {
        reject(new Error("No active recording"));
        return;
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(",")[1];
          resolve(base64Audio);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);

        // Clean up
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.stop();
    });
  };

  const toggleRecording = async (): Promise<string | null> => {
    if (isRecording) {
      return await stopRecording();
    } else {
      await startRecording();
      return null;
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    toggleRecording,
  };
};
