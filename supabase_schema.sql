
-- 1. Create Projects Table
-- This table stores the main project data (BIM paths, site settings, etc.)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create AI Logs Table
-- This table stores the history of detections and analysis from Gemini
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    camera_name TEXT,
    description TEXT,
    detected_objects JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
-- This ensures users can't see each other's construction data
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Projects
CREATE POLICY "Users can create their own projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Create Policies for AI Logs
CREATE POLICY "Users can view logs for their projects" 
ON public.ai_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert logs" 
ON public.ai_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 6. Add trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- 7. (Optional) Create a view for public analytics if needed
-- COMMENT: Run these commands in the Supabase SQL Editor to initialize.
