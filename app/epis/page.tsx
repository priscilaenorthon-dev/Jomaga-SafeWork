'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import {
  HardHat,
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
  Calendar,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';

interface EPI {
  id: string;
  item: string;
  user: string;
  status: 'Ativo' | 'Vencendo' | 'Expirado';
  date: string;
}

interface Collaborator {
  id: string;
  name: string;
}

/** Calculates EPI status from the expiry date string (YYYY-MM-DD or ISO). */
function calcStatus(dateStr: string): 'Ativo' | 'Vencendo' | 'Expirado' {
  if (!dateStr) return 'Ativo';
  const expiry = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expirado';
  if (diffDays <= 30) return 'Vencendo';
  return 'Ativo';
}

export default function EPIsPage() {
  const supabase = createClient();
  const [epis, setEpis] = useState<EPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEPI, setEditingEPI] = useState<EPI | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ item: '', user: '', date: '' });
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    fetchEPIs();
    fetchCollaborators();
  }, []);

  const fetchEPIs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('epis')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      // Recalculate status from date on load and patch DB if stale
      const updated = (data || []).map((e: EPI) => ({
        ...e,
        status: calcStatus(e.date),
      }));
      setEpis(updated);
    } catch (error: any) {
      console.error('Error fetching EPIs:', error.message);
      toast.error('Erro ao carregar EPIs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborators = async () => {
    const { data } = await supabase
      .from('collaborators')
      .select('id, name')
      .eq('status', 'Ativo')
      .order('name');
    if (data) setCollaborators(data);
  };

  const filteredEPIs = epis.filter(e =>
    e.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats derived from real data
  const totalAtivo = epis.filter(e => e.status === 'Ativo').length;
  const totalVencendo = epis.filter(e => e.status === 'Vencendo').length;
  const totalExpirado = epis.filter(e => e.status === 'Expirado').length;
  const conformidade = epis.length > 0
    ? Math.round((totalAtivo / epis.length) * 100)
    : 0;

  const handleOpenModal = (epi?: EPI) => {
    if (epi) {
      setEditingEPI(epi);
      setFormData({ item: epi.item, user: epi.user, date: epi.date });
    } else {
      setEditingEPI(null);
      setFormData({ item: '', user: '', date: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEPI(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.item.trim() || !formData.user.trim() || !formData.date) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }

    const status = calcStatus(formData.date);

    try {
      if (editingEPI) {
        const { error } = await supabase
          .from('epis')
          .update({ name: formData.item.trim(), item: formData.item.trim(), user: formData.user.trim(), status, date: formData.date })
          .eq('id', editingEPI.id);

        if (error) throw error;
        toast.success('EPI atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('epis')
          .insert([{ name: formData.item.trim(), item: formData.item.trim(), user: formData.user.trim(), status, date: formData.date }]);

        if (error) throw error;
        toast.success('EPI registrado com sucesso!');
      }
      fetchEPIs();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving EPI:', error.message);
      toast.error('Erro ao salvar EPI');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const { error } = await supabase.from('epis').delete().eq('id', confirmDeleteId);
      if (error) throw error;
      toast.success('EPI removido do sistema.');
      setConfirmDeleteId(null);
      fetchEPIs();
    } catch (error: any) {
      console.error('Error deleting EPI:', error.message);
      toast.error('Erro ao excluir EPI');
    }
  };

  return (
    <>
      <Header title="Gestão de EPIs" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Stats — all calculated from real data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total em Uso', value: epis.length.toString(), icon: HardHat, color: 'text-primary' },
            { label: 'Vencendo (30d)', value: totalVencendo.toString(), icon: AlertCircle, color: 'text-orange-600' },
            { label: 'Expirados', value: totalExpirado.toString(), icon: X, color: 'text-red-600' },
            {
              label: 'Conformidade',
              value: epis.length > 0 ? `${conformidade}%` : '—',
              icon: CheckCircle2,
              color: conformidade >= 80 ? 'text-green-600' : 'text-orange-600'
            },
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
              <div className="text-2xl font-bold text-slate-800">{loading ? '—' : stat.value}</div>
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
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando EPIs...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
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
                            'px-2 py-1 rounded-full text-[10px] font-bold uppercase',
                            e.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                            e.status === 'Vencendo' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          )}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {e.date ? new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
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
                              onClick={() => setConfirmDeleteId(e.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
                {!loading && filteredEPIs.length === 0 && (
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
                  <select
                    required
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                    value={formData.user}
                    onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  >
                    <option value="">Selecione um colaborador</option>
                    {collaborators.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {/* Garante que o valor salvo apareça mesmo se o colaborador foi inativado */}
                    {formData.user && !collaborators.find(c => c.name === formData.user) && (
                      <option value={formData.user}>{formData.user}</option>
                    )}
                  </select>
                  {collaborators.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1">Nenhum colaborador ativo cadastrado.</p>
                  )}
                </div>

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
                  {/* Live status preview */}
                  {formData.date && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">Status automático:</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        calcStatus(formData.date) === 'Ativo' ? 'bg-green-100 text-green-700' :
                        calcStatus(formData.date) === 'Vencendo' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {calcStatus(formData.date)}
                      </span>
                    </div>
                  )}
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

      {/* Modal Confirmar Exclusão */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir EPI?</h3>
              <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
