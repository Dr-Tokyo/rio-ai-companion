import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
}

interface QuizGeneratorProps {
  userId: string;
  subject: string;
}

export const QuizGenerator = ({ userId, subject }: QuizGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const generateQuiz = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
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
              {
                role: "user",
                content: `Generate a quiz with 5 multiple choice questions about ${topic} for ${subject}. Format your response as JSON: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]}. Only return the JSON, no other text.`,
              },
            ],
            model: "google/gemini-2.5-flash",
          }),
        }
      );

      const data = await response.json();
      const quizData = JSON.parse(data.message);
      setQuestions(quizData.questions);
      setCurrentQuestion(0);
      setQuizComplete(false);
    } catch (error) {
      toast({
        title: "Failed to generate quiz",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestion].userAnswer = answerIndex;
    setQuestions(updatedQuestions);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitQuiz = async () => {
    const finalScore = questions.reduce(
      (acc, q) => acc + (q.userAnswer === q.correctAnswer ? 1 : 0),
      0
    );
    setScore(finalScore);
    setQuizComplete(true);

    await supabase.from("quizzes").insert({
      user_id: userId,
      subject: subject,
      title: topic,
      questions: questions as any,
      score: finalScore,
      total_questions: questions.length,
      completed_at: new Date().toISOString(),
    });

    toast({
      title: "Quiz completed!",
      description: `You scored ${finalScore}/${questions.length}`,
    });
  };

  const resetQuiz = () => {
    setQuestions([]);
    setTopic("");
    setCurrentQuestion(0);
    setQuizComplete(false);
    setScore(0);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <GraduationCap className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quiz Generator</DialogTitle>
          <DialogDescription>
            Test your knowledge with AI-generated quizzes
          </DialogDescription>
        </DialogHeader>

        {questions.length === 0 ? (
          <div className="space-y-4">
            <div>
              <Label>Quiz Topic</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={`e.g., Newton's Laws, Photosynthesis, World War II...`}
              />
            </div>

            <Button 
              onClick={generateQuiz} 
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-gradient-primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </div>
        ) : quizComplete ? (
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-primary">
              {score}/{questions.length}
            </div>
            <p className="text-xl">
              {score === questions.length
                ? "Perfect score! 🎉"
                : score >= questions.length * 0.7
                ? "Great job! 👏"
                : "Keep practicing! 💪"}
            </p>
            <Button onClick={resetQuiz} className="w-full">
              Take Another Quiz
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Question {currentQuestion + 1} of {questions.length}
              </p>
              <h3 className="text-lg font-medium mb-4">
                {questions[currentQuestion]?.question}
              </h3>

              <RadioGroup
                value={questions[currentQuestion]?.userAnswer?.toString()}
                onValueChange={(value) => handleAnswer(parseInt(value))}
              >
                {questions[currentQuestion]?.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-2">
              {currentQuestion < questions.length - 1 ? (
                <Button 
                  onClick={nextQuestion}
                  disabled={questions[currentQuestion]?.userAnswer === undefined}
                  className="flex-1"
                >
                  Next Question
                </Button>
              ) : (
                <Button 
                  onClick={submitQuiz}
                  disabled={questions[currentQuestion]?.userAnswer === undefined}
                  className="flex-1 bg-gradient-primary"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
