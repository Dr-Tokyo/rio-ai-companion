-- Remove voice-related columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS voice_enabled;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS preferred_voice;

-- Remove has_audio column from messages table
ALTER TABLE public.messages DROP COLUMN IF EXISTS has_audio;