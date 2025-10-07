import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Crown, Accessibility, Palette, Sliders } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  userId: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
  isAdmin: boolean;
}

const AI_MODELS = [
  { 
    id: "google/gemini-2.5-pro", 
    name: "Gemini 2.5 Pro", 
    description: "Most capable - best for complex reasoning",
    free: true
  },
  { 
    id: "google/gemini-2.5-flash", 
    name: "Gemini 2.5 Flash (Default)", 
    description: "Balanced speed and intelligence",
    free: true
  },
  { 
    id: "google/gemini-2.5-flash-lite", 
    name: "Gemini 2.5 Flash Lite", 
    description: "Fastest - for simple tasks",
    free: true
  },
  { 
    id: "openai/gpt-5", 
    name: "GPT-5", 
    description: "OpenAI's most advanced model",
    free: false
  },
  { 
    id: "openai/gpt-5-mini", 
    name: "GPT-5 Mini", 
    description: "Balanced GPT model",
    free: false
  },
  { 
    id: "openai/gpt-5-nano", 
    name: "GPT-5 Nano", 
    description: "Fast and efficient GPT",
    free: false
  },
  { 
    id: "claude-sonnet-4-20250514", 
    name: "Claude Sonnet 4", 
    description: "High-performance with exceptional reasoning",
    free: false
  },
  { 
    id: "qwen-3.5", 
    name: "Qwen 3.5", 
    description: "Alibaba's advanced reasoning model",
    free: false
  },
];

export const Settings = ({ 
  userId, 
  selectedModel,
  onModelChange,
  isAdmin
}: SettingsProps) => {
  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [theme, setTheme] = useState("system");
  const [messageDensity, setMessageDensity] = useState("comfortable");
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showCharacter, setShowCharacter] = useState(true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadSettings();
    }
  }, [userId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          preferred_model,
          font_size,
          high_contrast,
          dyslexia_font,
          theme,
          message_density,
          show_timestamps,
          show_character,
          keyboard_shortcuts
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading settings:", error);
        return;
      }

      if (data) {
        if (data.preferred_model) onModelChange(data.preferred_model);
        setFontSize(data.font_size || "medium");
        setHighContrast(data.high_contrast || false);
        setDyslexiaFont(data.dyslexia_font || false);
        setTheme(data.theme || "system");
        setMessageDensity(data.message_density || "comfortable");
        setShowTimestamps(data.show_timestamps ?? true);
        setShowCharacter(data.show_character ?? true);
        setKeyboardShortcuts(data.keyboard_shortcuts ?? true);
      }
    } catch (error) {
      console.error("Settings load error:", error);
    }
  };

  const saveSettings = async () => {
    try {
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id: userId,
            preferred_model: selectedModel,
            font_size: fontSize,
            high_contrast: highContrast,
            dyslexia_font: dyslexiaFont,
            theme: theme,
            message_density: messageDensity,
            show_timestamps: showTimestamps,
            show_character: showCharacter,
            keyboard_shortcuts: keyboardShortcuts,
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          toast({
            title: "Error",
            description: "Failed to create profile: " + insertError.message,
            variant: "destructive",
          });
          return;
        }
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            preferred_model: selectedModel,
            font_size: fontSize,
            high_contrast: highContrast,
            dyslexia_font: dyslexiaFont,
            theme: theme,
            message_density: messageDensity,
            show_timestamps: showTimestamps,
            show_character: showCharacter,
            keyboard_shortcuts: keyboardShortcuts,
          })
          .eq("user_id", userId);

        if (updateError) {
          console.error("Update error:", updateError);
          toast({
            title: "Error",
            description: "Failed to save settings: " + updateError.message,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
      });
    } catch (error) {
      console.error("Save settings error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <SettingsIcon className="w-4 h-4" />
          {isAdmin && (
            <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Settings
            {isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
          </DialogTitle>
          <DialogDescription>
            Customize your Rio Futaba AI experience
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai">
              <Sliders className="w-4 h-4 mr-2" />
              AI
            </TabsTrigger>
            <TabsTrigger value="accessibility">
              <Accessibility className="w-4 h-4 mr-2" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="display">
              <Palette className="w-4 h-4 mr-2" />
              Display
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        {model.free && (
                          <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                            FREE
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {AI_MODELS.find(m => m.id === selectedModel)?.description}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <p className="text-xs text-muted-foreground">Enhanced visibility</p>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dyslexia-font">Dyslexia-Friendly Font</Label>
                <p className="text-xs text-muted-foreground">OpenDyslexic typeface</p>
              </div>
              <Switch
                id="dyslexia-font"
                checked={dyslexiaFont}
                onCheckedChange={setDyslexiaFont}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="keyboard-shortcuts">Keyboard Shortcuts</Label>
                <p className="text-xs text-muted-foreground">Enable hotkeys (Ctrl+K, etc.)</p>
              </div>
              <Switch
                id="keyboard-shortcuts"
                checked={keyboardShortcuts}
                onCheckedChange={setKeyboardShortcuts}
              />
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Message Density</Label>
              <Select value={messageDensity} onValueChange={setMessageDensity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-timestamps">Show Timestamps</Label>
              <Switch
                id="show-timestamps"
                checked={showTimestamps}
                onCheckedChange={setShowTimestamps}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-character">Show Rio Character</Label>
              <Switch
                id="show-character"
                checked={showCharacter}
                onCheckedChange={setShowCharacter}
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={saveSettings} className="w-full bg-gradient-primary mt-4">
          Save All Settings
        </Button>
      </DialogContent>
    </Dialog>
  );
};
