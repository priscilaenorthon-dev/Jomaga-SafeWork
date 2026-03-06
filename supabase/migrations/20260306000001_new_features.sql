-- ============================================================
-- JOMAGA SAFEWORK — Novas funcionalidades (2026-03-06)
-- Adiciona: contrato, LGPD, assinatura digital em colaboradores
-- Inventário de EPIs, melhorias em treinamentos, incidentes,
-- nova tabela ASO, bucket para fotos de incidentes
-- ============================================================

-- ============================================================
-- collaborators — novos campos
-- ============================================================
ALTER TABLE public.collaborators
  ADD COLUMN IF NOT EXISTS contract_type TEXT CHECK (contract_type IN ('onshore', 'offshore')) DEFAULT 'onshore',
  ADD COLUMN IF NOT EXISTS digital_signature TEXT,
  ADD COLUMN IF NOT EXISTS lgpd_consent BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS lgpd_consent_date TIMESTAMPTZ;

-- ============================================================
-- incidents — novos campos: tipo e fotos
-- ============================================================
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('incidente', 'acidente')) DEFAULT 'incidente',
  ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- ============================================================
-- trainings — novos campos
-- ============================================================
ALTER TABLE public.trainings
  ADD COLUMN IF NOT EXISTS location_type TEXT CHECK (location_type IN ('onshore', 'offshore', 'ambos')) DEFAULT 'ambos',
  ADD COLUMN IF NOT EXISTS training_category TEXT CHECK (training_category IN ('base', 'cliente')) DEFAULT 'base',
  ADD COLUMN IF NOT EXISTS certificate_template_url TEXT,
  ADD COLUMN IF NOT EXISTS participant_ids UUID[] DEFAULT '{}';

-- ============================================================
-- epi_inventory — inventário de EPIs com estoque mínimo
-- ============================================================
CREATE TABLE IF NOT EXISTS public.epi_inventory (
  id            UUID        NOT NULL DEFAULT gen_random_uuid(),
  epi_name      TEXT        NOT NULL,
  current_stock INTEGER     NOT NULL DEFAULT 0,
  minimum_stock INTEGER     NOT NULL DEFAULT 5,
  unit          TEXT        NOT NULL DEFAULT 'unidade',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT epi_inventory_pkey PRIMARY KEY (id)
);

ALTER TABLE public.epi_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "epi_inventory_select" ON public.epi_inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "epi_inventory_insert" ON public.epi_inventory
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "epi_inventory_update" ON public.epi_inventory
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "epi_inventory_delete" ON public.epi_inventory
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- asos — Atestados de Saúde Ocupacional
-- ============================================================
CREATE TABLE IF NOT EXISTS public.asos (
  id               UUID        NOT NULL DEFAULT gen_random_uuid(),
  collaborator_id  UUID        REFERENCES public.collaborators(id) ON DELETE CASCADE,
  collaborator_name TEXT       NOT NULL,
  exam_type        TEXT        NOT NULL CHECK (exam_type IN ('Admissional', 'Periódico', 'Demissional', 'Retorno ao Trabalho', 'Mudança de Função')),
  result           TEXT        NOT NULL CHECK (result IN ('Apto', 'Inapto', 'Apto com Restrições')),
  exam_date        DATE        NOT NULL,
  next_exam_date   DATE,
  doctor           TEXT,
  crm              TEXT,
  observations     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT asos_pkey PRIMARY KEY (id)
);

ALTER TABLE public.asos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asos_select" ON public.asos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "asos_insert" ON public.asos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "asos_update" ON public.asos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "asos_delete" ON public.asos
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Seed: inventário de EPIs para demonstração
-- ============================================================
INSERT INTO public.epi_inventory (epi_name, current_stock, minimum_stock, unit) VALUES
  ('Capacete de Segurança', 45, 20, 'unidade'),
  ('Luva de Proteção', 80, 40, 'par'),
  ('Bota de Segurança', 30, 15, 'par'),
  ('Óculos de Proteção', 25, 20, 'unidade'),
  ('Protetor Auricular', 120, 50, 'unidade'),
  ('Cinto de Segurança', 8, 10, 'unidade'),
  ('Colete Refletivo', 18, 20, 'unidade'),
  ('Máscara PFF2', 3, 30, 'unidade')
ON CONFLICT DO NOTHING;
