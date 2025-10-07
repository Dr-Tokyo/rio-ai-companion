-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy - users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Add preferred model to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_model TEXT DEFAULT 'google/gemini-2.5-flash';

-- Create a demo admin user
-- This creates a user with email: admin@rio.ai, password: admin123
-- You'll need to manually set this password in Supabase Auth
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  instance_id
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@rio.ai',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"username": "Admin"}',
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'
) ON CONFLICT (id) DO NOTHING;

-- Create profile for admin user
INSERT INTO public.profiles (
  user_id,
  username,
  voice_enabled,
  preferred_voice,
  preferred_model
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Admin',
  true,
  'shimmer',
  'google/gemini-2.5-flash'
) ON CONFLICT (user_id) DO NOTHING;

-- Assign admin role
INSERT INTO public.user_roles (
  user_id,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin'
) ON CONFLICT (user_id, role) DO NOTHING;

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat files
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can see all files
CREATE POLICY "Admins can view all files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-files' AND
    public.has_role(auth.uid(), 'admin')
  );