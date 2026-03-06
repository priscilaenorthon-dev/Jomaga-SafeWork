'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import {
  GraduationCap,
  Clock,
  CheckCircle,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Calendar,
  User,
  BookOpen,
  Loader2,
  TableProperties,
  Anchor,
  Globe,
  Building,
  UserCog,
  Upload,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import { executeMutationWithOfflineQueue } from '@/lib/offline-queue';

interface Training {
  id: string;
  title: string;
  instructor: string;
  date: string;
  duration: string;
  status: 'Concluído' | 'Agendado' | 'Em Andamento';
  participants: number;
  location_type?: 'onshore' | 'offshore' | 'ambos';
  training_category?: 'base' | 'cliente';
  certificate_template_url?: string;
  participant_ids?: string[];
}

interface Collaborator {
  id: string;
  name: string;
}

export default function TreinamentosPage() {
  const supabase = createClient();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [formData, setFormData] = useState<Omit<Training, 'id'>>({
    title: '',
    instructor: '',
    date: '',
    duration: '',
    status: 'Agendado',
    participants: 0,
    location_type: 'ambos',
    training_category: 'base',
    certificate_template_url: '',
    participant_ids: [],
  });

  useEffect(() => {
    fetchTrainings();
    fetchCollaborators();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('trainings').select('*').order('date', { ascending: false });
      if (error) throw error;
      setTrainings(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar treinamentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborators = async () => {
    const { data } = await supabase.from('collaborators').select('id, name').eq('status', 'Ativo').order('name');
    if (data) setCollaborators(data);
  };

  const filteredTrainings = trainings.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (training?: Training) => {
    if (training) {
      setEditingTraining(training);
      setFormData({
        title: training.title,
        instructor: training.instructor,
        date: training.date,
        duration: training.duration,
        status: training.status,
        participants: training.participants,
        location_type: training.location_type || 'ambos',
        training_category: training.training_category || 'base',
        certificate_template_url: training.certificate_template_url || '',
        participant_ids: training.participant_ids || [],
      });
    } else {
      setEditingTraining(null);
      setFormData({ title: '', instructor: '', date: '', duration: '', status: 'Agendado', participants: 0, location_type: 'ambos', training_category: 'base', certificate_template_url: '', participant_ids: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingTraining(null); };

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo muito grande. Máximo 10MB.'); return; }
    setUploadingCert(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `certificates/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('documents').getPublicUrl(path);
      setFormData(prev => ({ ...prev, certificate_template_url: data.publicUrl }));
      toast.success('Modelo de certificado enviado!');
    } catch (error: any) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploadingCert(false);
    }
  };

  const toggleParticipant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      participant_ids: prev.participant_ids?.includes(id)
        ? prev.participant_ids.filter(p => p !== id)
        : [...(prev.participant_ids || []), id],
      participants: prev.participant_ids?.includes(id)
        ? Math.max(0, (prev.participants || 0) - 1)
        : (prev.participants || 0) + 1,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        instructor: formData.instructor,
        date: formData.date,
        duration: formData.duration,
        status: formData.status,
        participants: formData.participants,
        location_type: formData.location_type,
        training_category: formData.training_category,
        certificate_template_url: formData.certificate_template_url || null,
        participant_ids: formData.participant_ids || [],
      };
      if (editingTraining) {
        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'trainings',
            action: 'update',
            payload,
            match: { column: 'id', value: editingTraining.id },
          },
        });

        if (result.status === 'error') throw result.error;
        toast.success(
          result.status === 'queued'
            ? 'Sem conexão: atualização de treinamento enfileirada para sincronizar depois.'
            : 'Treinamento atualizado com sucesso!'
        );

        if (result.status === 'synced') {
          fetchTrainings();
        }
      } else {
        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'trainings',
            action: 'insert',
            payload: [payload],
          },
        });

        if (result.status === 'error') throw result.error;
        toast.success(
          result.status === 'queued'
            ? 'Sem conexão: treinamento enfileirado para sincronizar depois.'
            : 'Treinamento agendado com sucesso!'
        );

        if (result.status === 'synced') {
          fetchTrainings();
        }
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error('Erro ao salvar treinamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este treinamento?')) {
      try {
        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'trainings',
            action: 'delete',
            match: { column: 'id', value: id },
          },
        });

        if (result.status === 'error') throw result.error;
        toast.success(
          result.status === 'queued'
            ? 'Sem conexão: exclusão de treinamento enfileirada para sincronizar depois.'
            : 'Treinamento removido.'
        );
        setTrainings(prev => prev.filter(training => training.id !== id));
        if (result.status === 'synced') {
          fetchTrainings();
        }
      } catch { toast.error('Erro ao excluir treinamento'); }
    }
  };

  const locationBadge = (loc?: string) => {
    if (loc === 'offshore') return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold"><Anchor size={9} />Offshore</span>;
    if (loc === 'onshore') return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold"><Globe size={9} />Onshore</span>;
    return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">Ambos</span>;
  };

  const categoryBadge = (cat?: string) => {
    if (cat === 'cliente') return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold"><UserCog size={9} />Cliente</span>;
    return <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold"><Building size={9} />Base</span>;
  };

  return (
    <>
      <Header title="Gestão de Treinamentos" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Sub-menu */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm">
            <GraduationCap size={16} /> Treinamentos
          </button>
          <Link href="/treinamentos/matriz">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">
              <TableProperties size={16} /> Matriz de Treinamento
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Ativos", value: trainings.filter(t => t.status !== 'Concluído').length.toString(), icon: GraduationCap, color: "text-blue-600" },
            { label: "Concluídos", value: trainings.filter(t => t.status === 'Concluído').length.toString(), icon: CheckCircle, color: "text-green-600" },
            { label: "Participantes", value: trainings.reduce((acc, t) => acc + (t.participants || 0), 0).toString(), icon: Users, color: "text-purple-600" },
            { label: "Offshore", value: trainings.filter(t => t.location_type === 'offshore').length.toString(), icon: Anchor, color: "text-blue-500" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
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
            <input type="text" placeholder="Buscar por título ou instrutor..." className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => handleOpenModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-sm">
            <Plus size={20} /> Novo Treinamento
          </button>
        </div>

        {/* Training List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Treinamento</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Instrutor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tipo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="flex flex-col items-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={24} /><span className="text-sm">Carregando treinamentos...</span></div></td></tr>
                ) : (
                  <AnimatePresence mode='popLayout'>
                    {filteredTrainings.map((t) => (
                      <motion.tr key={t.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">{t.title}</div>
                          <div className="text-xs text-slate-500">{t.duration} · {t.participants} participantes</div>
                          <div className="flex items-center gap-1 mt-1">
                            {locationBadge(t.location_type)}
                            {categoryBadge(t.training_category)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{t.instructor}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          {t.certificate_template_url && (
                            <a href={t.certificate_template_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                              <FileText size={12} /> Certificado
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", t.status === 'Concluído' ? "bg-green-100 text-green-700" : t.status === 'Em Andamento' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700")}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenModal(t)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
                {!loading && filteredTrainings.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Nenhum treinamento encontrado.</td></tr>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <h3 className="text-lg font-bold text-slate-800">{editingTraining ? 'Editar Treinamento' : 'Novo Treinamento'}</h3>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><BookOpen size={14} /> Título do Treinamento</label>
                  <input required type="text" placeholder="Ex: NR-35 Trabalho em Altura" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><User size={14} /> Instrutor</label>
                  <input required type="text" placeholder="Nome do instrutor" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={14} /> Data</label>
                    <input required type="date" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Clock size={14} /> Carga Horária</label>
                    <input required type="text" placeholder="Ex: 8h" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
                  </div>
                </div>

                {/* Localidade */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Localidade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['onshore', 'offshore', 'ambos'] as const).map(type => (
                      <button key={type} type="button" onClick={() => setFormData({ ...formData, location_type: type })} className={cn("py-2 rounded-lg border-2 text-xs font-bold transition-all capitalize flex items-center justify-center gap-1", formData.location_type === type ? type === 'offshore' ? "border-blue-500 bg-blue-50 text-blue-700" : type === 'onshore' ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-500 bg-slate-100 text-slate-700" : "border-slate-200 text-slate-500 hover:border-slate-300")}>
                        {type === 'offshore' ? <Anchor size={12} /> : type === 'onshore' ? <Globe size={12} /> : null}
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categoria */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([{v: 'base', label: 'Base', icon: Building}, {v: 'cliente', label: 'Cliente', icon: UserCog}] as const).map(({ v, label, icon: Icon }) => (
                      <button key={v} type="button" onClick={() => setFormData({ ...formData, training_category: v })} className={cn("py-2.5 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5", formData.training_category === v ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-500 hover:border-slate-300")}>
                        <Icon size={14} />{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                    <option value="Agendado">Agendado</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>

                {/* Modelo de Certificado */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><FileText size={14} /> Modelo de Certificado</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-all text-sm text-slate-500">
                      <Upload size={16} />
                      {uploadingCert ? 'Enviando...' : 'Clique para selecionar PDF ou imagem'}
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleCertUpload} disabled={uploadingCert} />
                    </label>
                    {formData.certificate_template_url && (
                      <a href={formData.certificate_template_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-medium">Ver arquivo</a>
                    )}
                  </div>
                </div>

                {/* Participantes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Users size={14} /> Colaboradores ({formData.participant_ids?.length || 0} selecionados)</label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                    {collaborators.length === 0 ? (
                      <p className="p-3 text-xs text-slate-400 text-center">Nenhum colaborador ativo</p>
                    ) : collaborators.map(c => {
                      const selected = formData.participant_ids?.includes(c.id);
                      return (
                        <button key={c.id} type="button" onClick={() => toggleParticipant(c.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors", selected ? "bg-primary/5" : "hover:bg-slate-50")}>
                          <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all", selected ? "bg-primary border-primary" : "bg-white border-slate-300")}>
                            {selected && <Check size={12} className="text-white" />}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"><Check size={20} />{editingTraining ? 'Salvar Alterações' : 'Agendar'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
