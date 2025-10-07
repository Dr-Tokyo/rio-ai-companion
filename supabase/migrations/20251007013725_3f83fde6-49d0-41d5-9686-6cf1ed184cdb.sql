-- Drop all RLS policies since we're not using authentication
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

DROP POLICY IF EXISTS "Users can delete their own flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can insert their own flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can view their own flashcards" ON public.flashcards;

DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can insert their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;

DROP POLICY IF EXISTS "Users can delete their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;

DROP POLICY IF EXISTS "Users can delete their own study notes" ON public.study_notes;
DROP POLICY IF EXISTS "Users can insert their own study notes" ON public.study_notes;
DROP POLICY IF EXISTS "Users can update their own study notes" ON public.study_notes;
DROP POLICY IF EXISTS "Users can view their own study notes" ON public.study_notes;

DROP POLICY IF EXISTS "Users can delete their own files" ON public.uploaded_files;
DROP POLICY IF EXISTS "Users can insert their own files" ON public.uploaded_files;
DROP POLICY IF EXISTS "Users can view their own files" ON public.uploaded_files;

DROP POLICY IF EXISTS "Users can delete tags from their conversations" ON public.conversation_tags;
DROP POLICY IF EXISTS "Users can insert tags for their conversations" ON public.conversation_tags;
DROP POLICY IF EXISTS "Users can view tags for their conversations" ON public.conversation_tags;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;