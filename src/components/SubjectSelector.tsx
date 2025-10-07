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
  Atom, 
  FlaskConical, 
  Dna, 
  Globe2, 
  Landmark, 
  Calculator, 
  Ruler, 
  PieChart,
  BookOpen,
  PenTool,
  MessageSquare,
  Code2,
  Database,
  Cpu,
  Palette,
  Music,
  Map,
  Brain,
  DollarSign,
  Languages
} from "lucide-react";

const SUBJECTS = {
  sciences: [
    { id: "physics", name: "Physics", icon: Atom },
    { id: "chemistry", name: "Chemistry", icon: FlaskConical },
    { id: "biology", name: "Biology", icon: Dna },
    { id: "astronomy", name: "Astronomy", icon: Globe2 },
    { id: "environmental-science", name: "Environmental Science", icon: Globe2 },
  ],
  social: [
    { id: "world-history", name: "World History", icon: Globe2 },
    { id: "us-history", name: "US History", icon: Landmark },
    { id: "geography", name: "Geography", icon: Map },
    { id: "psychology", name: "Psychology", icon: Brain },
    { id: "sociology", name: "Sociology", icon: Brain },
    { id: "economics", name: "Economics", icon: DollarSign },
    { id: "political-science", name: "Political Science", icon: Landmark },
    { id: "philosophy", name: "Philosophy", icon: Brain },
  ],
  mathematics: [
    { id: "algebra", name: "Algebra", icon: Calculator },
    { id: "geometry", name: "Geometry", icon: Ruler },
    { id: "trigonometry", name: "Trigonometry", icon: Ruler },
    { id: "calculus", name: "Calculus", icon: PieChart },
    { id: "statistics", name: "Statistics", icon: PieChart },
    { id: "linear-algebra", name: "Linear Algebra", icon: Calculator },
  ],
  languages: [
    { id: "literature", name: "Literature", icon: BookOpen },
    { id: "grammar", name: "Grammar & Writing", icon: PenTool },
    { id: "creative-writing", name: "Creative Writing", icon: PenTool },
    { id: "communication", name: "Communication", icon: MessageSquare },
    { id: "spanish", name: "Spanish", icon: Languages },
    { id: "french", name: "French", icon: Languages },
    { id: "german", name: "German", icon: Languages },
    { id: "japanese", name: "Japanese", icon: Languages },
    { id: "chinese", name: "Chinese", icon: Languages },
  ],
  programming: [
    { id: "web-dev", name: "Web Development", icon: Code2 },
    { id: "python", name: "Python", icon: Code2 },
    { id: "javascript", name: "JavaScript", icon: Code2 },
    { id: "data-structures", name: "Data Structures", icon: Database },
    { id: "algorithms", name: "Algorithms", icon: Cpu },
    { id: "databases", name: "Databases", icon: Database },
    { id: "machine-learning", name: "Machine Learning", icon: Cpu },
  ],
  arts: [
    { id: "visual-arts", name: "Visual Arts", icon: Palette },
    { id: "music-theory", name: "Music Theory", icon: Music },
    { id: "music-composition", name: "Music Composition", icon: Music },
    { id: "digital-art", name: "Digital Art", icon: Palette },
  ],
};

interface SubjectSelectorProps {
  selected: string;
  onSelect: (subject: string) => void;
}

export const SubjectSelector = ({ selected, onSelect }: SubjectSelectorProps) => {
  const getCurrentIcon = () => {
    for (const category of Object.values(SUBJECTS)) {
      const subject = category.find(s => s.id === selected);
      if (subject) return subject.icon;
    }
    return BookOpen;
  };

  const getCurrentName = () => {
    for (const category of Object.values(SUBJECTS)) {
      const subject = category.find(s => s.id === selected);
      if (subject) return subject.name;
    }
    return "Select Subject";
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
      <SelectContent className="max-h-[400px]">
        <SelectGroup>
          <SelectLabel>Sciences</SelectLabel>
          {SUBJECTS.sciences.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              <div className="flex items-center gap-2">
                <subject.icon className="w-4 h-4" />
                <span>{subject.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel>Social Studies</SelectLabel>
          {SUBJECTS.social.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              <div className="flex items-center gap-2">
                <subject.icon className="w-4 h-4" />
                <span>{subject.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel>Mathematics</SelectLabel>
          {SUBJECTS.mathematics.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              <div className="flex items-center gap-2">
                <subject.icon className="w-4 h-4" />
                <span>{subject.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel>Languages & Communication</SelectLabel>
          {SUBJECTS.languages.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              <div className="flex items-center gap-2">
                <subject.icon className="w-4 h-4" />
                <span>{subject.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel>Programming</SelectLabel>
          {SUBJECTS.programming.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              <div className="flex items-center gap-2">
                <subject.icon className="w-4 h-4" />
                <span>{subject.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectGroup>
          <SelectLabel>Arts</SelectLabel>
          {SUBJECTS.arts.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              <div className="flex items-center gap-2">
                <subject.icon className="w-4 h-4" />
                <span>{subject.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
