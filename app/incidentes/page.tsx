'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import {
  AlertTriangle,
  PlusCircle,
  Filter,
  X,
  Check,
  MapPin,
  Info,
  FileText,
  Loader2,
  Search,
  ChevronDown,
  Camera,
  Upload,
  Siren,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import { executeMutationWithOfflineQueue } from '@/lib/offline-queue';

interface Incidente {
  id: string;
  title: string;
  area: string;
  severity: 'Baixa' | 'Média' | 'Alta';
  date: string;
  status: 'Aberto' | 'Em análise' | 'Fechado';
  description?: string;
  type?: 'incidente' | 'acidente';
  photos?: string[];
}

type FormType = {
  title: string;
  area: string;
  severity: 'Baixa' | 'Média' | 'Alta';
  description: string;
  status: 'Aberto' | 'Em análise' | 'Fechado';
  type: 'incidente' | 'acidente';
  photos: string[];
};

export default function GestaoRiscoPage() {
  const supabase = createClient();
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncidente, setEditingIncidente] = useState<Incidente | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'' | 'Baixa' | 'Média' | 'Alta'>('');
  const [filterStatus, setFilterStatus] = useState<'' | 'Aberto' | 'Em análise' | 'Fechado'>('');
  const [filterType, setFilterType] = useState<'' | 'incidente' | 'acidente'>('');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<FormType>({
    title: '',
    area: '',
    severity: 'Baixa',
    description: '',
    status: 'Aberto',
    type: 'incidente',
    photos: [],
  });

  useEffect(() => { fetchIncidentes(); }, []);

  const fetchIncidentes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('incidents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setIncidentes(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar registros de risco');
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidentes = incidentes.filter(inc => {
    const matchSearch = !searchTerm || inc.title.toLowerCase().includes(searchTerm.toLowerCase()) || inc.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity = !filterSeverity || inc.severity === filterSeverity;
    const matchStatus = !filterStatus || inc.status === filterStatus;
    const matchType = !filterType || inc.type === filterType;
    return matchSearch && matchSeverity && matchStatus && matchType;
  });

  const activeFiltersCount = [filterSeverity, filterStatus, filterType].filter(Boolean).length;

  const clearFilters = () => { setFilterSeverity(''); setFilterStatus(''); setFilterType(''); setSearchTerm(''); };

  const handleOpenModal = (type: 'incidente' | 'acidente', incidente?: Incidente) => {
    if (incidente) {
      setEditingIncidente(incidente);
      setFormData({
        title: incidente.title,
        area: incidente.area,
        severity: incidente.severity,
        description: incidente.description || '',
        status: incidente.status,
        type: incidente.type || 'incidente',
        photos: incidente.photos || [],
      });
    } else {
      setEditingIncidente(null);
      setFormData({ title: '', area: '', severity: 'Baixa', description: '', status: 'Aberto', type, photos: [] });
    }
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhoto(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name}: Arquivo muito grande (máx 10MB)`); continue; }
        const path = `incidents/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: true });
        if (error) { toast.error(`Erro ao enviar ${file.name}`); continue; }
        const { data } = supabase.storage.from('documents').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      if (urls.length) {
        setFormData(prev => ({ ...prev, photos: [...prev.photos, ...urls] }));
        toast.success(`${urls.length} foto(s) enviada(s)!`);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (url: string) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter(p => p !== url) }));
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const result = await executeMutationWithOfflineQueue({
        supabase,
        operation: {
          table: 'incidents',
          action: 'delete',
          match: { column: 'id', value: confirmDeleteId },
        },
      });

      if (result.status === 'error') throw result.error;

      toast.success(
        result.status === 'queued'
          ? 'Sem conexão: exclusão enfileirada para sincronizar depois.'
          : 'Registro excluído com sucesso!'
      );

      setIncidentes(prev => prev.filter(item => item.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      if (result.status === 'synced') {
        fetchIncidentes();
      }
    } catch { toast.error('Erro ao excluir registro'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.area.trim()) {
      toast.error('Título e área são obrigatórios.');
      return;
    }
    try {
      const payload = {
        title: formData.title.trim(),
        area: formData.area.trim(),
        severity: formData.severity,
        description: formData.description.trim(),
        status: formData.status,
        type: formData.type,
        photos: formData.photos,
        date: new Date().toISOString().split('T')[0],
      };
      if (editingIncidente) {
        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'incidents',
            action: 'update',
            payload,
            match: { column: 'id', value: editingIncidente.id },
          },
        });

        if (result.status === 'error') throw result.error;
        toast.success(
          result.status === 'queued'
            ? 'Sem conexão: atualização enfileirada para sincronizar depois.'
            : 'Registro atualizado com sucesso!'
        );

        if (result.status === 'synced') {
          fetchIncidentes();
        }
      } else {
        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'incidents',
            action: 'insert',
            payload: [payload],
          },
        });

        if (result.status === 'error') throw result.error;
        toast.success(
          result.status === 'queued'
            ? 'Sem conexão: registro enfileirado para sincronizar depois.'
            : formData.type === 'acidente'
              ? 'Acidente registrado!'
              : 'Incidente reportado!'
        );

        if (result.status === 'synced') {
          fetchIncidentes();
        }
      }
      setIsModalOpen(false);
      setFormData({ title: '', area: '', severity: 'Baixa', description: '', status: 'Aberto', type: 'incidente', photos: [] });
    } catch { toast.error('Erro ao salvar registro'); }
  };

  const totalAbertos = incidentes.filter(i => i.status === 'Aberto').length;
  const totalAcidentes = incidentes.filter(i => i.type === 'acidente').length;
  const totalAlta = incidentes.filter(i => i.severity === 'Alta').length;

  return (
    <>
      <Header title="Gestão de Risco" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Registros', value: incidentes.length.toString(), icon: AlertTriangle, color: 'text-primary' },
            { label: 'Abertos', value: totalAbertos.toString(), icon: AlertTriangle, color: 'text-red-600', bg: totalAbertos > 0 ? 'bg-red-50 border-red-200' : '' },
            { label: 'Acidentes', value: totalAcidentes.toString(), icon: Siren, color: 'text-orange-600', bg: totalAcidentes > 0 ? 'bg-orange-50 border-orange-200' : '' },
            { label: 'Gravidade Alta', value: totalAlta.toString(), icon: AlertTriangle, color: 'text-red-700', bg: totalAlta > 0 ? 'bg-red-50 border-red-200' : '' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={cn("bg-white p-5 rounded-xl border shadow-sm", stat.bg || "border-slate-200")}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} className={stat.color} />
                <span className="text-[10px] font-bold text-slate-500 uppercase">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{loading ? '—' : stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Buscar por título ou área..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 outline-none" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className={cn('flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all', showFilters || activeFiltersCount > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600')}>
                <Filter size={16} /> Filtrar
                {activeFiltersCount > 0 && (<span className="bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFiltersCount}</span>)}
                <ChevronDown size={14} className={cn('transition-transform', showFilters && 'rotate-180')} />
              </button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => handleOpenModal('incidente')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 shadow-sm transition-all">
                <PlusCircle size={18} /> + Incidente
              </button>
              <button onClick={() => handleOpenModal('acidente')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-all">
                <Siren size={18} /> + Acidente
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-end overflow-hidden">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipo</label>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none">
                    <option value="">Todos</option>
                    <option value="incidente">Incidente</option>
                    <option value="acidente">Acidente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Gravidade</label>
                  <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value as any)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none">
                    <option value="">Todas</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 outline-none">
                    <option value="">Todos</option>
                    <option value="Aberto">Aberto</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Fechado">Fechado</option>
                  </select>
                </div>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium">
                    <X size={14} /> Limpar filtros
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="animate-spin mb-2" size={24} />
              <span>Carregando registros...</span>
            </div>
          ) : filteredIncidentes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
              {searchTerm || activeFiltersCount > 0 ? 'Nenhum registro encontrado com os filtros aplicados.' : 'Nenhum incidente ou acidente registrado.'}
            </div>
          ) : (
            filteredIncidentes.map((inc, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                key={inc.id}
                className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:border-red-200 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={cn('p-3 rounded-xl shrink-0',
                    inc.type === 'acidente' ? 'bg-red-100 text-red-700' :
                    inc.severity === 'Alta' ? 'bg-red-100 text-red-600' :
                    inc.severity === 'Média' ? 'bg-orange-100 text-orange-600' :
                    'bg-yellow-100 text-yellow-600'
                  )}>
                    {inc.type === 'acidente' ? <Siren size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", inc.type === 'acidente' ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")}>
                        {inc.type === 'acidente' ? 'Acidente' : 'Incidente'}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">{inc.area}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 truncate">{inc.title}</h4>
                    {inc.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{inc.description}</p>}
                    {inc.photos && inc.photos.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Camera size={11} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400">{inc.photos.length} foto(s)</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:flex flex-col items-end gap-1">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                      inc.severity === 'Alta' ? 'bg-red-100 text-red-600' :
                      inc.severity === 'Média' ? 'bg-orange-100 text-orange-600' :
                      'bg-yellow-100 text-yellow-600'
                    )}>{inc.severity}</span>
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                      inc.status === 'Aberto' ? 'bg-red-50 text-red-600' :
                      inc.status === 'Em análise' ? 'bg-blue-50 text-blue-600' :
                      'bg-green-50 text-green-600'
                    )}>{inc.status}</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                    <button onClick={() => handleOpenModal(inc.type || 'incidente', inc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                      <FileText size={16} />
                    </button>
                    <button onClick={() => setConfirmDeleteId(inc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal Registrar/Editar */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className={cn("p-6 border-b border-slate-100 flex items-center justify-between", formData.type === 'acidente' ? 'bg-red-50' : 'bg-orange-50')}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", formData.type === 'acidente' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700')}>
                    {formData.type === 'acidente' ? <Siren size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingIncidente ? 'Editar Registro' : formData.type === 'acidente' ? 'Registrar Acidente' : 'Reportar Incidente'}
                  </h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Tipo de Ocorrência */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Ocorrência</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['incidente', 'acidente'] as const).map(type => (
                      <button key={type} type="button" onClick={() => setFormData(p => ({ ...p, type }))} className={cn("py-2.5 rounded-lg border-2 text-sm font-bold transition-all flex items-center justify-center gap-2", formData.type === type ? type === 'acidente' ? "border-red-500 bg-red-50 text-red-700" : "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-500 hover:border-slate-300")}>
                        {type === 'acidente' ? <Siren size={16} /> : <AlertTriangle size={16} />}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Queda de material, Colisão..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Área / Setor</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input required value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} placeholder="Ex: Produção A" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Gravidade</label>
                    <select value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value as any })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all">
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all">
                    <option value="Aberto">Aberto</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Fechado">Fechado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Descrição Detalhada</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Descreva o que aconteceu, causas, consequências..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none" />
                </div>

                {/* Fotos */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Camera size={14} /> Fotos da Ocorrência</label>
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-all text-sm text-slate-500">
                    <Upload size={16} />
                    {uploadingPhoto ? 'Enviando fotos...' : 'Clique para adicionar fotos (PNG, JPG)'}
                    <input type="file" accept="image/png,image/jpeg,image/jpg" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                  </label>
                  {formData.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.photos.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt={`Foto ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-slate-200" />
                          <button type="button" onClick={() => removePhoto(url)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className={cn("flex-1 px-6 py-2.5 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg", formData.type === 'acidente' ? "bg-red-600 hover:bg-red-700 shadow-red-200" : "bg-orange-500 hover:bg-orange-600 shadow-orange-200")}>
                    <Check size={20} />
                    {editingIncidente ? 'Salvar Alterações' : formData.type === 'acidente' ? 'Registrar Acidente' : 'Reportar Incidente'}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmDeleteId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Registro?</h3>
              <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all">Confirmar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
