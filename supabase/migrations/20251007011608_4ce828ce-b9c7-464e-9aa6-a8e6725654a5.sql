-- Add new columns to profiles for accessibility and display settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS font_size text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS high_contrast boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dyslexia_font boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'system',
ADD COLUMN IF NOT EXISTS message_density text DEFAULT 'comfortable',
ADD COLUMN IF NOT EXISTS show_timestamps boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_character boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS keyboard_shortcuts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Create conversation tags table
CREATE TABLE IF NOT EXISTS public.conversation_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  tag text NOT NULL,
  color text DEFAULT 'blue',
  created_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, tag)
);

-- Enable RLS on conversation_tags
ALTER TABLE public.conversation_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_tags
CREATE POLICY "Users can view tags for their conversations"
ON public.conversation_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = conversation_tags.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert tags for their conversations"
ON public.conversation_tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = conversation_tags.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete tags from their conversations"
ON public.conversation_tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = conversation_tags.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

-- Add notes column to conversations
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;