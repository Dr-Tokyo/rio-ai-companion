-- Create shared_notes table for note sharing
CREATE TABLE IF NOT EXISTS public.shared_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES public.study_notes(id) ON DELETE CASCADE,
  share_code text UNIQUE NOT NULL,
  shared_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  view_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;

-- Users can create shares for their own notes
CREATE POLICY "Users can share own notes" ON public.shared_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.study_notes 
      WHERE id = note_id AND user_id = auth.uid()
    )
  );

-- Users can view their own shares
CREATE POLICY "Users can view own shares" ON public.shared_notes
  FOR SELECT USING (shared_by = auth.uid());

-- Anyone can view shared notes via share code (for public access)
CREATE POLICY "Anyone can view via share code" ON public.shared_notes
  FOR SELECT USING (true);

-- Users can delete their own shares
CREATE POLICY "Users can delete own shares" ON public.shared_notes
  FOR DELETE USING (shared_by = auth.uid());

-- Function to generate random share code
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;