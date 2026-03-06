'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { MessageCircle, Phone, Rocket, X, Bell, ClipboardCheck, Calendar, BarChart3, Camera, Building2, Smartphone, Mail, Bot, FileText, Shield, Users, Upload, PenLine, LayoutDashboard, ArrowLeft, Zap, Target, TrendingUp, ChevronRight } from 'lucide-react';
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
        status: 'partial',
        desc: 'PWA instalável com cache offline de leitura e fallback dedicado para falta de conexão.',
        details: 'A aplicação já pode ser instalada como app e mantém cache local para consulta das telas visitadas sem internet. Quando offline, o usuário recebe fallback claro de conectividade. A sincronização avançada bidirecional entra na próxima fase.',
        benefits: [
          'Consulta rápida mesmo sem conexão',
          'Experiência de app nativo no celular',
          'Service worker com cache automático de recursos',
          'Base pronta para fila de sincronização futura',
        ],
        example: 'Ex: Técnico abre o sistema em área sem sinal e ainda consulta páginas em cache; ao reconectar, volta ao fluxo normal online.',
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
    status: 'planned',
    desc: 'Cadastro offline com envio automático de pendências ao reconectar.',
    details: 'Camada de persistência local para criação/edição sem internet com fila transacional, retry automático e feedback de sincronização por item.',
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

export default function SuportePage() {
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [selectedItem, setSelectedItem] = useState<(RoadmapItem | ExtrasItem) | null>(null);
  const [selectedColor, setSelectedColor] = useState('bg-green-500');
  const [selectedTextColor, setSelectedTextColor] = useState('text-green-700');

  const handleItemClick = (item: RoadmapItem | ExtrasItem, color: string, textColor: string) => {
    setSelectedItem(item);
    setSelectedColor(color);
    setSelectedTextColor(textColor);
  };

  return (
    <>
      <Header title="Suporte e Ajuda" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Chat ao Vivo", desc: "Fale com um especialista agora", icon: MessageCircle, color: "bg-green-100 text-green-600", action: undefined },
            { title: "Atualizações Futuras", desc: "Roadmap de novas funcionalidades", icon: Rocket, color: "bg-blue-100 text-blue-600", action: () => setShowRoadmap(true) },
            { title: "Central Telefônica", desc: "0800 123 4567", icon: Phone, color: "bg-purple-100 text-purple-600", action: undefined },
          ].map((item, i) => (
            <div
              key={i}
              onClick={item.action}
              className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3 hover:shadow-md transition-shadow cursor-pointer"
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
      </div>

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
