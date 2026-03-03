'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { AlertTriangle, PlusCircle, Filter, X, Check, Calendar, MapPin, Info, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Incidente {
  id: string;
  title: string;
  area: string;
  severity: 'Baixa' | 'Média' | 'Alta';
  date: string;
  status: 'Aberto' | 'Em análise' | 'Fechado';
  description?: string;
}

export default function IncidentesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncidente, setEditingIncidente] = useState<Incidente | null>(null);
  const [incidentes, setIncidentes] = useState<Incidente[]>([
    { id: "INC-001", title: "Queda de nível", area: "Produção A", severity: "Média", date: "02/03/2026", status: "Aberto", description: "Colaborador escorregou em poça de óleo." },
    { id: "INC-002", title: "Vazamento de óleo", area: "Manutenção", severity: "Baixa", date: "01/03/2026", status: "Em análise", description: "Pequeno vazamento detectado na máquina 4." },
    { id: "INC-003", title: "Curto-circuito painel", area: "Elétrica", severity: "Alta", date: "28/02/2026", status: "Fechado", description: "Painel elétrico principal apresentou faíscas." },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    area: '',
    severity: 'Baixa' as 'Baixa' | 'Média' | 'Alta',
    description: '',
    status: 'Aberto' as 'Aberto' | 'Em análise' | 'Fechado'
  });

  const handleOpenModal = (incidente?: Incidente) => {
    if (incidente) {
      setEditingIncidente(incidente);
      setFormData({
        title: incidente.title,
        area: incidente.area,
        severity: incidente.severity,
        description: incidente.description || '',
        status: incidente.status
      });
    } else {
      setEditingIncidente(null);
      setFormData({ title: '', area: '', severity: 'Baixa', description: '', status: 'Aberto' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este incidente?')) {
      setIncidentes(incidentes.filter(inc => inc.id !== id));
      toast.success('Incidente excluído com sucesso!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIncidente) {
      setIncidentes(incidentes.map(inc => 
        inc.id === editingIncidente.id 
          ? { ...inc, ...formData } 
          : inc
      ));
      toast.success('Incidente atualizado com sucesso!');
    } else {
      const newIncidente: Incidente = {
        id: `INC-00${incidentes.length + 1}`,
        title: formData.title,
        area: formData.area,
        severity: formData.severity,
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'Aberto',
        description: formData.description
      };
      setIncidentes([newIncidente, ...incidentes]);
      toast.success('Incidente reportado com sucesso!');
    }

    setIsModalOpen(false);
    setFormData({ title: '', area: '', severity: 'Baixa', description: '', status: 'Aberto' });
  };

  return (
    <>
      <Header title="Gestão de Incidentes" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">
              <Filter size={16} /> Filtrar
            </button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-all"
          >
            <PlusCircle size={18} /> Reportar Incidente
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {incidentes.map((inc, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={inc.id} 
              className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-red-200 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "p-3 rounded-xl",
                  inc.severity === 'Alta' ? 'bg-red-100 text-red-600' : 
                  inc.severity === 'Média' ? 'bg-orange-100 text-orange-600' : 
                  'bg-yellow-100 text-yellow-600'
                )}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{inc.id} • {inc.area}</div>
                  <h4 className="font-bold text-slate-800">{inc.title}</h4>
                  {inc.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{inc.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-xs font-medium text-slate-500">{inc.date}</div>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    inc.status === 'Aberto' ? 'bg-red-50 text-red-600' : 
                    inc.status === 'Em análise' ? 'bg-blue-50 text-blue-600' : 
                    'bg-green-50 text-green-600'
                  )}>
                    {inc.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                  <button 
                    onClick={() => handleOpenModal(inc)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Editar"
                  >
                    <FileText size={18} className="text-slate-400" />
                  </button>
                  <button 
                    onClick={() => handleDelete(inc.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Reportar Incidente */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{editingIncidente ? 'Editar Incidente' : 'Reportar Novo Incidente'}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Título do Incidente</label>
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="Ex: Queda de material, Vazamento..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Área / Setor</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        value={formData.area}
                        onChange={e => setFormData({...formData, area: e.target.value})}
                        placeholder="Ex: Produção A"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Gravidade</label>
                    <select 
                      value={formData.severity}
                      onChange={e => setFormData({...formData, severity: e.target.value as any})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    >
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Fechado">Fechado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Descrição Detalhada</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="Descreva o que aconteceu..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                  >
                    <Check size={20} />
                    {editingIncidente ? 'Salvar Alterações' : 'Enviar Relato'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
