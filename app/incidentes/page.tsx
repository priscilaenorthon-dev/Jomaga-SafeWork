'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { AlertTriangle, PlusCircle, Filter, X, Check, MapPin, Info, FileText, Loader2, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { createClient } from '@/lib/supabase-client';

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
  const supabase = createClient();
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncidente, setEditingIncidente] = useState<Incidente | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'' | 'Baixa' | 'Média' | 'Alta'>('');
  const [filterStatus, setFilterStatus] = useState<'' | 'Aberto' | 'Em análise' | 'Fechado'>('');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    area: '',
    severity: 'Baixa' as 'Baixa' | 'Média' | 'Alta',
    description: '',
    status: 'Aberto' as 'Aberto' | 'Em análise' | 'Fechado'
  });

  useEffect(() => {
    fetchIncidentes();
  }, []);

  const fetchIncidentes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidentes(data || []);
    } catch (error: any) {
      console.error('Error fetching incidents:', error.message);
      toast.error('Erro ao carregar incidentes');
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidentes = incidentes.filter(inc => {
    const matchSearch = !searchTerm ||
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity = !filterSeverity || inc.severity === filterSeverity;
    const matchStatus = !filterStatus || inc.status === filterStatus;
    return matchSearch && matchSeverity && matchStatus;
  });

  const activeFiltersCount = [filterSeverity, filterStatus].filter(Boolean).length;

  const clearFilters = () => {
    setFilterSeverity('');
    setFilterStatus('');
    setSearchTerm('');
  };

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

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', confirmDeleteId);

      if (error) throw error;
      toast.success('Incidente excluído com sucesso!');
      setConfirmDeleteId(null);
      fetchIncidentes();
    } catch (error: any) {
      console.error('Error deleting incident:', error.message);
      toast.error('Erro ao excluir incidente');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.area.trim()) {
      toast.error('Título e área são obrigatórios.');
      return;
    }

    try {
      if (editingIncidente) {
        const { error } = await supabase
          .from('incidents')
          .update({
            title: formData.title.trim(),
            area: formData.area.trim(),
            severity: formData.severity,
            description: formData.description.trim(),
            status: formData.status
          })
          .eq('id', editingIncidente.id);

        if (error) throw error;
        toast.success('Incidente atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('incidents')
          .insert([{
            title: formData.title.trim(),
            area: formData.area.trim(),
            severity: formData.severity,
            description: formData.description.trim(),
            status: 'Aberto',
            date: new Date().toLocaleDateString('pt-BR')
          }]);

        if (error) throw error;
        toast.success('Incidente reportado com sucesso!');
      }
      fetchIncidentes();
      setIsModalOpen(false);
      setFormData({ title: '', area: '', severity: 'Baixa', description: '', status: 'Aberto' });
    } catch (error: any) {
      console.error('Error saving incident:', error.message);
      toast.error('Erro ao salvar incidente');
    }
  };

  return (
    <>
      <Header title="Gestão de Incidentes" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por título ou área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </div>
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all',
                  showFilters || activeFiltersCount > 0
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                )}
              >
                <Filter size={16} />
                Filtrar
                {activeFiltersCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
                <ChevronDown size={14} className={cn('transition-transform', showFilters && 'rotate-180')} />
              </button>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-all"
            >
              <PlusCircle size={18} /> Reportar Incidente
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-end overflow-hidden"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Gravidade</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as typeof filterSeverity)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
                  >
                    <option value="">Todas</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none"
                  >
                    <option value="">Todos</option>
                    <option value="Aberto">Aberto</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Fechado">Fechado</option>
                  </select>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium"
                  >
                    <X size={14} /> Limpar filtros
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results summary */}
        {(searchTerm || activeFiltersCount > 0) && !loading && (
          <p className="text-sm text-slate-500">
            {filteredIncidentes.length} resultado{filteredIncidentes.length !== 1 ? 's' : ''} encontrado{filteredIncidentes.length !== 1 ? 's' : ''}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="animate-spin mb-2" size={24} />
              <span>Carregando incidentes...</span>
            </div>
          ) : filteredIncidentes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
              {searchTerm || activeFiltersCount > 0 ? 'Nenhum incidente encontrado com os filtros aplicados.' : 'Nenhum incidente reportado.'}
            </div>
          ) : (
            filteredIncidentes.map((inc, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={inc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-red-200 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    'p-3 rounded-xl',
                    inc.severity === 'Alta' ? 'bg-red-100 text-red-600' :
                    inc.severity === 'Média' ? 'bg-orange-100 text-orange-600' :
                    'bg-yellow-100 text-yellow-600'
                  )}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{inc.id.slice(0, 8)} • {inc.area}</div>
                    <h4 className="font-bold text-slate-800">{inc.title}</h4>
                    {inc.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{inc.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-xs font-medium text-slate-500">{inc.date}</div>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
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
                      onClick={() => setConfirmDeleteId(inc.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal Reportar/Editar Incidente */}
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
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
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
                        onChange={e => setFormData({ ...formData, area: e.target.value })}
                        placeholder="Ex: Produção A"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Gravidade</label>
                    <select
                      value={formData.severity}
                      onChange={e => setFormData({ ...formData, severity: e.target.value as 'Baixa' | 'Média' | 'Alta' })}
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
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'Aberto' | 'Em análise' | 'Fechado' })}
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
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Incidente?</h3>
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
