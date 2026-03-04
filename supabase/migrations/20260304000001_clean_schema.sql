-- ============================================================
-- JOMAGA SAFEWORK — Schema consolidado e limpo
-- Substitui todas as migrations anteriores incrementais.
-- Reflete exatamente o que o código da aplicação usa.
-- ============================================================

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        NOT NULL,
  full_name   text,
  avatar_url  text,
  gender      text,
  role        text        NOT NULL DEFAULT 'user',
  updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-cria perfil quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- incidents
-- ============================================================
CREATE TABLE IF NOT EXISTS public.incidents (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  description text,
  area        text,
  date        date        NOT NULL,
  severity    text        CHECK (severity IN ('Baixa', 'Média', 'Alta')),
  status      text        NOT NULL DEFAULT 'Aberto'
                          CHECK (status IN ('Aberto', 'Em análise', 'Fechado')),
  reported_by uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT incidents_pkey PRIMARY KEY (id)
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incidents_select" ON public.incidents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "incidents_insert" ON public.incidents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "incidents_update" ON public.incidents
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "incidents_delete" ON public.incidents
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- epis
-- Removidas colunas legadas: name, category, stock_quantity,
-- min_quantity, expiry_date (não usadas pelo código da aplicação).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.epis (
  id         uuid        NOT NULL DEFAULT gen_random_uuid(),
  item       text        NOT NULL,
  "user"     text        NOT NULL,
  status     text        NOT NULL DEFAULT 'Ativo'
                         CHECK (status IN ('Ativo', 'Vencendo', 'Expirado')),
  date       date        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT epis_pkey PRIMARY KEY (id)
);

ALTER TABLE public.epis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "epis_select" ON public.epis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "epis_insert" ON public.epis
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "epis_update" ON public.epis
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "epis_delete" ON public.epis
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- trainings
-- Removida coluna legada duration_hours (INTEGER).
-- Adicionada duration (TEXT) que o código usa (ex: "8h", "4h 30min").
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trainings (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  title        text        NOT NULL,
  instructor   text,
  date         date        NOT NULL,
  duration     text,
  status       text        NOT NULL DEFAULT 'Agendado'
                           CHECK (status IN ('Agendado', 'Em Andamento', 'Concluído')),
  participants integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT trainings_pkey PRIMARY KEY (id)
);

ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trainings_select" ON public.trainings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "trainings_insert" ON public.trainings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "trainings_update" ON public.trainings
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "trainings_delete" ON public.trainings
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- collaborators
-- ============================================================
CREATE TABLE IF NOT EXISTS public.collaborators (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  email        text,
  role         text,
  registration text        UNIQUE,
  status       text        NOT NULL DEFAULT 'Ativo'
                           CHECK (status IN ('Ativo', 'Inativo')),
  created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT collaborators_pkey PRIMARY KEY (id)
);

ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collaborators_select" ON public.collaborators
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "collaborators_insert" ON public.collaborators
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "collaborators_update" ON public.collaborators
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "collaborators_delete" ON public.collaborators
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- dds_records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dds_records (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  date         date        NOT NULL DEFAULT CURRENT_DATE,
  theme        text        NOT NULL,
  content      text,
  technician   text,
  participants text[]      NOT NULL DEFAULT '{}',
  duration     text,
  created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT dds_records_pkey PRIMARY KEY (id)
);

ALTER TABLE public.dds_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dds_select" ON public.dds_records
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "dds_insert" ON public.dds_records
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "dds_update" ON public.dds_records
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "dds_delete" ON public.dds_records
  FOR DELETE TO authenticated USING (true);
