BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  full_name text,
  avatar_url text,
  gender text,
  role text NOT NULL DEFAULT 'user',
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

UPDATE public.profiles SET role = COALESCE(NULLIF(role, ''), 'user');
UPDATE public.profiles SET updated_at = COALESCE(updated_at, timezone('utc', now()));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  area text,
  date date NOT NULL,
  severity text CHECK (severity IN ('Baixa', 'Média', 'Alta')),
  status text NOT NULL DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Em análise', 'Fechado')),
  type text CHECK (type IN ('incidente', 'acidente')) DEFAULT 'incidente',
  photos text[] DEFAULT '{}',
  reported_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT incidents_pkey PRIMARY KEY (id)
);

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS incidents_select ON public.incidents;
DROP POLICY IF EXISTS incidents_insert ON public.incidents;
DROP POLICY IF EXISTS incidents_update ON public.incidents;
DROP POLICY IF EXISTS incidents_delete ON public.incidents;
CREATE POLICY incidents_select ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY incidents_insert ON public.incidents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY incidents_update ON public.incidents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY incidents_delete ON public.incidents FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.epis (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item text NOT NULL,
  "user" text NOT NULL,
  status text NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Vencendo', 'Expirado')),
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT epis_pkey PRIMARY KEY (id)
);

ALTER TABLE public.epis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS epis_select ON public.epis;
DROP POLICY IF EXISTS epis_insert ON public.epis;
DROP POLICY IF EXISTS epis_update ON public.epis;
DROP POLICY IF EXISTS epis_delete ON public.epis;
CREATE POLICY epis_select ON public.epis FOR SELECT TO authenticated USING (true);
CREATE POLICY epis_insert ON public.epis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY epis_update ON public.epis FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY epis_delete ON public.epis FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.trainings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  instructor text,
  date date NOT NULL,
  duration text,
  status text NOT NULL DEFAULT 'Agendado' CHECK (status IN ('Agendado', 'Em Andamento', 'Concluído')),
  participants integer NOT NULL DEFAULT 0,
  location_type text CHECK (location_type IN ('onshore', 'offshore', 'ambos')) DEFAULT 'ambos',
  training_category text CHECK (training_category IN ('base', 'cliente')) DEFAULT 'base',
  certificate_template_url text,
  participant_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT trainings_pkey PRIMARY KEY (id)
);

ALTER TABLE public.trainings
  ADD COLUMN IF NOT EXISTS location_type text,
  ADD COLUMN IF NOT EXISTS training_category text,
  ADD COLUMN IF NOT EXISTS certificate_template_url text,
  ADD COLUMN IF NOT EXISTS participant_ids uuid[] DEFAULT '{}';

ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trainings_select ON public.trainings;
DROP POLICY IF EXISTS trainings_insert ON public.trainings;
DROP POLICY IF EXISTS trainings_update ON public.trainings;
DROP POLICY IF EXISTS trainings_delete ON public.trainings;
CREATE POLICY trainings_select ON public.trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY trainings_insert ON public.trainings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY trainings_update ON public.trainings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY trainings_delete ON public.trainings FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.collaborators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  role text,
  registration text UNIQUE,
  status text NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  contract_type text CHECK (contract_type IN ('onshore', 'offshore')) DEFAULT 'onshore',
  digital_signature text,
  lgpd_consent boolean NOT NULL DEFAULT false,
  lgpd_consent_date timestamptz,
  signature_invite_token text,
  signature_invite_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT collaborators_pkey PRIMARY KEY (id)
);

ALTER TABLE public.collaborators
  ADD COLUMN IF NOT EXISTS contract_type text,
  ADD COLUMN IF NOT EXISTS digital_signature text,
  ADD COLUMN IF NOT EXISTS lgpd_consent boolean,
  ADD COLUMN IF NOT EXISTS lgpd_consent_date timestamptz,
  ADD COLUMN IF NOT EXISTS signature_invite_token text,
  ADD COLUMN IF NOT EXISTS signature_invite_expires_at timestamptz;

UPDATE public.collaborators SET lgpd_consent = COALESCE(lgpd_consent, false);
ALTER TABLE public.collaborators ALTER COLUMN lgpd_consent SET DEFAULT false;

ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS collaborators_select ON public.collaborators;
DROP POLICY IF EXISTS collaborators_insert ON public.collaborators;
DROP POLICY IF EXISTS collaborators_update ON public.collaborators;
DROP POLICY IF EXISTS collaborators_delete ON public.collaborators;
CREATE POLICY collaborators_select ON public.collaborators FOR SELECT TO authenticated USING (true);
CREATE POLICY collaborators_insert ON public.collaborators FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY collaborators_update ON public.collaborators FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY collaborators_delete ON public.collaborators FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.dds_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  theme text NOT NULL,
  content text,
  technician text,
  participants text[] NOT NULL DEFAULT '{}',
  duration text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT dds_records_pkey PRIMARY KEY (id)
);

