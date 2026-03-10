BEGIN;

-- Campos adicionais para aderir ao modelo formal de Ficha de EPI.
ALTER TABLE public.collaborators
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS admission_date date;

ALTER TABLE public.epis
  ADD COLUMN IF NOT EXISTS ca_number text,
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS delivery_date date;

ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS cnpj text;

COMMIT;
