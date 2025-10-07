-- Disable RLS on profiles table since we're not using auth anymore
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Insert a default profile for the fixed user ID if it doesn't exist
INSERT INTO public.profiles (user_id, preferred_model, theme, font_size, message_density)
VALUES ('00000000-0000-0000-0000-000000000001', 'google/gemini-2.5-flash', 'system', 'medium', 'comfortable')
ON CONFLICT (user_id) DO NOTHING;