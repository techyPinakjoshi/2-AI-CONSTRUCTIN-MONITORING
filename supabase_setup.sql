
-- ConstructAI Supabase Schema Initialization
-- Run this in the SQL Editor (https://supabase.com/dashboard/project/wqawkzxxojewybnbrzke/sql)

-- 1. Table: Projects (Stores Digital Twin & Monitoring Data)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table: AI Logs (Stores Vision Analysis History)
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    camera_name TEXT,
    description TEXT,
    detected_objects JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 3. Table: Chat History (Stores AI Chatbot Conversations)
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- 5. Policies: Projects
CREATE POLICY "Individuals can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Individuals can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Individuals can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Individuals can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- 6. Policies: AI Logs
CREATE POLICY "Individuals can view their own logs" ON public.ai_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Individuals can insert logs" ON public.ai_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Policies: Chat History
CREATE POLICY "Individuals can view their own chats" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Individuals can create chats" ON public.chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Individuals can update their own chats" ON public.chat_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Individuals can delete their own chats" ON public.chat_history FOR DELETE USING (auth.uid() = user_id);

-- 8. Auto-update timestamps trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_chats_modtime BEFORE UPDATE ON public.chat_history FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- DONE. Your database is now ready for ConstructAI.
