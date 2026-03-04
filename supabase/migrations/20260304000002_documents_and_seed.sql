-- ============================================================
-- JOMAGA SAFEWORK — Documents table + Storage bucket + Seed data
-- 100 registros de demonstração distribuídos entre as tabelas
-- ============================================================

-- ============================================================
-- documents (metadata for uploaded files)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id           uuid        NOT NULL DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  size         text,
  category     text        NOT NULL DEFAULT 'Geral',
  storage_path text        NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT documents_pkey PRIMARY KEY (id)
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select" ON public.documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "documents_delete" ON public.documents
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Storage bucket for documents
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/msword','application/zip','image/png','image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "documents_storage_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');

CREATE POLICY "documents_storage_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_storage_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'documents');

-- ============================================================
-- SEED DATA — ~100 registros de demonstração
-- ============================================================

-- ============================================================
-- 20 Colaboradores
-- ============================================================
INSERT INTO public.collaborators (name, email, role, registration, status, created_at) VALUES
  ('Carlos Alberto Silva',    'carlos.silva@jomaga.com',     'Técnico de Segurança',  'COL-001', 'Ativo',   '2025-06-15 08:00:00+00'),
  ('Maria Fernanda Souza',    'maria.souza@jomaga.com',      'Engenheira de Segurança','COL-002', 'Ativo',   '2025-06-20 08:00:00+00'),
  ('José Ricardo Oliveira',   'jose.oliveira@jomaga.com',    'Eletricista',           'COL-003', 'Ativo',   '2025-07-01 08:00:00+00'),
  ('Ana Paula Santos',        'ana.santos@jomaga.com',       'Enfermeira do Trabalho', 'COL-004', 'Ativo',   '2025-07-10 08:00:00+00'),
  ('Roberto Carlos Mendes',   'roberto.mendes@jomaga.com',   'Operador de Máquinas',  'COL-005', 'Ativo',   '2025-07-15 08:00:00+00'),
  ('Fernanda Lima Costa',     'fernanda.costa@jomaga.com',   'Auxiliar Administrativo','COL-006', 'Ativo',   '2025-08-01 08:00:00+00'),
  ('Paulo Henrique Almeida',  'paulo.almeida@jomaga.com',    'Soldador',              'COL-007', 'Ativo',   '2025-08-10 08:00:00+00'),
  ('Luciana Rocha Pereira',   'luciana.pereira@jomaga.com',  'Técnica de Enfermagem', 'COL-008', 'Ativo',   '2025-08-20 08:00:00+00'),
  ('Marcos Antônio Ribeiro',  'marcos.ribeiro@jomaga.com',   'Mecânico Industrial',   'COL-009', 'Ativo',   '2025-09-01 08:00:00+00'),
  ('Patrícia Gomes Ferreira', 'patricia.ferreira@jomaga.com','Supervisora de Produção','COL-010', 'Ativo',   '2025-09-10 08:00:00+00'),
  ('Thiago Nascimento Dias',  'thiago.dias@jomaga.com',      'Motorista',             'COL-011', 'Ativo',   '2025-09-15 08:00:00+00'),
  ('Camila Barbosa Martins',  'camila.martins@jomaga.com',   'Almoxarife',            'COL-012', 'Ativo',   '2025-10-01 08:00:00+00'),
  ('Anderson Vieira Cardoso', 'anderson.cardoso@jomaga.com', 'Pintor Industrial',     'COL-013', 'Ativo',   '2025-10-10 08:00:00+00'),
  ('Juliana Teixeira Araújo', 'juliana.araujo@jomaga.com',   'Analista de RH',        'COL-014', 'Ativo',   '2025-10-20 08:00:00+00'),
  ('Diego Moreira Lima',      'diego.lima@jomaga.com',       'Caldeireiro',           'COL-015', 'Ativo',   '2025-11-01 08:00:00+00'),
  ('Rafaela Cunha Borges',    'rafaela.borges@jomaga.com',   'Técnica de Segurança',  'COL-016', 'Ativo',   '2025-11-10 08:00:00+00'),
  ('Gustavo Santos Neto',     'gustavo.neto@jomaga.com',     'Pedreiro',              'COL-017', 'Ativo',   '2025-11-20 08:00:00+00'),
  ('Beatriz Andrade Lopes',   'beatriz.lopes@jomaga.com',    'Assistente Social',     'COL-018', 'Inativo', '2025-12-01 08:00:00+00'),
  ('Felipe Correia Duarte',   'felipe.duarte@jomaga.com',    'Encanador',             'COL-019', 'Ativo',   '2025-12-10 08:00:00+00'),
  ('Daniela Freitas Castro',  'daniela.castro@jomaga.com',   'Coordenadora SESMT',    'COL-020', 'Ativo',   '2025-12-15 08:00:00+00');

