import { Button } from "@/components/ui/button";
import { Atom, Clock, Calculator, BookOpen } from "lucide-react";

interface SubjectSelectorProps {
  selected: string;
  onSelect: (subject: string) => void;
}

const subjects = [
  { id: "science", label: "Science", icon: Atom },
  { id: "history", label: "History", icon: Clock },
  { id: "math", label: "Math", icon: Calculator },
  { id: "english", label: "English", icon: BookOpen },
];

export const SubjectSelector = ({ selected, onSelect }: SubjectSelectorProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {subjects.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={selected === id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(id)}
          className="transition-all duration-300 hover:shadow-glow"
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Button>
      ))}
    </div>
  );
};
