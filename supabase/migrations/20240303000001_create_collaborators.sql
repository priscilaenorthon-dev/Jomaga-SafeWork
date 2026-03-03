-- Create collaborators table
CREATE TABLE IF NOT EXISTS public.collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  registration TEXT UNIQUE,
  status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Collaborators are viewable by everyone." ON public.collaborators
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert collaborators." ON public.collaborators
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update collaborators." ON public.collaborators
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete collaborators." ON public.collaborators
  FOR DELETE USING (true);
