-- ============================================================
-- JOMAGA SAFEWORK — Convite de assinatura + seeds extras
-- ============================================================

ALTER TABLE public.collaborators
  ADD COLUMN IF NOT EXISTS signature_invite_token TEXT,
  ADD COLUMN IF NOT EXISTS signature_invite_expires_at TIMESTAMPTZ;

-- Todos os colaboradores com assinatura digital variada e LGPD aprovado
UPDATE public.collaborators
SET
  digital_signature = CONCAT(
    'data:image/svg+xml;base64,',
    encode(
      convert_to(
        '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="120">'
        || '<rect width="100%" height="100%" fill="white"/>'
        || '<path d="M20 75 C80 20, 140 110, 210 60 S330 40, 390 78" stroke="#1A237E" stroke-width="3" fill="none"/>'
        || '<text x="20" y="102" font-size="14" fill="#1A237E" font-family="Arial">' || COALESCE(name, 'Colaborador') || '</text>'
        || '</svg>',
        'UTF8'
      ),
      'base64'
    )
  ),
  lgpd_consent = TRUE,
  lgpd_consent_date = COALESCE(lgpd_consent_date, timezone('utc', now()) - ((random() * 120)::int || ' days')::interval),
  signature_invite_token = NULL,
  signature_invite_expires_at = NULL
WHERE status = 'Ativo';

-- 25 exemplos de ASO
INSERT INTO public.asos (
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
  c.id,
  c.name,
  (ARRAY['Admissional','Periódico','Demissional','Retorno ao Trabalho','Mudança de Função'])[((g.i - 1) % 5) + 1],
  (ARRAY['Apto','Apto com Restrições','Apto','Apto','Inapto'])[((g.i - 1) % 5) + 1],
  (CURRENT_DATE - ((g.i * 11) % 190))::date,
  (CURRENT_DATE + (35 + g.i * 7))::date,
  (ARRAY['Dra. Helena Campos','Dr. Rodrigo Azevedo','Dra. Larissa Prado','Dr. Felipe Nogueira'])[((g.i - 1) % 4) + 1],
  CONCAT('CRM-', 10000 + g.i),
  CONCAT('ASO de demonstração #', g.i, ' gerado para visualização no módulo de gestão de ASO.'),
  timezone('utc', now()) - ((g.i * 2) || ' days')::interval
FROM generate_series(1, 25) AS g(i)
LEFT JOIN LATERAL (
  SELECT id, name
  FROM public.collaborators
  WHERE status = 'Ativo'
  ORDER BY name
  OFFSET ((g.i - 1) % GREATEST((SELECT COUNT(*) FROM public.collaborators WHERE status = 'Ativo'), 1))
  LIMIT 1
) c ON true;

-- 25 exemplos para matriz de treinamento - Base
INSERT INTO public.trainings (
  title,
  instructor,
  date,
  duration,
  status,
  participants,
  location_type,
  training_category,
  participant_ids,
  created_at
)
SELECT
  CONCAT('Treinamento Base #', g.i, ' - Segurança Operacional'),
  (ARRAY['SESMT Base','Eng. Segurança Base','Instrutor Interno'])[((g.i - 1) % 3) + 1],
  (CURRENT_DATE + (g.i * 3))::date,
  CONCAT((1 + (g.i % 3)), 'h ', (g.i * 5 % 60), 'min'),
  (ARRAY['Agendado','Em Andamento','Concluído'])[((g.i - 1) % 3) + 1],
  0,
  (ARRAY['onshore','offshore','ambos'])[((g.i - 1) % 3) + 1],
  'base',
  '{}',
  timezone('utc', now()) - ((g.i) || ' days')::interval
FROM generate_series(1, 25) AS g(i);

-- 25 exemplos para matriz de treinamento - Cliente
INSERT INTO public.trainings (
  title,
  instructor,
  date,
  duration,
  status,
  participants,
  location_type,
  training_category,
  participant_ids,
  created_at
)
SELECT
  CONCAT('Treinamento Cliente #', g.i, ' - Procedimentos do Contratante'),
  (ARRAY['Preposto Cliente','SESMT Cliente','Coordenador de Campo'])[((g.i - 1) % 3) + 1],
  (CURRENT_DATE + (g.i * 4))::date,
  CONCAT((1 + (g.i % 2)), 'h ', (g.i * 7 % 60), 'min'),
  (ARRAY['Agendado','Em Andamento','Concluído'])[((g.i + 1) % 3) + 1],
  0,
  (ARRAY['onshore','offshore','ambos'])[((g.i + 1) % 3) + 1],
  'cliente',
  '{}',
  timezone('utc', now()) - ((g.i + 1) || ' days')::interval
FROM generate_series(1, 25) AS g(i);
