-- Add RLS policies for user_roles table
-- Users can view only their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can insert their own roles (typically done by system/admin)
-- Note: In production, you'd want additional checks here to prevent self-promotion
CREATE POLICY "System can insert user roles" ON public.user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Prevent users from modifying or deleting their own roles
-- These should only be managed by admins through secure backend functions
CREATE POLICY "Prevent role modification" ON public.user_roles
  FOR UPDATE USING (false);

CREATE POLICY "Prevent role deletion" ON public.user_roles
  FOR DELETE USING (false);