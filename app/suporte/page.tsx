'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { MessageCircle, Phone, Rocket, X, Bell, ClipboardCheck, Calendar, BarChart3, Camera, Building2, Smartphone, Mail, Bot, FileText, Shield, Users, Upload, PenLine, LayoutDashboard, ArrowLeft, Zap, Target, TrendingUp, ChevronRight, BookOpen, HardHat, Stethoscope, Settings, Package, TableProperties, ShieldAlert, CheckSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface RoadmapItem {
  icon: any;
  title: string;
  status: 'implemented' | 'partial' | 'planned';
  desc: string;
  details: string;
  benefits: string[];
  example: string;
}

interface RoadmapPhase {
  phase: string;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  items: RoadmapItem[];
}

const roadmapPhases: RoadmapPhase[] = [
  {
    phase: 'Fase 1 — Essencial',
    color: 'bg-green-500',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    items: [
      {
        icon: Bell,
        title: 'Sistema de Alertas e Notificações',
        status: 'implemented',
        desc: 'Central in-app completa com alertas de EPIs, treinamentos, incidentes, ASOs, DDS, inventário e relatórios.',
        details: 'O sistema monitora automaticamente as datas e pendências operacionais e gera alertas in-app no Header e Dashboard. Cada usuário pode ligar/desligar tipos de alerta em Configurações, e os avisos são priorizados por criticidade para ação rápida.',
        benefits: [
          'Cobertura operacional completa dos módulos críticos de SST',
          'Notificações priorizadas por urgência no header',
          'Preferências de alerta por usuário em Configurações',
          'Ação rápida com atalho direto para o módulo responsável',
        ],
        example: 'Ex: Capacete de João vence em 7 dias e ASO de Maria vence em 5 dias → ambos aparecem no sino com prioridade alta e link direto para correção.',
      },
      {
        icon: FileText,
        title: 'Gestão de ASO',
        status: 'implemented',
        desc: 'Controle de Atestados de Saúde Ocupacional — admissional, periódico, demissional com upload de PDF.',
        details: 'Módulo completo para gerenciar todos os tipos de ASO exigidos pela NR-7 (PCMSO). Permite cadastrar exames admissionais, periódicos, demissionais, de retorno ao trabalho e de mudança de função. Cada registro inclui médico responsável, CRM, resultado (Apto/Inapto/Apto com restrições) e upload do documento PDF.',
        benefits: [
          'Atende obrigatoriedade legal da NR-7',
          'Controle centralizado de todos os exames ocupacionais',
          'Alertas automáticos de ASOs próximos do vencimento',
          'Upload do PDF para consulta a qualquer momento',
        ],
        example: 'Ex: Maria foi admitida → cadastra ASO admissional com validade 1 ano → sistema avisa 30 dias antes do vencimento para agendar o periódico.',
      },
      {
        icon: Shield,
        title: 'Níveis de Acesso (RBAC)',
        status: 'planned',
        desc: 'Perfis de Admin, Técnico SST, Gestor e Colaborador com permissões diferenciadas.',
        details: 'Sistema de controle de acesso baseado em funções (Role-Based Access Control). Cada usuário recebe um perfil que define exatamente o que pode ver e fazer no sistema. Admin tem acesso total, Técnico SST gerencia dados operacionais, Gestor visualiza relatórios, e Colaborador consulta apenas seus próprios dados.',
        benefits: [
          'Segurança: cada usuário vê apenas o que precisa',
          'Colaboradores consultam seus EPIs e treinamentos pelo celular',
          'Gestores acompanham indicadores sem alterar dados',
          'Auditoria sabe exatamente quem fez cada alteração',
        ],
        example: 'Ex: O colaborador Pedro acessa pelo celular e vê seus EPIs, próximo treinamento e assina recebimento de EPI. Ele NÃO consegue editar dados de outros colaboradores.',
      },
      {
        icon: FileText,
        title: 'Relatórios PDF Profissionais',
        status: 'implemented',
        desc: 'Pacote completo de PDFs profissionais: Relatório Mensal, Ata de DDS, Ficha de EPI e Incidentes (CAT).',
        details: 'O sistema agora gera documentos profissionais com identidade visual da empresa para os principais fluxos de SST. Os modelos incluem cabeçalho corporativo, resumo executivo de indicadores e tabelas padronizadas para auditoria e compartilhamento.',
        benefits: [
          'Pacote documental completo para auditorias e clientes',
          'Identidade visual aplicada via Configurações > Empresa',
          'Exportação padronizada com um clique em Relatórios',
          'Redução de retrabalho operacional na preparação de evidências',
        ],
        example: 'Ex: Em Relatórios, clique em "Ata de DDS" ou "Relatório de Incidentes (CAT)" → documento profissional abre pronto para impressão e Salvar como PDF.',
      },
    ],
  },
  {
    phase: 'Fase 2 — Diferencial',
    color: 'bg-blue-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    items: [
      {
        icon: ClipboardCheck,
        title: 'Checklists de Inspeção',
        status: 'planned',
        desc: 'Templates por área (Elétrica, Altura, etc.) com itens Conforme/Não Conforme e plano de ação automático.',
        details: 'Biblioteca de checklists pré-configurados para diferentes tipos de inspeção de segurança (elétrica, trabalho em altura, espaço confinado, caldeiras, etc.). O técnico percorre os itens marcando Conforme, Não Conforme ou N/A. Itens não conformes geram automaticamente um plano de ação com responsável e prazo.',
        benefits: [
          'Padroniza inspeções de segurança em toda a empresa',
          'Gera plano de ação automático para não conformidades',
          'Histórico completo de inspeções para auditoria',
          'Possibilidade de anexar fotos a cada item',
        ],
        example: 'Ex: Inspeção semanal de andaimes → técnico marca "guarda-corpo" como Não Conforme → sistema gera ação corretiva automática com prazo de 24h para o encarregado.',
      },
      {
        icon: Calendar,
        title: 'Calendário de SST',
        status: 'planned',
        desc: 'Visualização mensal de vencimentos de EPIs, ASOs, treinamentos, DDS e auditorias.',
        details: 'Calendário visual interativo que consolida todos os eventos e prazos de segurança em uma única tela. Cada tipo de evento tem sua cor: vermelho para vencidos, amarelo para próximos 15 dias, verde para em dia. Permite visualização por dia, semana ou mês.',
        benefits: [
          'Visão completa de tudo que precisa acontecer no mês',
          'Planejamento antecipado de treinamentos e inspeções',
          'Identificação rápida de períodos críticos',
          'Filtro por tipo de evento e por setor/colaborador',
        ],
        example: 'Ex: Abre o calendário de março → vê que dia 15 vencem 8 EPIs, dia 20 tem treinamento de NR-35, e dia 25 é a auditoria interna. Tudo em uma tela.',
      },
      {
        icon: BarChart3,
        title: 'Indicadores TF/TG',
        status: 'planned',
        desc: 'Taxa de Frequência e Gravidade, % DDS realizados, % EPIs e treinamentos em dia.',
        details: 'Painel de indicadores proativos e reativos conforme normas de SST. Taxa de Frequência (TF) = acidentes × 1.000.000 / HHT. Taxa de Gravidade (TG) = dias perdidos × 1.000.000 / HHT. Além de indicadores proativos como % de DDS realizados, % de EPIs dentro da validade e % de colaboradores com treinamentos em dia.',
        benefits: [
          'Métricas reconhecidas internacionalmente (TF/TG)',
          'Comparação mês a mês da evolução da segurança',
          'Identificação de tendências antes de acidentes graves',
          'Dados prontos para reuniões de CIPA e relatórios gerenciais',
        ],
        example: 'Ex: Dashboard mostra TF = 2.5 (meta < 3.0) ✅, 95% dos DDS realizados ✅, mas apenas 78% dos treinamentos em dia ⚠️ → ação imediata para regularizar.',
      },
      {
        icon: Camera,
        title: 'Fotos em Incidentes',
        status: 'implemented',
        desc: 'Upload de registro fotográfico com antes/depois para investigação de acidentes.',
        details: 'Permite anexar múltiplas fotos a cada registro de incidente. O técnico pode tirar fotos diretamente pelo celular e fazer upload para o sistema. Suporta galeria de imagens com legendas, comparação antes/depois da correção, e compressão automática para economizar espaço.',
        benefits: [
          'Evidência visual para investigação de acidentes',
          'Comprovação de correções implementadas (antes/depois)',
          'Documentação completa para processos legais',
          'Fotos direto do celular, sem necessidade de transferir',
        ],
        example: 'Ex: Incidente com piso escorregadio → técnico fotografa o local → registra no sistema → após correção, tira nova foto → relatório completo com evidências visuais.',
      },
    ],
  },
  {
    phase: 'Fase 3 — Escala',
    color: 'bg-purple-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    items: [
      {
        icon: Building2,
        title: 'Multi-Empresa / Multi-Unidade',
        status: 'planned',
        desc: 'Dados isolados por empresa/unidade. Admin Jomaga vê todas, cliente vê apenas a sua.',
        details: 'Arquitetura multi-tenant que permite gerenciar múltiplas empresas/unidades em uma única instalação do sistema. Cada empresa tem seus dados completamente isolados. O administrador da Jomaga tem visão consolidada de todas as empresas, enquanto cada cliente acessa apenas seus próprios dados.',
        benefits: [
          'Escala o negócio sem precisar de instalações separadas',
          'Cada cliente tem privacidade total dos seus dados',
          'Relatórios consolidados para a Jomaga (visão geral de todos os clientes)',
          'Gestão centralizada de múltiplas unidades/filiais',
        ],
        example: 'Ex: Jomaga atende Construtora A, Indústria B e Transportadora C. Cada empresa acessa só seus dados. A Jomaga vê o painel consolidado com indicadores de todas.',
      },
      {
        icon: Smartphone,
        title: 'PWA + Modo Offline',
        status: 'implemented',
        desc: 'PWA instalável com cache offline resiliente, fallback dedicado e sincronização automática de pendências.',
        details: 'A aplicação já pode ser instalada como app, mantém cache local de recursos e navegação com fallback offline dedicado, além de fila de mutações para registrar operações sem internet e sincronizar automaticamente ao reconectar.',
        benefits: [
          'Consulta rápida mesmo sem conexão',
          'Experiência de app nativo no celular',
          'Service worker com cache automático de recursos',
          'Sincronização automática das pendências ao reconectar',
        ],
        example: 'Ex: Técnico registra atualização offline no canteiro e, quando o sinal retorna, o app sincroniza as pendências automaticamente.',
      },
      {
        icon: Mail,
        title: 'Emails Automáticos de Alerta',
        status: 'planned',
        desc: 'Disparo automático de e-mails para responsáveis quando prazos estiverem próximos.',
        details: 'Sistema de notificação por e-mail que dispara automaticamente alertas para os responsáveis quando prazos estão se aproximando. Configurável por tipo de alerta e antecedência (30, 15, 7 dias). Inclui template profissional com detalhes do que precisa ser feito.',
        benefits: [
          'Responsável é avisado mesmo sem acessar o sistema',
          'Reduz drasticamente esquecimentos de prazos',
          'E-mail inclui link direto para a ação necessária',
          'Configurável: cada usuário define quais alertas quer receber',
        ],
        example: 'Ex: 15 dias antes do vencimento do treinamento de NR-10 do João → e-mail automático para o técnico: "Treinamento NR-10 de João Silva vence em 15 dias. Clique aqui para agendar reciclagem."',
      },
      {
        icon: Bot,
        title: 'IA para Sugestão de DDS',
        status: 'implemented',
        desc: 'Inteligência artificial sugere temas e conteúdo de DDS baseado no histórico e NRs aplicáveis.',
        details: 'Motor de inteligência artificial que analisa o histórico de DDS, incidentes recentes, NRs aplicáveis ao setor e sazonalidade para sugerir temas e elaborar o conteúdo completo do DDS. Evita repetição de temas e prioriza assuntos relevantes ao momento.',
        benefits: [
          'Elimina o "branco" na hora de escolher o tema do DDS',
          'Conteúdo sempre relevante e atualizado',
          'Prioriza temas baseados em incidentes recentes',
          'Economia de 30-60 minutos por DDS na preparação',
        ],
        example: 'Ex: Semana passada teve incidente com escada → IA sugere DDS sobre "Uso seguro de escadas e prevenção de quedas" com conteúdo pronto para ser aplicado.',
      },
    ],
  },
];