-- ============================================================
-- 20 Incidentes (distribuídos nos últimos 6 meses)
-- ============================================================
INSERT INTO public.incidents (title, description, area, date, severity, status, created_at) VALUES
  ('Queda de material no setor A',         'Peça metálica caiu de prateleira atingindo o chão próximo a colaborador.', 'Produção',      '2025-10-05', 'Média',  'Fechado',     '2025-10-05 09:30:00+00'),
  ('Escorregão no corredor principal',      'Piso molhado sem sinalização causou escorregão.',                         'Administrativo','2025-10-12', 'Baixa',  'Fechado',     '2025-10-12 14:00:00+00'),
  ('Choque elétrico leve na bancada 3',     'Colaborador sentiu choque ao tocar equipamento com fio exposto.',         'Elétrica',      '2025-10-20', 'Alta',   'Fechado',     '2025-10-20 10:15:00+00'),
  ('Corte superficial com ferramenta',      'Corte no dedo ao manusear estilete sem luva.',                            'Manutenção',    '2025-11-02', 'Baixa',  'Fechado',     '2025-11-02 08:45:00+00'),
  ('Queimadura térmica leve',               'Contato acidental com superfície quente na caldeira.',                    'Caldeiraria',   '2025-11-10', 'Média',  'Fechado',     '2025-11-10 11:00:00+00'),
  ('Quase-acidente com empilhadeira',       'Empilhadeira quase atingiu pedestre em cruzamento interno.',              'Logística',     '2025-11-18', 'Alta',   'Fechado',     '2025-11-18 15:30:00+00'),
  ('Exposição a poeira excessiva',          'Colaboradores sem máscara em área de corte de concreto.',                 'Obras',         '2025-11-25', 'Média',  'Fechado',     '2025-11-25 09:00:00+00'),
  ('Princípio de incêndio em lixeira',      'Lixeira com materiais inflamáveis pegou fogo, controlado rapidamente.',   'Produção',      '2025-12-03', 'Alta',   'Fechado',     '2025-12-03 16:20:00+00'),
  ('Dor lombar por esforço repetitivo',     'Colaborador reportou dores após carregar peso sem auxílio.',              'Almoxarifado',  '2025-12-10', 'Baixa',  'Fechado',     '2025-12-10 12:00:00+00'),
  ('Vazamento de produto químico',          'Pequeno vazamento de solvente no setor de pintura.',                      'Pintura',       '2025-12-18', 'Média',  'Fechado',     '2025-12-18 10:30:00+00'),
  ('Queda de altura (escada)',              'Colaborador escorregou em escada, sem lesão grave.',                       'Manutenção',    '2026-01-08', 'Alta',   'Fechado',     '2026-01-08 09:15:00+00'),
  ('Irritação ocular por solda',            'Faísca de solda atingiu olho mesmo com uso de EPI.',                      'Soldagem',      '2026-01-15', 'Média',  'Fechado',     '2026-01-15 14:45:00+00'),
  ('Tropeço em cabo solto',                 'Cabo elétrico mal posicionado causou tropeço.',                           'Elétrica',      '2026-01-22', 'Baixa',  'Em análise',  '2026-01-22 08:30:00+00'),
  ('Ruído acima do permitido',              'Medição de ruído no setor de prensas acima de 85dB.',                     'Produção',      '2026-02-01', 'Média',  'Em análise',  '2026-02-01 10:00:00+00'),
  ('Falha em extintor de incêndio',         'Extintor vencido encontrado no corredor B.',                              'Predial',       '2026-02-08', 'Alta',   'Em análise',  '2026-02-08 11:30:00+00'),
  ('Dermatite por contato químico',         'Colaborador desenvolveu irritação na pele por manuseio sem luva.',        'Pintura',       '2026-02-15', 'Baixa',  'Fechado',     '2026-02-15 09:00:00+00'),
  ('Colisão entre veículos internos',       'Colisão leve entre caminhão e utilitário no pátio.',                      'Logística',     '2026-02-20', 'Média',  'Aberto',      '2026-02-20 16:00:00+00'),
  ('Entorse de tornozelo em desnível',      'Colaborador torceu o pé em desnível sem sinalização.',                    'Obras',         '2026-03-01', 'Baixa',  'Aberto',      '2026-03-01 08:00:00+00'),
  ('Projeção de partícula metálica',        'Partícula metálica projetada durante corte com esmerilhadeira.',          'Manutenção',    '2026-03-02', 'Alta',   'Aberto',      '2026-03-02 10:30:00+00'),
  ('Falta de sinalização em área de risco', 'Área de trabalho em altura sem isolamento adequado.',                     'Obras',         '2026-03-03', 'Média',  'Aberto',      '2026-03-03 14:00:00+00');

