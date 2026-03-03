-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  gender TEXT,
  role TEXT DEFAULT 'user',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  location TEXT,
  severity TEXT CHECK (severity IN ('Baixa', 'Média', 'Alta', 'Crítica')),
  status TEXT DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Em Análise', 'Resolvido')),
  reported_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create epis (PPEs) table
CREATE TABLE IF NOT EXISTS public.epis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  expiry_date DATE,
  status TEXT CHECK (status IN ('Disponível', 'Crítico', 'Vencido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trainings table
CREATE TABLE IF NOT EXISTS public.trainings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  duration_hours INTEGER,
  instructor TEXT,
  status TEXT DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Em Andamento', 'Concluído')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Incidents policies
CREATE POLICY "Incidents are viewable by authenticated users." ON public.incidents
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can report incidents." ON public.incidents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- EPIs policies
CREATE POLICY "EPIs are viewable by authenticated users." ON public.epis
  FOR SELECT USING (auth.role() = 'authenticated');

-- Trainings policies
CREATE POLICY "Trainings are viewable by authenticated users." ON public.trainings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