interface ExtrasItem {
  icon: any;
  title: string;
  status: 'implemented' | 'partial' | 'planned';
  desc: string;
  details: string;
  benefits: string[];
  example: string;
}

const statusMeta = {
  implemented: {
    label: 'Implementado',
    badge: 'bg-green-100 text-green-700 border-green-200',
  },
  partial: {
    label: 'Parcial',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  planned: {
    label: 'Planejado',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
} as const;

const extrasItems: ExtrasItem[] = [
  {
    icon: Zap,
    title: 'Fila de Sincronização Offline',
    status: 'implemented',
    desc: 'Cadastro offline com envio automático de pendências ao reconectar.',
    details: 'Camada de persistência local para criação/edição/exclusão sem internet com fila transacional, retry automático e feedback visual de status para pendências.',
    benefits: [
      'Operação de campo sem bloqueio por ausência de rede',
      'Sincronização automática com controle de tentativas',
      'Menor risco de perda de dados durante deslocamentos',
      'Visibilidade de pendências de envio para o técnico',
    ],
    example: 'Ex: Técnico registra um incidente offline na obra; quando sinal retorna, o item é enviado e marcado como sincronizado.',
  },
  {
    icon: Target,
    title: 'Centro de Notificações com Histórico',
    status: 'planned',
    desc: 'Notificações com lido/não lido, filtros por módulo e trilha de resolução.',
    details: 'Evolução da central atual para manter histórico persistente, classificação de criticidade, responsáveis e status da ação corretiva.',
    benefits: [
      'Rastreabilidade de alertas do início à resolução',
      'Redução de alertas perdidos em operações intensas',
      'Indicadores de SLA por tipo de notificação',
      'Governança de tratativas de SST',
    ],
    example: 'Ex: Alerta de ASO aparece como crítico, recebe responsável e muda para resolvido após atualização do exame.',
  },
  {
    icon: Users,
    title: 'Auditoria / Log de Alterações',
    status: 'planned',
    desc: 'Registra quem alterou o quê e quando para compliance.',
    details: 'Registro automático de todas as ações realizadas no sistema: criação, edição e exclusão de registros. Cada log inclui o usuário, data/hora, o que foi alterado e os valores antes/depois. Essencial para auditorias e conformidade legal.',
    benefits: [
      'Rastreabilidade total para auditorias internas e externas',
      'Identificação rápida de quem fez cada alteração',
      'Proteção contra alterações indevidas',
      'Conformidade com requisitos legais de documentação',
    ],
    example: 'Ex: Auditor pergunta "Quem alterou a data deste treinamento?" → consulta o log → "Alterado por Maria em 15/03 às 14:32, de 01/03 para 10/03".',
  },
  {
    icon: Upload,
    title: 'Importação em Massa (Excel)',
    status: 'planned',
    desc: 'Upload de planilha para cadastrar centenas de colaboradores de uma vez.',
    details: 'Funcionalidade de importação massiva via arquivo Excel (.xlsx). Permite cadastrar centenas de colaboradores, EPIs ou treinamentos de uma só vez. O sistema valida os dados antes de importar e mostra um relatório de erros/sucessos.',
    benefits: [
      'Cadastro de 200+ colaboradores em minutos',
      'Migração fácil de sistemas antigos ou planilhas',
      'Validação automática detecta erros antes de importar',
      'Template de planilha padronizado para download',
    ],
    example: 'Ex: Nova empresa contratou a Jomaga → RH exporta planilha com 150 colaboradores → upload no sistema → todos cadastrados em 2 minutos com validação automática.',
  },
  {
    icon: PenLine,
    title: 'Assinatura Digital',
    status: 'implemented',
    desc: 'Colaborador assina no celular que recebeu EPI ou participou do DDS.',
    details: 'Sistema de assinatura digital na tela do celular ou tablet. O colaborador assina com o dedo confirmando recebimento de EPI, participação em DDS ou ciência de procedimentos. A assinatura fica vinculada ao registro com data/hora e IP.',
    benefits: [
      'Elimina fichas de papel para assinatura',
      'Validade legal como comprovante de entrega/participação',
      'Impossível perder — fica arquivado digitalmente',
      'Agiliza o processo de entrega de EPIs e DDS',
    ],
    example: 'Ex: Técnico entrega luva para Maria → Maria assina na tela do tablet → assinatura digital fica vinculada à ficha de EPI dela com data e hora.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard do Cliente',
    status: 'planned',
    desc: 'Link público read-only para o cliente acompanhar indicadores.',
    details: 'Painel de indicadores acessível por link compartilhável (read-only). O cliente da Jomaga pode acompanhar seus próprios indicadores de segurança em tempo real, sem precisar de login no sistema completo. Inclui gráficos de TF/TG, status de EPIs, treinamentos e DDS.',
    benefits: [
      'Transparência total com o cliente',
      'Cliente acompanha indicadores em tempo real',
      'Não precisa de conta — acesso por link',
      'Fortalece a relação de confiança com o cliente',
    ],
    example: 'Ex: Jomaga envia link para o gerente da Construtora ABC → ele abre no celular e vê: TF = 1.8, 97% EPIs em dia, 100% DDS realizados no mês.',
  },
];

interface ManualGuide {
  id: string;
  icon: any;
  title: string;
  route: string;
  objective: string;
  quickSteps: string[];
  cadastros: string[];
  tips: string[];
  highlights: string[];
  printImage?: string;
}

interface PossibilityGroup {
  icon: any;
  title: string;
  desc: string;
  items: string[];
  example: string;
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildPrintDataUri = (title: string, route: string, highlights: string[]) => {
  const line1 = escapeXml(highlights[0] || 'Operação principal da tela');
  const line2 = escapeXml(highlights[1] || 'Cadastro e atualização de dados');
  const line3 = escapeXml(highlights[2] || 'Consulta e exportação de evidências');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#1A237E"/>
      <stop offset="100%" stop-color="#3949AB"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="700" fill="#f1f5f9"/>
  <rect x="28" y="28" width="1144" height="644" rx="18" fill="#ffffff" stroke="#e2e8f0"/>
  <rect x="28" y="28" width="1144" height="90" rx="18" fill="url(#bg)"/>
  <text x="64" y="82" font-family="Arial" font-size="32" font-weight="700" fill="#ffffff">${escapeXml(title)}</text>
  <text x="64" y="106" font-family="Arial" font-size="16" fill="#cbd5e1">Rota: ${escapeXml(route)}</text>
  <rect x="64" y="150" width="280" height="92" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="364" y="150" width="280" height="92" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="664" y="150" width="280" height="92" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="64" y="268" width="880" height="360" rx="14" fill="#ffffff" stroke="#cbd5e1"/>
  <rect x="970" y="150" width="170" height="478" rx="14" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="90" y="206" font-family="Arial" font-size="18" font-weight="700" fill="#0f172a">KPI</text>
  <text x="390" y="206" font-family="Arial" font-size="18" font-weight="700" fill="#0f172a">Cadastros</text>
  <text x="690" y="206" font-family="Arial" font-size="18" font-weight="700" fill="#0f172a">Ações</text>
  <text x="90" y="322" font-family="Arial" font-size="22" font-weight="700" fill="#1A237E">Print ilustrativo da operação</text>
  <text x="90" y="366" font-family="Arial" font-size="18" fill="#334155">• ${line1}</text>
  <text x="90" y="404" font-family="Arial" font-size="18" fill="#334155">• ${line2}</text>
  <text x="90" y="442" font-family="Arial" font-size="18" fill="#334155">• ${line3}</text>
  <text x="992" y="190" font-family="Arial" font-size="16" font-weight="700" fill="#0f172a">Checklist</text>
  <text x="992" y="230" font-family="Arial" font-size="14" fill="#334155">1. Buscar</text>
  <text x="992" y="260" font-family="Arial" font-size="14" fill="#334155">2. Cadastrar</text>
  <text x="992" y="290" font-family="Arial" font-size="14" fill="#334155">3. Editar</text>
  <text x="992" y="320" font-family="Arial" font-size="14" fill="#334155">4. Exportar</text>
  <text x="992" y="350" font-family="Arial" font-size="14" fill="#334155">5. Revisar</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const manualGuides: ManualGuide[] = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    title: 'Dashboard',
    route: '/',
    objective: 'Acompanhar os indicadores gerais de SST e agir rapidamente nos alertas prioritários.',
    quickSteps: [
      'Abra o Dashboard para ver KPIs de incidentes, EPIs, ASO, treinamentos e DDS.',
      'Clique nos cards e alertas para navegar direto ao módulo que precisa de ação.',
      'Use os gráficos para leitura mensal e tendência operacional.',
    ],
    cadastros: [
      'Não há cadastro direto nesta tela (ela consolida dados dos outros módulos).',
      'Ações são feitas via atalhos para módulos operacionais.',
    ],
    tips: [
      'Priorize alertas vermelhos antes de iniciar novos cadastros.',
      'Use diariamente no início do turno para planejamento.',
    ],
    highlights: ['Leitura rápida de KPIs', 'Atalhos para correção', 'Priorização por criticidade'],
  },
  {
    id: 'colaboradores',
    icon: Users,
    title: 'Colaboradores',
    route: '/colaboradores',
    objective: 'Cadastrar e manter dados de colaboradores, consentimento LGPD e assinatura digital.',
    quickSteps: [
      'Clique em Novo Colaborador e preencha nome, e-mail, matrícula, cargo e vínculo.',
      'Marque o consentimento LGPD e salve o cadastro.',
      'Use Editar para atualizar status ou dados cadastrais e Excluir para remover.',
    ],
    cadastros: [
      'Criar colaborador',
      'Editar colaborador',
      'Excluir colaborador',
      'Gerar link de assinatura digital',
    ],
    tips: [
      'Mantenha matrícula única para evitar duplicidades.',
      'Cadastre assinatura digital para uso em EPI e DDS.',
    ],
    highlights: ['Cadastro mestre de pessoas', 'LGPD e assinatura', 'Base para ASO, EPI e Treinamentos'],
  },
  {
    id: 'epis',
    icon: HardHat,
    title: 'Fichas de EPI',
    route: '/epis',
    objective: 'Controlar entrega, validade e status de EPIs por colaborador.',
    quickSteps: [
      'Clique em Novo EPI e informe item, colaborador e data de validade.',
      'A tela calcula status automático: Ativo, Vencendo ou Expirado.',
      'Use o botão de ficha para imprimir e gerar comprovante.',
    ],
    cadastros: [
      'Cadastrar EPI entregue',
      'Editar registro de EPI',
      'Excluir registro de EPI',
      'Emitir ficha de EPI por colaborador',
    ],
    tips: [
      'Revise itens vencendo em até 30 dias diariamente.',
      'Use a ficha para evidência de auditoria e cliente.',
    ],
    highlights: ['Controle de validade', 'Ficha profissional', 'Assinatura do colaborador'],
  },
  {
    id: 'inventario',
    icon: Package,
    title: 'Inventário de EPI',
    route: '/epis/inventario',
    objective: 'Gerenciar estoque mínimo e reposição de EPIs por item.',
    quickSteps: [
      'Cadastre cada item com estoque atual, mínimo, unidade e observações.',
      'Monitore alertas de itens abaixo do mínimo no topo da tela.',
      'Atualize o estoque sempre após movimentações reais.',
    ],
    cadastros: [
      'Cadastrar item de inventário',
      'Editar estoque e mínimo',
      'Excluir item de inventário',
    ],
    tips: [
      'Use quantidade mínima realista para evitar ruptura.',
      'Padronize unidade (par, unidade, caixa).',
    ],
    highlights: ['Estoque atual x mínimo', 'Alerta automático', 'Planejamento de compra'],
  },
  {
    id: 'treinamentos',
    icon: GraduationCap,
    title: 'Treinamentos',
    route: '/treinamentos',
    objective: 'Cadastrar treinamentos, status, participantes e certificados.',
    quickSteps: [
      'Abra Novo Treinamento e preencha título, instrutor, data e duração.',
      'Selecione participantes e categoria (base/cliente).',
      'Anexe modelo/certificado quando aplicável e salve.',
    ],
    cadastros: [
      'Cadastrar treinamento',
      'Editar treinamento',
      'Excluir treinamento',
      'Upload de certificado',
    ],
    tips: [
      'Atualize status para Concluído logo após a execução.',
      'Use filtros para separar offshore/onshore e cliente/base.',
    ],
    highlights: ['Agenda de treinamentos', 'Participantes por registro', 'Certificados anexados'],
  },
  {
    id: 'matriz',
    icon: TableProperties,
    title: 'Matriz de Treinamento',
    route: '/treinamentos/matriz',
    objective: 'Visualizar aderência por colaborador x treinamento com taxa de conclusão.',
    quickSteps: [
      'Escolha categoria base ou cliente no topo da matriz.',
      'Filtre por contrato e confira status por colaborador.',
      'Use Novo/Editar para ajustar participantes por treinamento.',
    ],
    cadastros: [
      'Criar treinamento na matriz',
      'Editar matriz de participantes',
      'Excluir treinamento da matriz',
    ],
    tips: [
      'Priorize células não iniciadas em treinamentos críticos.',
      'Use taxa de conclusão para reuniões de gestão.',
    ],
    highlights: ['Visão matricial', 'Cobertura por colaborador', 'Conformidade de capacitação'],
  },
  {
    id: 'incidentes',
    icon: ShieldAlert,
    title: 'Gestão de Risco (Incidentes)',
    route: '/incidentes',
    objective: 'Registrar incidentes/acidentes, severidade, status e evidências fotográficas.',
    quickSteps: [
      'Clique em Novo Incidente ou Novo Acidente e preencha título, área e descrição.',
      'Defina severidade, status e anexe fotos de evidência.',
      'Atualize andamento até encerramento e faça revisão periódica.',
    ],
    cadastros: [
      'Cadastrar incidente',
      'Cadastrar acidente',
      'Editar registro de risco',
      'Excluir registro',
      'Upload de fotos',
    ],
    tips: [
      'Use descrição objetiva com local, causa e ação imediata.',
      'Anexe antes/depois para comprovar mitigação.',
    ],
    highlights: ['Registro com severidade', 'Fotos de evidência', 'Acompanhamento por status'],
  },
  {
    id: 'dds',
    icon: CheckSquare,
    title: 'Conformidade DDS',
    route: '/dds',
    objective: 'Registrar DDS com tema, conteúdo, duração e lista de presença.',
    quickSteps: [
      'No modo Novo DDS, informe tema, conteúdo e duração mínima de 15 min.',
      'Selecione participantes e salve o registro.',
      'Use histórico para editar, excluir e imprimir ata/lista de presença.',
    ],
    cadastros: [
      'Cadastrar DDS',
      'Editar DDS',
      'Excluir DDS',
      'Gerar conteúdo com IA',
      'Imprimir lista/ata DDS',
    ],
    tips: [
      'Evite repetição de tema em janelas curtas.',
      'Valide nome do técnico em Configurações antes de salvar.',
    ],
    highlights: ['Registro formal do DDS', 'Participantes com assinatura', 'Impressão profissional'],
  },
  {
    id: 'aso',
    icon: Stethoscope,
    title: 'Gestão de ASO',
    route: '/aso',
    objective: 'Gerenciar exames ocupacionais e alertas de vencimento.',
    quickSteps: [
      'Clique em Novo ASO e selecione colaborador, tipo e resultado do exame.',
      'Informe médico, CRM, data do exame e próxima data quando houver.',
      'Acompanhe alertas de vencimento e atualize periodicamente.',
    ],
    cadastros: [
      'Cadastrar ASO',
      'Editar ASO',
      'Excluir ASO',
    ],
    tips: [
      'Padronize tipo de exame para facilitar filtros.',
      'Verifique alertas próximos de 30 dias com prioridade.',
    ],
    highlights: ['Controle NR-7', 'Alerta de vencimento', 'Histórico médico ocupacional'],
  },
  {
    id: 'relatorios',
    icon: BarChart3,
    title: 'Relatórios e Indicadores',
    route: '/relatorios',
    objective: 'Consolidar indicadores e emitir documentos/PDFs profissionais.',
    quickSteps: [
      'Consulte KPIs e gráficos com dados consolidados de todos os módulos.',
      'Use exportações para CSV e PDFs profissionais no card de ações.',
      'Gerencie documentos anexados para histórico e evidência.',
    ],
    cadastros: [
      'Upload de documento',
      'Excluir documento',
      'Gerar PDFs: Mensal, Ata DDS, Ficha EPI e CAT',
    ],
    tips: [
      'Use o relatório mensal em reuniões de performance.',
      'Padronize categoria de documento para busca futura.',
    ],
    highlights: ['KPI consolidado', 'PDF profissional', 'Gestão documental'],
  },
  {
    id: 'configuracoes',
    icon: Settings,
    title: 'Configurações do Sistema',
    route: '/configuracoes',
    objective: 'Configurar identidade da empresa, perfil, notificações e preferências.',
    quickSteps: [
      'Em Empresa, atualize nome e logo institucional.',
      'Em Perfil, revise seus dados de técnico e preferências de uso.',
      'Em Notificações, ligue/desligue alertas por módulo.',
    ],
    cadastros: [
      'Atualizar identidade da empresa',
      'Atualizar perfil do usuário',
      'Configurar notificações',
      'Ajustar idioma/região',
    ],
    tips: [
      'Atualize logo/nome antes de gerar PDFs oficiais.',
      'Mantenha alertas críticos sempre ativos.',
    ],
    highlights: ['Branding corporativo', 'Perfil e preferências', 'Governança de alertas'],
  },
  {
    id: 'assinatura',
    icon: PenLine,
    title: 'Assinatura Digital (Token)',
    route: '/assinatura/[token]',
    objective: 'Permitir assinatura remota do colaborador via link seguro.',
    quickSteps: [
      'Gere o link na tela de Colaboradores e envie ao colaborador.',
      'O colaborador abre a página de assinatura e assina no dispositivo.',
      'A assinatura fica gravada no cadastro para uso em documentos.',
    ],
    cadastros: [
      'Gerar token de assinatura',
      'Registrar assinatura vinculada ao colaborador',
    ],
    tips: [
      'Use links com validade curta para maior segurança.',
      'Confirme o colaborador correto antes de enviar o token.',
    ],
    highlights: ['Assinatura remota', 'Token com validade', 'Vinculação automática no cadastro'],
  },
].map((guide) => ({
  ...guide,
  printImage: buildPrintDataUri(guide.title, guide.route, guide.highlights),
}));

const possibilitiesCatalog: PossibilityGroup[] = [
  {
    icon: Sparkles,
    title: 'Operação diária de SST',
    desc: 'Tudo que a equipe técnica consegue executar no dia a dia.',
    items: [
      'Controlar EPIs por colaborador com validade automática',
      'Gerenciar inventário e alertas de estoque mínimo',
      'Registrar incidentes/acidentes com fotos e severidade',
      'Executar DDS com presença, conteúdo e impressão',
      'Controlar ASO por tipo de exame e vencimento',
    ],
    example: 'Exemplo: em um único turno, o técnico registra DDS, baixa estoque de EPI, reporta incidente e atualiza ASO vencendo.',
  },
  {
    icon: FileText,
    title: 'Compliance e evidências',
    desc: 'Recursos para auditoria interna, cliente e documentação legal.',
    items: [
      'Gerar relatório mensal profissional em PDF',
      'Emitir ata de DDS, ficha de EPI e relatório CAT',
      'Salvar documentos de suporte no módulo de relatórios',
      'Manter histórico consolidado de ações por módulo',
    ],
    example: 'Exemplo: em auditoria, você entrega PDFs oficiais + evidências fotográficas e documentos anexados em poucos minutos.',
  },
  {
    icon: Smartphone,
    title: 'Mobilidade e operação offline',
    desc: 'Uso do sistema em campo com pouca ou nenhuma conexão.',
    items: [
      'Instalar como PWA em celular ou tablet',
      'Continuar operando em modo offline com cache',
      'Enfileirar cadastros/edições/exclusões sem internet',
      'Sincronizar pendências automaticamente ao reconectar',
    ],
    example: 'Exemplo: técnico sem sinal registra incidente e EPI em campo; ao voltar conexão, tudo sincroniza sozinho.',
  },
  {
    icon: Target,
    title: 'Gestão e tomada de decisão',
    desc: 'Visão executiva para priorizar ações de segurança.',
    items: [
      'Acompanhar KPIs em dashboard e relatórios',
      'Priorizar ações por criticidade de alerta',
      'Monitorar conformidade de treinamentos e EPIs',
      'Planejar rotina usando informações consolidadas',
    ],
    example: 'Exemplo: gestor identifica queda de conformidade em treinamento e direciona plano corretivo na mesma semana.',
  },
  {
    icon: CheckCircle2,
    title: 'Administração do sistema',
    desc: 'Configuração institucional e experiência de uso.',
    items: [
      'Atualizar nome e logo da empresa',
      'Configurar preferências de notificação por usuário',
      'Gerenciar perfil e dados de operação do técnico',
      'Usar assinatura digital vinculada ao cadastro',
    ],
    example: 'Exemplo: após troca de identidade visual, os documentos passam a sair com nova marca automaticamente.',
  },
];

export default function SuportePage() {
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showManualCenter, setShowManualCenter] = useState(false);
  const [manualTab, setManualTab] = useState<'manual' | 'possibilities'>('manual');
  const [selectedGuideId, setSelectedGuideId] = useState(manualGuides[0]?.id || 'dashboard');
  const [selectedItem, setSelectedItem] = useState<(RoadmapItem | ExtrasItem) | null>(null);
  const [selectedColor, setSelectedColor] = useState('bg-green-500');
  const [selectedTextColor, setSelectedTextColor] = useState('text-green-700');

  const selectedGuide = manualGuides.find((guide) => guide.id === selectedGuideId) || manualGuides[0];

  const handleItemClick = (item: RoadmapItem | ExtrasItem, color: string, textColor: string) => {
    setSelectedItem(item);
    setSelectedColor(color);
    setSelectedTextColor(textColor);
  };

  const openManualCenter = (tab: 'manual' | 'possibilities') => {
    setManualTab(tab);
    setShowManualCenter(true);
  };

  return (
    <>
      <Header title="Suporte e Ajuda" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          {[
            { title: "Chat ao Vivo", desc: "Fale com um especialista agora", icon: MessageCircle, color: "bg-green-100 text-green-600", action: undefined },
            { title: "Atualizações Futuras", desc: "Roadmap de novas funcionalidades", icon: Rocket, color: "bg-blue-100 text-blue-600", action: () => setShowRoadmap(true) },
            { title: "Manual Completo", desc: "Guia com todas as telas e cadastros", icon: BookOpen, color: "bg-indigo-100 text-indigo-600", action: () => openManualCenter('manual') },
            { title: "Possibilidades", desc: "Tudo que pode ser feito no sistema", icon: Sparkles, color: "bg-amber-100 text-amber-600", action: () => openManualCenter('possibilities') },
            { title: "Central Telefônica", desc: "0800 123 4567", icon: Phone, color: "bg-purple-100 text-purple-600", action: undefined },
          ].map((item, i) => (
            <div
              key={i}
              onClick={item.action}
              className={cn(
                'bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3 transition-shadow',
                item.action ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
              )}
            >
              <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto`}>
                <item.icon size={24} />
              </div>
              <h4 className="font-bold text-slate-800">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#1A237E] p-8 rounded-xl text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Precisa de ajuda urgente?</h3>
            <p className="text-slate-300 text-sm">Nossa equipe de suporte técnico está disponível 24/7 para emergências.</p>
          </div>
          <button className="bg-white text-[#1A237E] px-6 py-2 rounded-lg font-bold hover:bg-slate-100 transition-all">
            Abrir Chamado
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Base de Conhecimento do Sistema</h3>
              <p className="text-sm text-slate-500">Manual completo por tela com prints ilustrativos, fluxos de cadastro e catálogo de possibilidades.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="px-2 py-1 rounded-full bg-slate-100 font-semibold">{manualGuides.length} telas documentadas</span>
              <span className="px-2 py-1 rounded-full bg-slate-100 font-semibold">{possibilitiesCatalog.length} grupos de possibilidades</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openManualCenter('manual')}
              className="flex-1 px-4 py-3 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-200 hover:bg-indigo-100 transition-colors"
            >
              Abrir Manual de Uso
            </button>
            <button
              onClick={() => openManualCenter('possibilities')}
              className="flex-1 px-4 py-3 rounded-lg bg-amber-50 text-amber-700 font-bold text-sm border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              Ver Possibilidades do Sistema
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showManualCenter && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManualCenter(false)}
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-[#1A237E] to-[#3949AB]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-lg">
                      {manualTab === 'manual' ? <BookOpen size={22} className="text-white" /> : <Sparkles size={22} className="text-white" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Central de Uso do SafeWork</h3>
                      <p className="text-xs text-white/70">Manual com prints por tela e catálogo de possibilidades operacionais</p>
                    </div>
                  </div>
                  <button onClick={() => setShowManualCenter(false)} className="p-2 text-white/70 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => setManualTab('manual')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                      manualTab === 'manual'
                        ? 'bg-white text-[#1A237E] border-white'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    )}
                  >
                    Manual por Tela
                  </button>
                  <button
                    onClick={() => setManualTab('possibilities')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                      manualTab === 'possibilities'
                        ? 'bg-white text-[#1A237E] border-white'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                    )}
                  >
                    Possibilidades do Sistema
                  </button>
                </div>
              </div>

              <div className="max-h-[75vh] overflow-y-auto p-6">
                {manualTab === 'manual' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {manualGuides.map((guide) => (
                        <button
                          key={guide.id}
                          onClick={() => setSelectedGuideId(guide.id)}
                          className={cn(
                            'text-left p-4 rounded-xl border transition-all hover:shadow-md',
                            selectedGuide?.id === guide.id
                              ? 'border-indigo-300 bg-indigo-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'p-2 rounded-lg',
                              selectedGuide?.id === guide.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            )}>
                              <guide.icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{guide.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{guide.route}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedGuide && (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-slate-100 bg-slate-50">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-indigo-600 text-white">
                              <selectedGuide.icon size={18} />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-slate-800">{selectedGuide.title}</h4>
                              <p className="text-xs text-slate-500">Rota: {selectedGuide.route}</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">{selectedGuide.objective}</p>
                        </div>

                        <div className="p-5 space-y-5">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Print ilustrativo da tela</p>
                            <img
                              src={selectedGuide.printImage}
                              alt={`Print ilustrativo da tela ${selectedGuide.title}`}
                              className="w-full rounded-xl border border-slate-200"
                            />
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700 mb-2">Como usar</p>
                              <div className="space-y-2">
                                {selectedGuide.quickSteps.map((step, index) => (
                                  <p key={index} className="text-sm text-indigo-900">{index + 1}. {step}</p>
                                ))}
                              </div>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2">Cadastros e ações desta tela</p>
                              <div className="space-y-2">
                                {selectedGuide.cadastros.map((item, index) => (
                                  <p key={index} className="text-sm text-emerald-900">• {item}</p>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-2">Boas práticas</p>
                            <div className="space-y-2">
                              {selectedGuide.tips.map((tip, index) => (
                                <p key={index} className="text-sm text-amber-900">• {tip}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {possibilitiesCatalog.map((group) => (
                      <div key={group.title} className="border border-slate-200 rounded-xl p-5 bg-white">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                            <group.icon size={18} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-800">{group.title}</h4>
                            <p className="text-sm text-slate-500">{group.desc}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          {group.items.map((item, index) => (
                            <p key={index} className="text-sm text-slate-700">• {item}</p>
                          ))}
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Exemplo de uso</p>
                          <p className="text-sm text-slate-700">{group.example}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setShowManualCenter(false)}
                  className="w-full px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all text-sm"
                >
                  Fechar Central de Uso
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Atualizações Futuras */}
      <AnimatePresence>
        {showRoadmap && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRoadmap(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-[#1A237E] to-[#3949AB]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-lg">
                      <Rocket size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Atualizações Futuras</h3>
                      <p className="text-xs text-white/60">Roadmap com status real: implementado, parcial e planejado</p>
                    </div>
                  </div>
                  <button onClick={() => setShowRoadmap(false)} className="p-2 text-white/60 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {selectedItem ? (
                    /* === DETALHE DO ITEM === */
                    <motion.div
                      key="detail"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1A237E] transition-colors"
                      >
                        <ArrowLeft size={16} />
                        Voltar ao Roadmap
                      </button>

                      {/* Cabeçalho do item */}
                      <div className="flex items-start gap-4">
                        <div className={cn('p-3 rounded-xl text-white shrink-0', selectedColor)}>
                          <selectedItem.icon size={28} />
                        </div>
                        <div>
                          <h4 className={cn('text-xl font-bold', selectedTextColor)}>{selectedItem.title}</h4>
                          <span className={cn('inline-flex items-center px-2 py-0.5 mt-1 border rounded-full text-[10px] font-bold uppercase tracking-wide', statusMeta[selectedItem.status].badge)}>
                            {statusMeta[selectedItem.status].label}
                          </span>
                          <p className="text-sm text-slate-500 mt-1">{selectedItem.desc}</p>
                        </div>
                      </div>

                      {/* O que é / Como funciona */}
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Target size={16} className="text-[#1A237E]" />
                          <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wider">O que é e como funciona</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{selectedItem.details}</p>
                      </div>

                      {/* Benefícios */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp size={16} className="text-green-600" />
                          <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Melhorias que traz ao sistema</h5>
                        </div>
                        <div className="space-y-2">
                          {selectedItem.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                              <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                <Zap size={12} />
                              </div>
                              <p className="text-sm text-green-800">{benefit}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Exemplo prático */}
                      <div className="bg-[#1A237E]/5 p-5 rounded-xl border border-[#1A237E]/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap size={16} className="text-[#1A237E]" />
                          <h5 className="text-sm font-bold text-[#1A237E] uppercase tracking-wider">Exemplo prático</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">{selectedItem.example}</p>
                      </div>
                    </motion.div>
                  ) : (
                    /* === LISTA DO ROADMAP === */
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {roadmapPhases.map((phase) => (
                        <div key={phase.phase}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{phase.phase}</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {phase.items.map((item) => (
                              <button
                                key={item.title}
                                onClick={() => handleItemClick(item, phase.color, phase.textColor)}
                                className={cn(
                                  'p-4 rounded-xl border text-left transition-all hover:shadow-md hover:scale-[1.02] group',
                                  phase.borderColor, phase.bgColor
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn('p-2 rounded-lg text-white shrink-0 group-hover:scale-110 transition-transform', phase.color)}>
                                    <item.icon size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                          <p className={cn('text-sm font-bold', phase.textColor)}>{item.title}</p>
                                      <ChevronRight size={14} className={cn('shrink-0 opacity-0 group-hover:opacity-100 transition-opacity', phase.textColor)} />
                                    </div>
                                        <span className={cn('inline-flex items-center px-2 py-0.5 mt-1 border rounded-full text-[9px] font-bold uppercase tracking-wide', statusMeta[item.status].badge)}>
                                          {statusMeta[item.status].label}
                                        </span>
                                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Extras */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Extras Planejados</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {extrasItems.map((item) => (
                            <button
                              key={item.title}
                              onClick={() => handleItemClick(item, 'bg-orange-500', 'text-orange-700')}
                              className="p-4 rounded-xl border border-orange-200 bg-orange-50 text-left transition-all hover:shadow-md hover:scale-[1.02] group"
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-orange-500 text-white shrink-0 group-hover:scale-110 transition-transform">
                                  <item.icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-sm font-bold text-orange-700">{item.title}</p>
                                    <ChevronRight size={14} className="shrink-0 text-orange-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <span className={cn('inline-flex items-center px-2 py-0.5 mt-1 border rounded-full text-[9px] font-bold uppercase tracking-wide', statusMeta[item.status].badge)}>
                                    {statusMeta[item.status].label}
                                  </span>
                                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => { setSelectedItem(null); setShowRoadmap(false); }}
                  className="w-full px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all text-sm"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