-- ============================================================
-- 20 EPIs
-- ============================================================
INSERT INTO public.epis (item, "user", status, date, created_at) VALUES
  ('Capacete de segurança classe B',      'Carlos Alberto Silva',    'Ativo',   '2026-08-15', '2025-08-15 08:00:00+00'),
  ('Luva de vaqueta',                     'José Ricardo Oliveira',   'Ativo',   '2026-07-20', '2025-07-20 08:00:00+00'),
  ('Óculos de proteção ampla visão',      'Roberto Carlos Mendes',   'Ativo',   '2026-09-01', '2025-09-01 08:00:00+00'),
  ('Protetor auricular tipo concha',      'Paulo Henrique Almeida',  'Ativo',   '2026-06-10', '2025-06-10 08:00:00+00'),
  ('Bota de segurança com biqueira aço',  'Marcos Antônio Ribeiro',  'Ativo',   '2026-10-01', '2025-10-01 08:00:00+00'),
  ('Máscara PFF2',                        'Anderson Vieira Cardoso', 'Ativo',   '2026-05-15', '2025-11-15 08:00:00+00'),
  ('Cinto de segurança tipo paraquedista', 'Gustavo Santos Neto',    'Ativo',   '2026-11-20', '2025-11-20 08:00:00+00'),
  ('Avental de raspa de couro',           'Paulo Henrique Almeida',  'Ativo',   '2026-04-10', '2025-10-10 08:00:00+00'),
  ('Luva nitrílica',                      'Ana Paula Santos',        'Vencendo','2026-03-20', '2025-09-20 08:00:00+00'),
  ('Respirador semifacial',               'Diego Moreira Lima',      'Vencendo','2026-03-15', '2025-09-15 08:00:00+00'),
  ('Capacete aba frontal classe A',       'Thiago Nascimento Dias',  'Vencendo','2026-03-10', '2025-09-10 08:00:00+00'),
  ('Óculos de proteção lente escura',     'Felipe Correia Duarte',   'Vencendo','2026-03-25', '2025-09-25 08:00:00+00'),
  ('Protetor auricular tipo plug',        'Fernanda Lima Costa',     'Expirado','2026-01-05', '2025-07-05 08:00:00+00'),
  ('Luva de PVC cano longo',              'Camila Barbosa Martins',  'Expirado','2026-02-01', '2025-08-01 08:00:00+00'),
  ('Máscara descartável PFF1',            'Rafaela Cunha Borges',    'Expirado','2026-01-15', '2025-07-15 08:00:00+00'),
  ('Bota de borracha cano alto',          'Gustavo Santos Neto',     'Ativo',   '2026-12-01', '2025-12-01 08:00:00+00'),
  ('Mangote de raspa',                    'Paulo Henrique Almeida',  'Ativo',   '2026-07-01', '2026-01-01 08:00:00+00'),
  ('Perneira de segurança',               'Diego Moreira Lima',      'Ativo',   '2026-08-01', '2026-02-01 08:00:00+00'),
  ('Touca árabe para sol',                'Roberto Carlos Mendes',   'Ativo',   '2026-09-15', '2026-03-01 08:00:00+00'),
  ('Creme protetor solar FPS 60',         'Thiago Nascimento Dias',  'Vencendo','2026-03-30', '2025-09-30 08:00:00+00');

