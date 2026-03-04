'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { MessageCircle, Phone, Rocket, X, Bell, ClipboardCheck, Calendar, BarChart3, Camera, Building2, Smartphone, Mail, Bot, FileText, Shield, Users, Upload, PenLine, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const roadmapPhases = [
  {
    phase: 'Fase 1 — Essencial',
    color: 'bg-green-500',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    items: [
      { icon: Bell, title: 'Sistema de Alertas e Notificações', desc: 'Alertas automáticos para EPIs vencendo, treinamentos expirando, ASOs e DDS não realizados.' },
      { icon: FileText, title: 'Gestão de ASO', desc: 'Controle de Atestados de Saúde Ocupacional — admissional, periódico, demissional com upload de PDF.' },
      { icon: Shield, title: 'Níveis de Acesso (RBAC)', desc: 'Perfis de Admin, Técnico SST, Gestor e Colaborador com permissões diferenciadas.' },
      { icon: FileText, title: 'Relatórios PDF Profissionais', desc: 'Geração de PDFs formatados com logo da empresa — relatório mensal, ficha de EPI, ata de DDS.' },
    ],
  },
  {
    phase: 'Fase 2 — Diferencial',
    color: 'bg-blue-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    items: [
      { icon: ClipboardCheck, title: 'Checklists de Inspeção', desc: 'Templates por área (Elétrica, Altura, etc.) com itens Conforme/Não Conforme e plano de ação automático.' },
      { icon: Calendar, title: 'Calendário de SST', desc: 'Visualização mensal de vencimentos de EPIs, ASOs, treinamentos, DDS e auditorias.' },
      { icon: BarChart3, title: 'Indicadores TF/TG', desc: 'Taxa de Frequência e Gravidade, % DDS realizados, % EPIs e treinamentos em dia.' },
      { icon: Camera, title: 'Fotos em Incidentes', desc: 'Upload de registro fotográfico com antes/depois para investigação de acidentes.' },
    ],
  },
  {
    phase: 'Fase 3 — Escala',
    color: 'bg-purple-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    items: [
      { icon: Building2, title: 'Multi-Empresa / Multi-Unidade', desc: 'Dados isolados por empresa/unidade. Admin Jomaga vê todas, cliente vê apenas a sua.' },
      { icon: Smartphone, title: 'PWA + Modo Offline', desc: 'Instala no celular como app nativo. Funciona sem internet e sincroniza ao reconectar.' },
      { icon: Mail, title: 'Emails Automáticos de Alerta', desc: 'Disparo automático de e-mails para responsáveis quando prazos estiverem próximos.' },
      { icon: Bot, title: 'IA para Sugestão de DDS', desc: 'Inteligência artificial sugere temas e conteúdo de DDS baseado no histórico e NRs aplicáveis.' },
    ],
  },
];

const extrasItems = [
  { icon: Users, title: 'Auditoria / Log de Alterações', desc: 'Registra quem alterou o quê e quando para compliance.' },
  { icon: Upload, title: 'Importação em Massa (Excel)', desc: 'Upload de planilha para cadastrar centenas de colaboradores de uma vez.' },
  { icon: PenLine, title: 'Assinatura Digital', desc: 'Colaborador assina no celular que recebeu EPI ou participou do DDS.' },
  { icon: LayoutDashboard, title: 'Dashboard do Cliente', desc: 'Link público read-only para o cliente acompanhar indicadores.' },
];

export default function SuportePage() {
  const [showRoadmap, setShowRoadmap] = useState(false);

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
                      <p className="text-xs text-white/60">Roadmap de funcionalidades planejadas</p>
                    </div>
                  </div>
                  <button onClick={() => setShowRoadmap(false)} className="p-2 text-white/60 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {roadmapPhases.map((phase) => (
                  <div key={phase.phase}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${phase.color}`} />
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{phase.phase}</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {phase.items.map((item) => (
                        <div key={item.title} className={`p-4 rounded-xl border ${phase.borderColor} ${phase.bgColor}`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${phase.color} text-white shrink-0`}>
                              <item.icon size={16} />
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${phase.textColor}`}>{item.title}</p>
                              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                            </div>
                          </div>
                        </div>
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
                      <div key={item.title} className="p-4 rounded-xl border border-orange-200 bg-orange-50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-orange-500 text-white shrink-0">
                            <item.icon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-orange-700">{item.title}</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setShowRoadmap(false)}
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
