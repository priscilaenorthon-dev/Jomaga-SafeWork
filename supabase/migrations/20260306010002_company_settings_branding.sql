BEGIN;

CREATE TABLE IF NOT EXISTS public.company_settings (
  id integer PRIMARY KEY DEFAULT 1,
  company_name text NOT NULL DEFAULT 'Jomaga',
  logo_url text,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT company_settings_singleton CHECK (id = 1)
);

ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS updated_by uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

ALTER TABLE public.company_settings
  ALTER COLUMN company_name SET DEFAULT 'Jomaga',
  ALTER COLUMN updated_at SET DEFAULT timezone('utc', now());

UPDATE public.company_settings
SET company_name = COALESCE(NULLIF(company_name, ''), 'Jomaga'),
    updated_at = COALESCE(updated_at, timezone('utc', now()))
WHERE id = 1;

INSERT INTO public.company_settings (id, company_name)
VALUES (1, 'Jomaga')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_settings_select ON public.company_settings;
DROP POLICY IF EXISTS company_settings_insert ON public.company_settings;
DROP POLICY IF EXISTS company_settings_update ON public.company_settings;

CREATE POLICY company_settings_select
ON public.company_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY company_settings_insert
ON public.company_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY company_settings_update
ON public.company_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS branding_storage_select ON storage.objects;
DROP POLICY IF EXISTS branding_storage_insert ON storage.objects;
DROP POLICY IF EXISTS branding_storage_update ON storage.objects;
DROP POLICY IF EXISTS branding_storage_delete ON storage.objects;

CREATE POLICY branding_storage_select
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'branding');

CREATE POLICY branding_storage_insert
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'branding');

CREATE POLICY branding_storage_update
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'branding')
WITH CHECK (bucket_id = 'branding');

CREATE POLICY branding_storage_delete
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'branding');

COMMIT;
