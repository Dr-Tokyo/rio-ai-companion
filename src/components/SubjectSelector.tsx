import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calculator,
  BookOpen,
  Atom,
  Landmark,
  Code2
} from "lucide-react";

const SUBJECTS = [
  { id: "math", name: "Math", icon: Calculator },
  { id: "english", name: "English", icon: BookOpen },
  { id: "science", name: "Science", icon: Atom },
  { id: "history", name: "History", icon: Landmark },
  { id: "programming", name: "Programming", icon: Code2 },
];

interface SubjectSelectorProps {
  selected: string;
  onSelect: (subject: string) => void;
}

export const SubjectSelector = ({ selected, onSelect }: SubjectSelectorProps) => {
  const getCurrentIcon = () => {
    const subject = SUBJECTS.find(s => s.id === selected);
    return subject ? subject.icon : BookOpen;
  };

  const getCurrentName = () => {
    const subject = SUBJECTS.find(s => s.id === selected);
    return subject ? subject.name : "Select Subject";
  };

  const Icon = getCurrentIcon();

  return (
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger className="w-full md:w-[280px] bg-background/50 border-border">
        <SelectValue>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span>{getCurrentName()}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUBJECTS.map((subject) => (
          <SelectItem key={subject.id} value={subject.id}>
            <div className="flex items-center gap-2">
              <subject.icon className="w-4 h-4" />
              <span>{subject.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
