import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  BookOpen, 
  MessageCircle, 
  Lightbulb, 
  Video, 
  FileText,
  Send,
  Search,
  Sparkles,
  GraduationCap,
  Timer,
  Brain,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Help() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmitQuestion = () => {
    if (!question || !email) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Question submitted!",
      description: "We'll get back to you within 24 hours",
    });
    setQuestion("");
    setEmail("");
  };

  const faqs = [
    {
      question: "How do I start a study session?",
      answer: "Click the Timer icon in the header, select your subject, and press 'Start Session'. Rio will track your study time and save it to your progress dashboard."
    },
    {
      question: "What AI models are available?",
      answer: "Rio supports multiple AI models including Google Gemini 2.5 Pro, Flash, and Flash Lite (all FREE), plus OpenAI GPT-5 variants and Claude Sonnet 4. You can change models in Settings."
    },
    {
      question: "How do flashcards work?",
      answer: "Create flashcards by clicking the flashcard icon. Add a question (front) and answer (back). Rio uses spaced repetition to help you review cards at optimal intervals for maximum retention."
    },
    {
      question: "Can I generate quizzes automatically?",
      answer: "Yes! Click the quiz icon, enter a topic, and Rio will generate a custom quiz with multiple-choice questions. Your scores are tracked in Study Progress."
    },
    {
      question: "How do I export my conversations?",
      answer: "You can export individual conversations by clicking the export button in the conversation menu, or export all your data from Settings → General → Export My Data."
    },
    {
      question: "Is my data private and secure?",
      answer: "Absolutely! All your conversations, flashcards, and study data are protected with Row Level Security (RLS). Only you can access your information."
    },
    {
      question: "How do I change the theme?",
      answer: "Go to Settings → Display → Theme and choose between Light, Dark, or System (auto). You can also adjust font size, contrast, and message density."
    },
    {
      question: "What keyboard shortcuts are available?",
      answer: "Press Ctrl+K (or Cmd+K on Mac) to quickly search conversations. Press Enter to send messages. You can enable/disable shortcuts in Settings → Accessibility."
    },
  ];

  const tips = [
    {
      icon: Brain,
      title: "Use Active Recall",
      description: "Instead of just reading Rio's responses, try to explain concepts back in your own words. This strengthens memory."
    },
    {
      icon: Timer,
      title: "Pomodoro Technique",
      description: "Study in 25-minute focused sessions with 5-minute breaks. Use the Study Timer to track your sessions."
    },
    {
      icon: Sparkles,
      title: "Ask Follow-Up Questions",
      description: "Rio remembers your conversation context. Ask 'Can you explain that differently?' or 'Give me an example' for deeper understanding."
    },
    {
      icon: GraduationCap,
      title: "Create Flashcards from Chats",
      description: "When Rio explains a concept well, immediately create a flashcard to review it later using spaced repetition."
    },
    {
      icon: Zap,
      title: "Use Subject Filters",
      description: "Organize conversations by subject (Math, Science, Languages, etc.) to easily find past discussions."
    },
    {
      icon: BookOpen,
      title: "Review Study Progress Weekly",
      description: "Check your Study Progress dashboard every week to see trends, identify gaps, and celebrate achievements."
    },
  ];

  const guides = [
    {
      title: "Getting Started with Rio",
      description: "Learn the basics of chatting with Rio and organizing your study materials",
      icon: BookOpen,
      link: "#"
    },
    {
      title: "Mastering Flashcards",
      description: "Advanced techniques for creating effective flashcards and using spaced repetition",
      icon: Brain,
      link: "#"
    },
    {
      title: "Quiz Generation Guide",
      description: "How to generate comprehensive quizzes and interpret your results",
      icon: GraduationCap,
      link: "#"
    },
    {
      title: "Study Timer Best Practices",
      description: "Optimize your focus and productivity with effective time management",
      icon: Timer,
      link: "#"
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Help & Support</h1>
            <p className="text-sm text-muted-foreground">Everything you need to succeed with Rio</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="faq">
              <MessageCircle className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="guides">
              <BookOpen className="w-4 h-4 mr-2" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="tips">
              <Lightbulb className="w-4 h-4 mr-2" />
              Study Tips
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Send className="w-4 h-4 mr-2" />
              Ask a Question
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No FAQs found matching "{searchQuery}"
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {guides.map((guide, index) => (
                <Card key={index} className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <guide.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{guide.title}</CardTitle>
                        <CardDescription>{guide.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card className="bg-accent/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  <CardTitle>Video Tutorials</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Watch step-by-step video tutorials to master Rio's features
                </p>
                <Button variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  Browse Videos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/10 to-accent/50 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Expert Study Tips from Rio
                </CardTitle>
                <CardDescription>
                  Science-backed techniques to maximize your learning efficiency
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <tip.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base mb-2">{tip.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {tip.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ask Rio Support a Question</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a question and we'll respond within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Your Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="question" className="text-sm font-medium">
                    Your Question
                  </label>
                  <Textarea
                    id="question"
                    placeholder="What would you like to know?"
                    rows={6}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>

                <Button onClick={handleSubmitQuestion} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Question
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-accent/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Additional Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Community Forum
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Tutorial Videos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
