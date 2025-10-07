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
import { Settings as SettingsIcon, Accessibility, Palette, Sliders, Bell, Lock, Download, Trash2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface SettingsProps {
  userId: string;
  selectedModel: string;
  onModelChange: (model: string) => void;
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
  onModelChange
}: SettingsProps) => {
  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [theme, setTheme] = useState("system");
  const [messageDensity, setMessageDensity] = useState("comfortable");
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [showCharacter, setShowCharacter] = useState(true);
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadSettings();
    }
  }, [userId]);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
      }

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
          keyboard_shortcuts,
          username
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Note",
          description: "Using default settings",
        });
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
        setUsername(data.username || "");
      }
    } catch (error) {
      console.error("Settings load error:", error);
      toast({
        title: "Note",
        description: "Using default settings",
      });
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
            username: username,
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
            username: username,
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
        <Button variant="outline" size="icon">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your Rio Futaba AI experience
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <SettingsIcon className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
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

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Display name for your profile</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </div>
                </Label>
                <p className="text-xs text-muted-foreground">Receive study reminders</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-save">Auto-Save Conversations</Label>
                <p className="text-xs text-muted-foreground">Automatically save chat history</p>
              </div>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-effects">Sound Effects</Label>
                <p className="text-xs text-muted-foreground">Play sounds for actions</p>
              </div>
              <Switch
                id="sound-effects"
                checked={soundEffects}
                onCheckedChange={setSoundEffects}
              />
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label className="flex items-center gap-2 text-destructive">
                <Lock className="w-4 h-4" />
                Privacy & Data
              </Label>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={async () => {
                  const { data: sessions } = await supabase
                    .from("study_sessions")
                    .select("*")
                    .eq("user_id", userId);
                  
                  const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "my-study-data.json";
                  a.click();
                  
                  toast({
                    title: "Data exported",
                    description: "Your study data has been downloaded",
                  });
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={() => {
                  toast({
                    title: "Feature coming soon",
                    description: "Account deletion will be available in a future update",
                  });
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </TabsContent>

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
