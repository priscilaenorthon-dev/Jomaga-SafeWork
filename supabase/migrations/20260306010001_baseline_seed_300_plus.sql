BEGIN;

CREATE OR REPLACE FUNCTION public.seed_uuid(seed text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (
    substr(md5(seed), 1, 8) || '-' ||
    substr(md5(seed), 9, 4) || '-' ||
    substr(md5(seed), 13, 4) || '-' ||
    substr(md5(seed), 17, 4) || '-' ||
    substr(md5(seed), 21, 12)
  )::uuid;
$$;

TRUNCATE TABLE
  public.asos,
  public.epi_inventory,
  public.documents,
  public.dds_records,
  public.trainings,
  public.epis,
  public.incidents,
  public.collaborators
RESTART IDENTITY CASCADE;

INSERT INTO public.collaborators (
  id,
  name,
  email,
  role,
  registration,
  status,
  contract_type,
  digital_signature,
  lgpd_consent,
  lgpd_consent_date,
  signature_invite_token,
  signature_invite_expires_at,
  created_at
)
SELECT
  public.seed_uuid('collaborator-' || g),
  format('Colaborador %s', lpad(g::text, 3, '0')),
  format('colaborador.%s@safework.local', lpad(g::text, 3, '0')),
  (ARRAY[
    'Técnico de Segurança',
    'Operador de Produção',
    'Supervisor de Campo',
    'Eletricista',
    'Soldador',
    'Almoxarife',
    'Encarregado de Obra',
    'Motorista'
  ])[(g % 8) + 1],
  format('REG-%s', lpad(g::text, 6, '0')),
  CASE WHEN g % 9 = 0 THEN 'Inativo' ELSE 'Ativo' END,
  CASE WHEN g % 2 = 0 THEN 'onshore' ELSE 'offshore' END,
  CASE
    WHEN g % 4 = 0 THEN NULL
    ELSE format(
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><text x="10" y="36" font-size="18" fill="%231A237E">Assinatura %s</text></svg>',
      g
    )
  END,
  CASE WHEN g % 10 = 0 THEN false ELSE true END,
  timezone('utc', now()) - ((g % 280) || ' days')::interval,
  CASE WHEN g % 10 = 0 THEN md5('invite-' || g::text) ELSE NULL END,
  CASE WHEN g % 10 = 0 THEN timezone('utc', now()) + ((g % 7 + 1) || ' days')::interval ELSE NULL END,
  timezone('utc', now()) - ((g % 400) || ' days')::interval
FROM generate_series(1, 320) AS g;

INSERT INTO public.incidents (
  id,
  title,
  description,
  area,
  date,
  severity,
  status,
  type,
  photos,
  created_at
)
SELECT
  public.seed_uuid('incident-' || g),
  format('Incidente %s', lpad(g::text, 3, '0')),
  format('Registro automático de incidente %s para análise de segurança e rastreabilidade.', g),
  (ARRAY['Produção', 'Logística', 'Obras', 'Elétrica', 'Manutenção', 'Administrativo', 'Pátio', 'Almoxarifado'])[(g % 8) + 1],
  CURRENT_DATE - (g % 365),
  (ARRAY['Baixa', 'Média', 'Alta'])[(g % 3) + 1],
  (ARRAY['Aberto', 'Em análise', 'Fechado'])[(g % 3) + 1],
  (ARRAY['incidente', 'acidente'])[(g % 2) + 1],
  CASE
    WHEN g % 4 = 0 THEN ARRAY[
      format('https://picsum.photos/seed/incident-%s-a/1200/800', g),
      format('https://picsum.photos/seed/incident-%s-b/1200/800', g)
    ]
    ELSE '{}'::text[]
  END,
  timezone('utc', now()) - ((g % 360) || ' days')::interval
FROM generate_series(1, 320) AS g;

INSERT INTO public.epis (
  id,
  item,
  "user",
  status,
  date,
  created_at
)
SELECT
  public.seed_uuid('epi-' || g),
  (ARRAY[
    'Capacete de Segurança',
    'Óculos de Proteção',
    'Luva de Vaqueta',
    'Respirador PFF2',
    'Bota de Segurança',
    'Protetor Auricular',
    'Cinto Paraquedista',
    'Avental de Raspa'
  ])[(g % 8) + 1],
  format('Colaborador %s', lpad((((g - 1) % 320) + 1)::text, 3, '0')),
  CASE
    WHEN g % 7 = 0 THEN 'Expirado'
    WHEN g % 5 = 0 THEN 'Vencendo'
    ELSE 'Ativo'
  END,
  CURRENT_DATE + ((g % 240) - 90),
  timezone('utc', now()) - ((g % 365) || ' days')::interval
FROM generate_series(1, 320) AS g;

INSERT INTO public.trainings (
  id,
  title,
  instructor,
  date,
  duration,
  status,
  participants,
  location_type,
  training_category,
  certificate_template_url,
  participant_ids,
  created_at
)
SELECT
  public.seed_uuid('training-' || g),
  format('Treinamento %s', lpad(g::text, 3, '0')),
  (ARRAY['Instrutor Interno', 'SESMT', 'Consultoria Externa', 'Engenharia de Segurança'])[(g % 4) + 1],
  CURRENT_DATE + ((g % 180) - 60),
  (ARRAY['1h', '2h 30min', '4h', '8h', '16h'])[(g % 5) + 1],
  (ARRAY['Agendado', 'Em Andamento', 'Concluído'])[(g % 3) + 1],
  6 + (g % 45),
  (ARRAY['onshore', 'offshore', 'ambos'])[(g % 3) + 1],
  (ARRAY['base', 'cliente'])[(g % 2) + 1],
  format('https://cdn.safework.local/certificados/template-%s.pdf', (g % 12) + 1),
  '{}'::uuid[],
  timezone('utc', now()) - ((g % 300) || ' days')::interval
FROM generate_series(1, 320) AS g;

INSERT INTO public.dds_records (
  id,
  date,
  theme,
  content,
  technician,
  participants,
  duration,
  created_at
)
SELECT
  public.seed_uuid('dds-' || g),
  CURRENT_DATE - (g % 360),
  (ARRAY[
    'Uso correto de EPIs',
    'Prevenção de quedas',
    'Trabalho em altura',
    'Riscos elétricos',
    'Ergonomia no posto de trabalho',
    'Combate a incêndio',
    'Sinalização de segurança',
    'Comportamento seguro'
  ])[(g % 8) + 1],
  format('DDS %s: reforço prático de prevenção, conduta segura e comunicação imediata de desvios.', g),
  format('Técnico %s', lpad(((g % 50) + 1)::text, 2, '0')),
  ARRAY[
    format('Colaborador %s', lpad((((g * 3) % 320) + 1)::text, 3, '0')),
    format('Colaborador %s', lpad((((g * 5) % 320) + 1)::text, 3, '0')),
    format('Colaborador %s', lpad((((g * 7) % 320) + 1)::text, 3, '0'))
  ],
  (ARRAY['15 min', '20 min', '30 min', '45 min'])[(g % 4) + 1],
  timezone('utc', now()) - ((g % 350) || ' days')::interval
FROM generate_series(1, 320) AS g;

INSERT INTO public.documents (
  id,
  name,
  size,
  category,
  storage_path,
  created_at
)
SELECT
  public.seed_uuid('document-' || g),
  format('Documento_%s.pdf', lpad(g::text, 3, '0')),
  format('%s.%s MB', 1 + (g % 8), (g % 9)),
  (ARRAY['Segurança', 'Saúde', 'Treinamento', 'EPI', 'Incidente', 'Geral'])[(g % 6) + 1],
  format('seed/documentos/documento_%s.pdf', lpad(g::text, 3, '0')),
  timezone('utc', now()) - ((g % 340) || ' days')::interval
FROM generate_series(1, 320) AS g;

INSERT INTO public.epi_inventory (
  id,
  epi_name,
  current_stock,
  minimum_stock,
  unit,
  notes,
  created_at
)
SELECT
  public.seed_uuid('inventory-' || g),
  format('%s - lote %s',
    (ARRAY[
      'Capacete',
      'Óculos',
      'Luva',
      'Respirador',
      'Bota',
      'Protetor Auricular',
      'Cinto',
      'Colete'
    ])[(g % 8) + 1],
    lpad(g::text, 3, '0')
  ),
  2 + (g % 180),
  5 + (g % 30),
  (ARRAY['unidade', 'par', 'kit'])[(g % 3) + 1],
  format('Item de inventário %s para controle de estoque mínimo e reposição.', g),
  timezone('utc', now()) - ((g % 220) || ' days')::interval
FROM generate_series(1, 320) AS g;

WITH active_collaborators AS (
  SELECT
    id,
    name,
    row_number() OVER (ORDER BY name) AS rn,
    count(*) OVER () AS total
  FROM public.collaborators
  WHERE status = 'Ativo'
),
max_total AS (
  SELECT COALESCE(MAX(total), 0) AS total FROM active_collaborators
)
INSERT INTO public.asos (
  id,
  collaborator_id,
  collaborator_name,
  exam_type,
  result,
  exam_date,
  next_exam_date,
  doctor,
  crm,
  observations,
  created_at
)
SELECT
  public.seed_uuid('aso-' || g),
  ac.id,
  ac.name,
  (ARRAY['Admissional', 'Periódico', 'Demissional', 'Retorno ao Trabalho', 'Mudança de Função'])[(g % 5) + 1],
  (ARRAY['Apto', 'Apto com Restrições', 'Inapto'])[(g % 3) + 1],
  CURRENT_DATE - (g % 300),
  CURRENT_DATE + ((g % 200) + 15),
  (ARRAY['Dra. Helena Campos', 'Dr. Rodrigo Azevedo', 'Dra. Larissa Prado', 'Dr. Felipe Nogueira'])[(g % 4) + 1],
  format('CRM-%s', 10000 + g),
  format('ASO gerado automaticamente para cenário de testes e validação (%s).', g),
  timezone('utc', now()) - ((g % 310) || ' days')::interval
FROM generate_series(1, 320) AS g
JOIN max_total mt ON mt.total > 0
JOIN active_collaborators ac ON ac.rn = ((g - 1) % mt.total) + 1;

DROP FUNCTION IF EXISTS public.seed_uuid(text);

COMMIT;
