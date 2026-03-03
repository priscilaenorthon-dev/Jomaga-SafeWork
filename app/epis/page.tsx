'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { 
  HardHat, 
  Package, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  Tag,
  User,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EPI {
  id: string;
  item: string;
  user: string;
  status: 'Ativo' | 'Vencendo' | 'Expirado';
  date: string;
}

const initialEPIs: EPI[] = [
  { id: '1', item: "Capacete de Segurança", user: "Carlos Rocha", status: "Ativo", date: "2026-12-12" },
  { id: '2', item: "Luvas Nitrílicas", user: "Ana Souza", status: "Vencendo", date: "2026-03-15" },
  { id: '3', item: "Protetor Auricular", user: "Marcos Lima", status: "Ativo", date: "2027-08-20" },
  { id: '4', item: "Óculos de Proteção", user: "Julia Silva", status: "Expirado", date: "2026-03-01" },
];

export default function EPIsPage() {
  const [epis, setEpis] = useState<EPI[]>(initialEPIs);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEPI, setEditingEPI] = useState<EPI | null>(null);
  const [formData, setFormData] = useState<Omit<EPI, 'id'>>({
    item: '',
    user: '',
    status: 'Ativo',
    date: ''
  });

  const filteredEPIs = epis.filter(e => 
    e.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (epi?: EPI) => {
    if (epi) {
      setEditingEPI(epi);
      setFormData({
        item: epi.item,
        user: epi.user,
        status: epi.status,
        date: epi.date
      });
    } else {
      setEditingEPI(null);
      setFormData({
        item: '',
        user: '',
        status: 'Ativo',
        date: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEPI(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEPI) {
      setEpis(prev => prev.map(item => item.id === editingEPI.id ? { ...formData, id: item.id } : item));
      toast.success('EPI atualizado com sucesso!');
    } else {
      const newEPI = { ...formData, id: Math.random().toString(36).substr(2, 9) };
      setEpis(prev => [...prev, newEPI]);
      toast.success('EPI registrado com sucesso!');
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setEpis(prev => prev.filter(item => item.id !== id));
    toast.error('EPI removido do sistema.');
  };

  return (
    <>
      <Header title="Gestão de EPIs" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total em Uso", value: epis.length.toString(), icon: HardHat, color: "text-primary" },
            { label: "Vencendo (30d)", value: epis.filter(e => e.status === 'Vencendo').length.toString(), icon: AlertCircle, color: "text-orange-600" },
            { label: "Expirados", value: epis.filter(e => e.status === 'Expirado').length.toString(), icon: X, color: "text-red-600" },
            { label: "Conformidade", value: "98.2%", icon: CheckCircle2, color: "text-green-600" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon size={18} className={stat.color} />
                <span className="text-xs font-bold text-slate-500 uppercase">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por item ou colaborador..."
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-sm"
          >
            <Plus size={20} />
            Novo Registro de EPI
          </button>
        </div>

        {/* EPI List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Item</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Colaborador</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Vencimento</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode='popLayout'>
                  {filteredEPIs.map((e) => (
                    <motion.tr 
                      key={e.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">{e.item}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{e.user}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                          e.status === 'Ativo' ? "bg-green-100 text-green-700" : 
                          e.status === 'Vencendo' ? "bg-orange-100 text-orange-700" : 
                          "bg-red-100 text-red-700"
                        )}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(e.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(e)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(e.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredEPIs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Nenhum registro de EPI encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingEPI ? 'Editar Registro de EPI' : 'Novo Registro de EPI'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Tag size={14} /> Nome do Item
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: Capacete de Segurança"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <User size={14} /> Colaborador Responsável
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="Nome do colaborador"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.user}
                    onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Calendar size={14} /> Data de Vencimento
                    </label>
                    <input 
                      required
                      type="date" 
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select 
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Vencendo">Vencendo</option>
                      <option value="Expirado">Expirado</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    {editingEPI ? 'Salvar Alterações' : 'Registrar'}
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
