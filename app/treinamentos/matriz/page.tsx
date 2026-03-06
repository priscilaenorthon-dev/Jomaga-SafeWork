'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import {
  TableProperties,
  GraduationCap,
  CheckCircle2,
  Clock,
  XCircle,
  Anchor,
  Globe,
  Building,
  UserCog,
  Loader2,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface Training {
  id: string;
  title: string;
  status: 'Concluído' | 'Agendado' | 'Em Andamento';
  date: string;
  location_type?: 'onshore' | 'offshore' | 'ambos';
  training_category?: 'base' | 'cliente';
  participant_ids?: string[];
}

interface Collaborator {
  id: string;
  name: string;
  role?: string;
  contract_type?: 'onshore' | 'offshore';
}

const emptyForm = {
  title: '',
  date: '',
  status: 'Agendado' as Training['status'],
  location_type: 'ambos' as 'onshore' | 'offshore' | 'ambos',
  participant_ids: [] as string[],
};

export default function MatrizTreinamentosPage() {
  const supabase = createClient();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'base' | 'cliente'>('base');
  const [filterContract, setFilterContract] = useState<'' | 'onshore' | 'offshore'>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Training | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: trainData }, { data: collabData }] = await Promise.all([
      supabase.from('trainings').select('id, title, status, date, location_type, training_category, participant_ids').order('title'),
      supabase.from('collaborators').select('id, name, role, contract_type').eq('status', 'Ativo').order('name'),
    ]);
    setTrainings((trainData || []) as Training[]);
    setCollaborators((collabData || []) as Collaborator[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const categoryTrainings = trainings.filter(t => t.training_category === activeCategory);
  const filteredCollaborators = filterContract ? collaborators.filter(c => c.contract_type === filterContract) : collaborators;

  const getStatus = (collaboratorId: string, training: Training): 'Concluído' | 'Em Andamento' | 'Não Iniciado' => {
    const isParticipant = training.participant_ids?.includes(collaboratorId);
    if (!isParticipant) return 'Não Iniciado';
    return training.status === 'Concluído' ? 'Concluído' : 'Em Andamento';
  };

  const statusIcon = (status: string) => {
    if (status === 'Concluído') return <CheckCircle2 size={18} className="text-green-500" />;
    if (status === 'Em Andamento') return <Clock size={18} className="text-blue-500" />;
    return <XCircle size={18} className="text-slate-300" />;
  };

  const completionRate = (training: Training) => {
    if (filteredCollaborators.length === 0) return 0;
    const count = filteredCollaborators.filter(c => training.participant_ids?.includes(c.id) && training.status === 'Concluído').length;
    return Math.round((count / filteredCollaborators.length) * 100);
  };

  const toggleParticipant = (id: string) => {
    setForm(prev => ({
      ...prev,
      participant_ids: prev.participant_ids.includes(id)
        ? prev.participant_ids.filter(p => p !== id)
        : [...prev.participant_ids, id],
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: Training) => {
    setEditing(t);
    setForm({
      title: t.title,
      date: t.date,
      status: t.status,
      location_type: t.location_type || 'ambos',
      participant_ids: t.participant_ids || [],
    });
    setModalOpen(true);
  };

  const saveTraining = async () => {
    if (!form.title.trim() || !form.date) {
      toast.error('Informe título e data.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      date: form.date,
      status: form.status,
      location_type: form.location_type,
      training_category: activeCategory,
      participant_ids: form.participant_ids,
      participants: form.participant_ids.length,
      instructor: 'SESMT',
      duration: '1h',
    };

    if (editing) {
      const { error } = await supabase.from('trainings').update(payload).eq('id', editing.id);
      if (error) {
        toast.error('Erro ao atualizar treinamento.');
        return;
      }
      toast.success('Treinamento atualizado.');
    } else {
      const { error } = await supabase.from('trainings').insert([payload]);
      if (error) {
        toast.error('Erro ao criar treinamento.');
        return;
      }
      toast.success('Treinamento criado.');
    }

    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    fetchData();
  };

  const deleteTraining = async (id: string) => {
    if (!confirm('Deseja excluir este treinamento?')) return;
    const { error } = await supabase.from('trainings').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir treinamento.');
      return;
    }
    toast.success('Treinamento excluído.');
    fetchData();
  };

  return (
    <>
      <Header title="Matriz de Treinamento" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/treinamentos">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">
              <GraduationCap size={16} /> Treinamentos
            </button>
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm">
            <TableProperties size={16} /> Matriz de Treinamento
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            <button onClick={() => setActiveCategory('base')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all', activeCategory === 'base' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              <Building size={16} /> Base
            </button>
            <button onClick={() => setActiveCategory('cliente')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all', activeCategory === 'cliente' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              <UserCog size={16} /> Cliente
            </button>
          </div>

          <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
            <Plus size={14} /> Novo ({activeCategory === 'base' ? 'Base' : 'Cliente'})
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <Filter size={16} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Filtrar:</span>
            {(['', 'onshore', 'offshore'] as const).map(val => (
              <button
                key={val || 'all'}
                onClick={() => setFilterContract(val)}
                className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all', filterContract === val ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:border-slate-300')}
              >
                {val === 'offshore' ? <><Anchor size={12} />Offshore</> : val === 'onshore' ? <><Globe size={12} />Onshore</> : 'Todos'}
              </button>
            ))}
          </div>
        </div>

        {!!categoryTrainings.length && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">CRUD de Treinamentos ({activeCategory === 'base' ? 'Base' : 'Cliente'})</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {categoryTrainings.map(t => (
                <div key={t.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-2.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{t.title}</p>
                    <p className="text-[11px] text-slate-400">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-primary/5 text-slate-500 hover:text-primary"><Edit2 size={14} /></button>
                    <button onClick={() => deleteTraining(t.id)} className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /><span>Concluído</span></div>
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /><span>Em Andamento</span></div>
          <div className="flex items-center gap-1.5"><XCircle size={14} className="text-slate-300" /><span>Não Iniciado</span></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" size={32} /></div>
        ) : categoryTrainings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <TableProperties size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Nenhum treinamento de {activeCategory === 'base' ? 'Base' : 'Cliente'} cadastrado.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="sticky left-0 bg-slate-50 px-6 py-4 text-xs font-bold text-slate-500 uppercase text-left whitespace-nowrap border-r border-slate-200 min-w-[180px]">Colaborador</th>
                    {categoryTrainings.map(t => (
                      <th key={t.id} className="px-4 py-4 text-xs font-bold text-slate-500 uppercase text-center min-w-[140px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="leading-tight">{t.title}</span>
                          <div className="text-[10px] text-slate-400 font-normal">{completionRate(t)}% concluído</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCollaborators.length === 0 ? (
                    <tr><td colSpan={categoryTrainings.length + 1} className="px-6 py-8 text-center text-slate-500">Nenhum colaborador encontrado com o filtro selecionado.</td></tr>
                  ) : filteredCollaborators.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="sticky left-0 bg-white hover:bg-slate-50 px-6 py-3.5 border-r border-slate-200 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 text-sm">{c.name}</div>
                      </td>
                      {categoryTrainings.map(t => {
                        const status = getStatus(c.id, t);
                        return (
                          <td key={t.id} className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {statusIcon(status)}
                              <span className={cn('text-[10px] font-medium', status === 'Concluído' ? 'text-green-600' : status === 'Em Andamento' ? 'text-blue-600' : 'text-slate-400')}>
                                {status === 'Concluído' ? new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR') : status}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold">{editing ? 'Editar' : 'Novo'} treinamento ({activeCategory})</h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Training['status'] })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option>Agendado</option><option>Em Andamento</option><option>Concluído</option>
                  </select>
                  <select value={form.location_type} onChange={e => setForm({ ...form, location_type: e.target.value as any })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="ambos">Ambos</option><option value="onshore">Onshore</option><option value="offshore">Offshore</option>
                  </select>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y">
                  {collaborators.map(c => {
                    const selected = form.participant_ids.includes(c.id);
                    return (
                      <button key={c.id} type="button" onClick={() => toggleParticipant(c.id)} className={cn('w-full px-3 py-2 text-left text-sm', selected ? 'bg-primary/5 text-primary font-semibold' : 'hover:bg-slate-50')}>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setModalOpen(false)} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold">Cancelar</button>
                  <button onClick={saveTraining} className="flex-1 bg-primary text-white rounded-lg px-3 py-2 text-sm font-bold flex items-center justify-center gap-1"><Check size={14} />Salvar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
