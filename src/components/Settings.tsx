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
import { Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingsProps {
  userId: string;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
}

export const Settings = ({ userId, voiceEnabled, onVoiceEnabledChange }: SettingsProps) => {
  const [preferredVoice, setPreferredVoice] = useState("shimmer");
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("voice_enabled, preferred_voice")
      .eq("user_id", userId)
      .single();

    if (data) {
      onVoiceEnabledChange(data.voice_enabled ?? true);
      setPreferredVoice(data.preferred_voice || "shimmer");
    }
  };

  const saveSettings = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        voice_enabled: voiceEnabled,
        preferred_voice: preferredVoice,
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
        <Button variant="outline" size="icon">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your Rio Futaba AI experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-enabled">Voice Responses</Label>
            <Switch
              id="voice-enabled"
              checked={voiceEnabled}
              onCheckedChange={onVoiceEnabledChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-select">Voice Model</Label>
            <Select value={preferredVoice} onValueChange={setPreferredVoice}>
              <SelectTrigger id="voice-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy</SelectItem>
                <SelectItem value="echo">Echo</SelectItem>
                <SelectItem value="fable">Fable</SelectItem>
                <SelectItem value="onyx">Onyx</SelectItem>
                <SelectItem value="nova">Nova</SelectItem>
                <SelectItem value="shimmer">Shimmer (Default)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={saveSettings} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
