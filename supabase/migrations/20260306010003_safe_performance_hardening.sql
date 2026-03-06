BEGIN;

-- Baseline performance indexes (safe additions)
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

-- FK covering indexes (advisor recommendations)
CREATE INDEX IF NOT EXISTS idx_asos_collaborator_id ON public.asos (collaborator_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_updated_by ON public.company_settings (updated_by);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_by ON public.incidents (reported_by);

-- Make trigger function search_path explicit and idempotent on profile insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Keep existing behavior, but improve policy evaluation performance
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;

CREATE POLICY profiles_insert
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY profiles_update
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

COMMIT;
