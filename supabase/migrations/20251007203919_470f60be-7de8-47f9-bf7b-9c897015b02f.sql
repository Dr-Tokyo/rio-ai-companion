-- Add missing UPDATE policy for conversation_tags
CREATE POLICY "Users can update tags for own conversations" ON public.conversation_tags
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = conversation_tags.conversation_id 
        AND conversations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = conversation_tags.conversation_id 
        AND conversations.user_id = auth.uid()
    )
  );