ALTER TABLE public.dds_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dds_select ON public.dds_records;
DROP POLICY IF EXISTS dds_insert ON public.dds_records;
DROP POLICY IF EXISTS dds_update ON public.dds_records;
DROP POLICY IF EXISTS dds_delete ON public.dds_records;
CREATE POLICY dds_select ON public.dds_records FOR SELECT TO authenticated USING (true);
CREATE POLICY dds_insert ON public.dds_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY dds_update ON public.dds_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY dds_delete ON public.dds_records FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size text,
  category text NOT NULL DEFAULT 'Geral',
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT documents_pkey PRIMARY KEY (id)
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS documents_select ON public.documents;
DROP POLICY IF EXISTS documents_insert ON public.documents;
DROP POLICY IF EXISTS documents_update ON public.documents;
DROP POLICY IF EXISTS documents_delete ON public.documents;
CREATE POLICY documents_select ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY documents_insert ON public.documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY documents_update ON public.documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY documents_delete ON public.documents FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.epi_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  epi_name text NOT NULL,
  current_stock integer NOT NULL DEFAULT 0,
  minimum_stock integer NOT NULL DEFAULT 5,
  unit text NOT NULL DEFAULT 'unidade',
  notes text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT epi_inventory_pkey PRIMARY KEY (id)
);

ALTER TABLE public.epi_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS epi_inventory_select ON public.epi_inventory;
DROP POLICY IF EXISTS epi_inventory_insert ON public.epi_inventory;
DROP POLICY IF EXISTS epi_inventory_update ON public.epi_inventory;
DROP POLICY IF EXISTS epi_inventory_delete ON public.epi_inventory;
CREATE POLICY epi_inventory_select ON public.epi_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY epi_inventory_insert ON public.epi_inventory FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY epi_inventory_update ON public.epi_inventory FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY epi_inventory_delete ON public.epi_inventory FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.asos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  collaborator_id uuid REFERENCES public.collaborators(id) ON DELETE CASCADE,
  collaborator_name text NOT NULL,
  exam_type text NOT NULL CHECK (exam_type IN ('Admissional', 'Periódico', 'Demissional', 'Retorno ao Trabalho', 'Mudança de Função')),
  result text NOT NULL CHECK (result IN ('Apto', 'Inapto', 'Apto com Restrições')),
  exam_date date NOT NULL,
  next_exam_date date,
  doctor text,
  crm text,
  observations text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT asos_pkey PRIMARY KEY (id)
);

ALTER TABLE public.asos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS asos_select ON public.asos;
DROP POLICY IF EXISTS asos_insert ON public.asos;
DROP POLICY IF EXISTS asos_update ON public.asos;
DROP POLICY IF EXISTS asos_delete ON public.asos;
CREATE POLICY asos_select ON public.asos FOR SELECT TO authenticated USING (true);
CREATE POLICY asos_insert ON public.asos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY asos_update ON public.asos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY asos_delete ON public.asos FOR DELETE TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/msword',
    'application/zip',
    'image/png',
    'image/jpeg'
  ]
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS documents_storage_select ON storage.objects;
DROP POLICY IF EXISTS documents_storage_insert ON storage.objects;
DROP POLICY IF EXISTS documents_storage_delete ON storage.objects;
CREATE POLICY documents_storage_select ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');
CREATE POLICY documents_storage_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY documents_storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');

CREATE INDEX IF NOT EXISTS idx_incidents_date ON public.incidents (date DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents (status);
CREATE INDEX IF NOT EXISTS idx_epis_date ON public.epis (date DESC);
CREATE INDEX IF NOT EXISTS idx_epis_status ON public.epis (status);
CREATE INDEX IF NOT EXISTS idx_trainings_date ON public.trainings (date DESC);
CREATE INDEX IF NOT EXISTS idx_trainings_status ON public.trainings (status);
CREATE INDEX IF NOT EXISTS idx_collaborators_status ON public.collaborators (status);
CREATE INDEX IF NOT EXISTS idx_dds_date ON public.dds_records (date DESC);
CREATE INDEX IF NOT EXISTS idx_asos_exam_date ON public.asos (exam_date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents (created_at DESC);

COMMIT;
