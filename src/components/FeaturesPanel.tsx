import { useState } from "react";
import { ChevronDown, ChevronUp, Download, LogOut, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StudyProgress } from "@/components/StudyProgress";
import { StudyTimer } from "@/components/StudyTimer";
import { NoteManager } from "@/components/NoteManager";
import { FlashcardManager } from "@/components/FlashcardManager";
import { QuizGenerator } from "@/components/QuizGenerator";
import { ConversationSearch } from "@/components/ConversationSearch";
import { ConversationList } from "@/components/ConversationList";
import { Settings } from "@/components/Settings";
import { useNavigate } from "react-router-dom";

interface FeaturesPanelProps {
  userId: string;
  subject: string;
  selectedModel: string;
  currentConversationId: string | null;
  onModelChange: (model: string) => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onExport: () => void;
  onSignOut: () => void;
  isIOS?: boolean;
}

export const FeaturesPanel = ({
  userId,
  subject,
  selectedModel,
  currentConversationId,
  onModelChange,
  onSelectConversation,
  onNewConversation,
  onExport,
  onSignOut,
  isIOS = false,
}: FeaturesPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className={`${isIOS ? 'p-2' : 'p-1.5'} text-muted-foreground hover:text-foreground transition-colors`}
          title="Features & Tools"
        >
          {isOpen ? (
            <ChevronUp className={`${isIOS ? 'w-6 h-6' : 'w-5 h-5'}`} />
          ) : (
            <ChevronDown className={`${isIOS ? 'w-6 h-6' : 'w-5 h-5'}`} />
          )}
        </button>
      </SheetTrigger>
      <SheetContent side={isIOS ? "bottom" : "right"} className={isIOS ? "h-[80vh]" : ""}>
        <SheetHeader>
          <SheetTitle>Study Tools & Features</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-6 overflow-y-auto max-h-[calc(100%-60px)]">
          {/* Progress & Timer Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Progress
            </h3>
            <div className="flex flex-col gap-2">
              <StudyProgress userId={userId} />
              <StudyTimer userId={userId} subject={subject} />
            </div>
          </div>

          {/* Study Tools Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Study Tools
            </h3>
            <div className="flex flex-col gap-2">
              <NoteManager userId={userId} subject={subject} />
              <FlashcardManager userId={userId} subject={subject} />
              <QuizGenerator userId={userId} subject={subject} />
            </div>
          </div>

          {/* Conversations Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Conversations
            </h3>
            <div className="flex flex-col gap-2">
              <ConversationSearch
                userId={userId}
                onSelectConversation={onSelectConversation}
              />
              <ConversationList
                userId={userId}
                currentConversationId={currentConversationId}
                onSelectConversation={onSelectConversation}
                onNewConversation={onNewConversation}
              />
            </div>
          </div>

          {/* Actions Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Actions
            </h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/help");
                  setIsOpen(false);
                }}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  onExport();
                  setIsOpen(false);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Conversation
              </Button>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Settings
            </h3>
            <Settings
              userId={userId}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
            />
          </div>

          {/* Sign Out Section */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
