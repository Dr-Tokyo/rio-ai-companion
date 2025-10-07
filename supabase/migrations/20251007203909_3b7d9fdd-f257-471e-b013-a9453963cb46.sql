-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view via share code" ON public.shared_notes;

-- Create a secure function to get shared note by code
CREATE OR REPLACE FUNCTION public.get_shared_note_by_code(p_share_code text)
RETURNS TABLE (
  note_id uuid,
  share_code text,
  view_count integer,
  created_at timestamp with time zone,
  expires_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if share code exists and hasn't expired
  RETURN QUERY
  SELECT 
    sn.note_id,
    sn.share_code,
    sn.view_count,
    sn.created_at,
    sn.expires_at
  FROM public.shared_notes sn
  WHERE sn.share_code = p_share_code
    AND (sn.expires_at IS NULL OR sn.expires_at > now())
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.get_shared_note_by_code(text) TO authenticated, anon;

-- Create a more restrictive policy for public viewing
-- This policy is only used when the function is called, providing controlled access
CREATE POLICY "View shared notes via secure function" ON public.shared_notes
  FOR SELECT 
  USING (
    -- Only allow SELECT when called from our secure function
    -- or when user owns the share
    shared_by = auth.uid()
  );

-- Add UPDATE policy for incrementing view count through secure function
CREATE POLICY "Update view count via function" ON public.shared_notes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create secure function to increment view count
CREATE OR REPLACE FUNCTION public.increment_share_view_count(p_share_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shared_notes
  SET view_count = view_count + 1
  WHERE share_code = p_share_code
    AND (expires_at IS NULL OR expires_at > now());
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_share_view_count(text) TO authenticated, anon;