-- ============================================================
-- 15 Treinamentos
-- ============================================================
INSERT INTO public.trainings (title, instructor, date, duration, status, participants, created_at) VALUES
  ('NR-35 Trabalho em Altura',            'Carlos Alberto Silva',    '2025-10-10', '8h',       'Concluído',    25, '2025-10-10 08:00:00+00'),
  ('NR-10 Segurança em Eletricidade',     'Maria Fernanda Souza',    '2025-10-25', '40h',      'Concluído',    18, '2025-10-25 08:00:00+00'),
  ('CIPA — Formação de Cipeiros',          'Daniela Freitas Castro',  '2025-11-05', '20h',      'Concluído',    30, '2025-11-05 08:00:00+00'),
  ('Primeiros Socorros',                   'Ana Paula Santos',        '2025-11-20', '16h',      'Concluído',    22, '2025-11-20 08:00:00+00'),
  ('Combate a Incêndio — Brigada',         'Carlos Alberto Silva',    '2025-12-01', '8h',       'Concluído',    20, '2025-12-01 08:00:00+00'),
  ('NR-12 Segurança em Máquinas',         'Maria Fernanda Souza',    '2025-12-15', '16h',      'Concluído',    15, '2025-12-15 08:00:00+00'),
  ('Uso Correto de EPIs',                 'Rafaela Cunha Borges',    '2026-01-10', '4h',       'Concluído',    35, '2026-01-10 08:00:00+00'),
  ('Ergonomia no Trabalho',               'Ana Paula Santos',        '2026-01-20', '4h 30min', 'Concluído',    28, '2026-01-20 08:00:00+00'),
  ('NR-33 Espaço Confinado',              'Carlos Alberto Silva',    '2026-02-05', '16h',      'Concluído',    12, '2026-02-05 08:00:00+00'),
  ('Direção Defensiva',                    'Thiago Nascimento Dias',  '2026-02-15', '8h',       'Concluído',    10, '2026-02-15 08:00:00+00'),
  ('SIPAT 2026 — Semana de Prevenção',     'Daniela Freitas Castro',  '2026-03-01', '40h',      'Em Andamento', 50, '2026-03-01 08:00:00+00'),
  ('NR-18 Segurança na Construção Civil',  'Maria Fernanda Souza',    '2026-03-05', '16h',      'Agendado',     0,  '2026-03-03 08:00:00+00'),
  ('Manuseio de Produtos Químicos',       'Rafaela Cunha Borges',    '2026-03-10', '8h',       'Agendado',     0,  '2026-03-03 08:00:00+00'),
  ('Trabalho a Quente — NR-34',            'Carlos Alberto Silva',    '2026-03-15', '8h',       'Agendado',     0,  '2026-03-03 08:00:00+00'),
  ('Prevenção de Quedas',                  'Maria Fernanda Souza',    '2026-03-20', '4h',       'Agendado',     0,  '2026-03-03 08:00:00+00');

