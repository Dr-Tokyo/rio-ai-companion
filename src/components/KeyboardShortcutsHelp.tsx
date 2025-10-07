import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: "Ctrl/Cmd + K", description: "Focus search" },
  { keys: "Ctrl/Cmd + N", description: "New conversation" },
  { keys: "Ctrl/Cmd + S", description: "Open settings" },
  { keys: "Ctrl/Cmd + /", description: "Show shortcuts" },
  { keys: "Esc", description: "Close dialogs" },
  { keys: "Enter", description: "Send message" },
  { keys: "Shift + Enter", description: "New line in message" },
];

export const KeyboardShortcutsHelp = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Keyboard className="w-4 h-4 mr-2" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Speed up your workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-background border rounded">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
