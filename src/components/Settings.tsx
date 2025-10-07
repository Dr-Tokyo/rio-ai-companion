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
import { Settings as SettingsIcon, Crown } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("preferred_model")
      .eq("user_id", userId)
      .single();

    if (data?.preferred_model) {
      onModelChange(data.preferred_model);
    }
  };

  const saveSettings = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        preferred_model: selectedModel,
      })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated",
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Settings
            {isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
          </DialogTitle>
          <DialogDescription>
            Customize your Rio Futaba AI experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
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

          <Button onClick={saveSettings} className="w-full bg-gradient-primary">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