-- ============================================================
-- 20 DDS Records
-- ============================================================
INSERT INTO public.dds_records (date, theme, content, technician, participants, duration, created_at) VALUES
  ('2025-10-01', 'Uso correto de EPIs',                  'Reforçar a importância do uso contínuo dos EPIs durante toda a jornada.', 'Carlos Alberto Silva',   ARRAY['José Ricardo Oliveira','Roberto Carlos Mendes','Paulo Henrique Almeida','Marcos Antônio Ribeiro','Anderson Vieira Cardoso'], '15min', '2025-10-01 07:30:00+00'),
  ('2025-10-08', 'Prevenção de quedas',                  'Cuidados com pisos molhados, desníveis e uso de corrimão.',               'Maria Fernanda Souza',   ARRAY['Carlos Alberto Silva','Ana Paula Santos','Fernanda Lima Costa','Thiago Nascimento Dias'], '10min', '2025-10-08 07:30:00+00'),
  ('2025-10-15', 'Organização do local de trabalho',     'Programa 5S aplicado à segurança. Manter áreas limpas e organizadas.',    'Rafaela Cunha Borges',   ARRAY['Paulo Henrique Almeida','Camila Barbosa Martins','Diego Moreira Lima','Gustavo Santos Neto','Felipe Correia Duarte'], '15min', '2025-10-15 07:30:00+00'),
  ('2025-10-22', 'Proteção contra ruído',                'Importância do uso do protetor auricular e limites de exposição.',        'Carlos Alberto Silva',   ARRAY['Roberto Carlos Mendes','Marcos Antônio Ribeiro','Anderson Vieira Cardoso'], '10min', '2025-10-22 07:30:00+00'),
  ('2025-11-05', 'Riscos elétricos',                     'Nunca mexer em instalações elétricas sem qualificação e autorização.',    'Maria Fernanda Souza',   ARRAY['José Ricardo Oliveira','Thiago Nascimento Dias','Felipe Correia Duarte','Gustavo Santos Neto'], '15min', '2025-11-05 07:30:00+00'),
  ('2025-11-12', 'Ergonomia e postura',                  'Posturas corretas para levantamento de peso e trabalho sentado.',         'Ana Paula Santos',       ARRAY['Fernanda Lima Costa','Camila Barbosa Martins','Juliana Teixeira Araújo','Patrícia Gomes Ferreira'], '10min', '2025-11-12 07:30:00+00'),
  ('2025-11-19', 'Proteção respiratória',                'Uso correto de máscaras PFF2 e respiradores em áreas com poeira.',        'Rafaela Cunha Borges',   ARRAY['Anderson Vieira Cardoso','Diego Moreira Lima','Paulo Henrique Almeida','Gustavo Santos Neto','Roberto Carlos Mendes'], '15min', '2025-11-19 07:30:00+00'),
  ('2025-11-26', 'Primeiros socorros básicos',           'Como agir em caso de cortes, queimaduras e desmaios.',                    'Ana Paula Santos',       ARRAY['Carlos Alberto Silva','Maria Fernanda Souza','Luciana Rocha Pereira','Daniela Freitas Castro'], '20min', '2025-11-26 07:30:00+00'),
  ('2025-12-03', 'Combate a incêndio',                   'Uso de extintores, rotas de fuga e ponto de encontro.',                   'Carlos Alberto Silva',   ARRAY['José Ricardo Oliveira','Roberto Carlos Mendes','Marcos Antônio Ribeiro','Thiago Nascimento Dias','Paulo Henrique Almeida','Diego Moreira Lima'], '15min', '2025-12-03 07:30:00+00'),
  ('2025-12-10', 'Sinalização de segurança',             'Significado das cores e placas de sinalização na empresa.',               'Maria Fernanda Souza',   ARRAY['Fernanda Lima Costa','Camila Barbosa Martins','Gustavo Santos Neto'], '10min', '2025-12-10 07:30:00+00'),
  ('2025-12-17', 'Cuidados no trânsito interno',         'Velocidade máxima, faixas de pedestre e cruzamentos.',                    'Thiago Nascimento Dias', ARRAY['Anderson Vieira Cardoso','Felipe Correia Duarte','Marcos Antônio Ribeiro','Roberto Carlos Mendes'], '10min', '2025-12-17 07:30:00+00'),
  ('2026-01-07', 'Hidratação e alimentação no trabalho',  'Importância de se manter hidratado, especialmente em dias quentes.',      'Ana Paula Santos',       ARRAY['Carlos Alberto Silva','Paulo Henrique Almeida','Diego Moreira Lima','Gustavo Santos Neto','Thiago Nascimento Dias'], '10min', '2026-01-07 07:30:00+00'),
  ('2026-01-14', 'Proteção solar no trabalho externo',    'Uso de protetor solar, roupas adequadas e pausas na sombra.',             'Rafaela Cunha Borges',   ARRAY['Roberto Carlos Mendes','Felipe Correia Duarte','Anderson Vieira Cardoso','Gustavo Santos Neto'], '15min', '2026-01-14 07:30:00+00'),
  ('2026-01-21', 'Manuseio de produtos químicos',         'FISPQ, rotulagem e cuidados ao manipular solventes e ácidos.',            'Carlos Alberto Silva',   ARRAY['Anderson Vieira Cardoso','Diego Moreira Lima','Paulo Henrique Almeida'], '15min', '2026-01-21 07:30:00+00'),
  ('2026-02-04', 'Trabalho em espaço confinado',          'Procedimentos de entrada, monitoramento atmosférico e resgate.',           'Carlos Alberto Silva',   ARRAY['José Ricardo Oliveira','Roberto Carlos Mendes','Marcos Antônio Ribeiro','Diego Moreira Lima'], '20min', '2026-02-04 07:30:00+00'),
  ('2026-02-11', 'Segurança em máquinas e equipamentos',  'Nunca retirar proteções, atenção às zonas de perigo.',                     'Maria Fernanda Souza',   ARRAY['Roberto Carlos Mendes','Marcos Antônio Ribeiro','Paulo Henrique Almeida','Camila Barbosa Martins','Patrícia Gomes Ferreira'], '15min', '2026-02-11 07:30:00+00'),
  ('2026-02-18', 'Comportamento seguro',                   'Cultura de segurança: observar, reportar e prevenir.',                    'Daniela Freitas Castro', ARRAY['Carlos Alberto Silva','Maria Fernanda Souza','Rafaela Cunha Borges','Ana Paula Santos','Luciana Rocha Pereira'], '15min', '2026-02-18 07:30:00+00'),
  ('2026-02-25', 'Riscos biológicos',                      'Cuidados com materiais perfurocortantes e descarte adequado.',             'Ana Paula Santos',       ARRAY['Luciana Rocha Pereira','Fernanda Lima Costa','Juliana Teixeira Araújo'], '10min', '2026-02-25 07:30:00+00'),
  ('2026-03-01', 'SIPAT 2026 — Abertura',                  'Abertura da Semana Interna de Prevenção de Acidentes do Trabalho.',        'Daniela Freitas Castro', ARRAY['Carlos Alberto Silva','Maria Fernanda Souza','José Ricardo Oliveira','Ana Paula Santos','Roberto Carlos Mendes','Fernanda Lima Costa','Paulo Henrique Almeida','Luciana Rocha Pereira','Marcos Antônio Ribeiro','Patrícia Gomes Ferreira'], '30min', '2026-03-01 07:30:00+00'),
  ('2026-03-04', 'Cuidados com ferramentas manuais',      'Inspeção antes do uso, armazenamento correto e manutenção.',               'Rafaela Cunha Borges',   ARRAY['José Ricardo Oliveira','Marcos Antônio Ribeiro','Felipe Correia Duarte','Diego Moreira Lima','Gustavo Santos Neto'], '15min', '2026-03-04 07:30:00+00');

-- ============================================================
-- 5 Documentos de demonstração (metadados — sem arquivo real no storage)
-- ============================================================
INSERT INTO public.documents (name, size, category, storage_path, created_at) VALUES
  ('PPRA_2025_Final.pdf',                      '2.4 MB',  'Segurança',   'demo/PPRA_2025_Final.pdf',                      '2026-01-15 08:00:00+00'),
  ('PCMSO_Atualizado.pdf',                     '1.8 MB',  'Saúde',       'demo/PCMSO_Atualizado.pdf',                     '2026-01-20 08:00:00+00'),
  ('Laudo_Eletrico_Setor_A.pdf',               '4.2 MB',  'Elétrica',    'demo/Laudo_Eletrico_Setor_A.pdf',               '2026-02-05 08:00:00+00'),
  ('Novo(a) Planilha do Microsoft Excel.xlsx', '0.0 MB',  'Geral',       'demo/Novo_Planilha_Excel.xlsx',                 '2026-03-04 08:00:00+00'),
  ('Teste.xlsx',                                '0.0 MB',  'Geral',       'demo/Teste.xlsx',                               '2026-03-04 09:00:00+00');
