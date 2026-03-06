'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import {
  Stethoscope,
  Plus,
  Search,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  Trash2,
  Edit2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';

interface ASO {
  id: string;
  collaborator_id: string | null;
  collaborator_name: string;
  exam_type: string;
  result: 'Apto' | 'Inapto' | 'Apto com Restrições';
  exam_date: string;
  next_exam_date: string | null;
  doctor: string | null;
  crm: string | null;
  observations: string | null;
  created_at: string;
}

interface Collaborator {
  id: string;
  name: string;
}

const EXAM_TYPES = ['Admissional', 'Periódico', 'Demissional', 'Retorno ao Trabalho', 'Mudança de Função'];
const RESULTS = ['Apto', 'Inapto', 'Apto com Restrições'] as const;

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function ResultBadge({ result }: { result: string }) {
  if (result === 'Apto') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
      <CheckCircle2 size={11} /> Apto
    </span>
  );
  if (result === 'Inapto') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
      <XCircle size={11} /> Inapto
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
      <AlertTriangle size={11} /> Apto c/ Restrições
    </span>
  );
}

function ExpiryBadge({ nextDate }: { nextDate: string | null }) {
  const days = daysUntil(nextDate);
  if (days === null) return <span className="text-xs text-slate-400">—</span>;
  if (days < 0) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
      <XCircle size={11} /> Vencido
    </span>
  );
  if (days <= 30) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
      <AlertTriangle size={11} /> Vence em {days}d
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
      <Clock size={11} /> {new Date(nextDate + 'T12:00:00').toLocaleDateString('pt-BR')}
    </span>
  );
}

const emptyForm = {
  collaborator_id: '',
  collaborator_name: '',
  exam_type: 'Periódico',
  result: 'Apto' as typeof RESULTS[number],
  exam_date: new Date().toISOString().split('T')[0],
  next_exam_date: '',
  doctor: '',
  crm: '',
  observations: '',
};

export default function ASOPage() {
  const supabase = createClient();
  const [asos, setAsos] = useState<ASO[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<'' | typeof RESULTS[number]>('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: asoData }, { data: collabData }] = await Promise.all([
      supabase.from('asos').select('*').order('exam_date', { ascending: false }),
      supabase.from('collaborators').select('id, name').eq('status', 'Ativo').order('name'),
    ]);
    setAsos(asoData || []);
    setCollaborators(collabData || []);
    setLoading(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (aso: ASO) => {
    setEditingId(aso.id);
    setForm({
      collaborator_id: aso.collaborator_id || '',
      collaborator_name: aso.collaborator_name,
      exam_type: aso.exam_type,
      result: aso.result,
      exam_date: aso.exam_date,
      next_exam_date: aso.next_exam_date || '',
      doctor: aso.doctor || '',
      crm: aso.crm || '',
      observations: aso.observations || '',
    });
    setShowModal(true);
  };

  const handleCollaboratorChange = (id: string) => {
    const collab = collaborators.find(c => c.id === id);
    setForm(f => ({ ...f, collaborator_id: id, collaborator_name: collab?.name || '' }));
  };

  const handleSave = async () => {
    if (!form.collaborator_name.trim()) { toast.error('Informe o colaborador.'); return; }
    if (!form.exam_date) { toast.error('Informe a data do exame.'); return; }
    setSaving(true);
    const payload = {
      collaborator_id: form.collaborator_id || null,
      collaborator_name: form.collaborator_name,
      exam_type: form.exam_type,
      result: form.result,
      exam_date: form.exam_date,
      next_exam_date: form.next_exam_date || null,
      doctor: form.doctor || null,
      crm: form.crm || null,
      observations: form.observations || null,
    };
    if (editingId) {
      const { error } = await supabase.from('asos').update(payload).eq('id', editingId);
      if (error) { toast.error('Erro ao atualizar ASO.'); setSaving(false); return; }
      toast.success('ASO atualizado!');
    } else {
      const { error } = await supabase.from('asos').insert(payload);
      if (error) { toast.error('Erro ao salvar ASO.'); setSaving(false); return; }
      toast.success('ASO registrado!');
    }
    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este ASO?')) return;
    const { error } = await supabase.from('asos').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir.'); return; }
    toast.success('ASO excluído.');
    fetchData();
  };

  const filtered = asos.filter(a => {
    const matchSearch = a.collaborator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.exam_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchResult = !filterResult || a.result === filterResult;
    const matchType = !filterType || a.exam_type === filterType;
    return matchSearch && matchResult && matchType;
  });

  const totalAlerts = asos.filter(a => {
    const d = daysUntil(a.next_exam_date);
    return d !== null && d <= 30;
  }).length;

  const aptosCount = asos.filter(a => a.result === 'Apto').length;
  const inaptosCount = asos.filter(a => a.result === 'Inapto').length;

  return (
    <>
      <Header title="Gestão de ASO" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">

        {/* Alert Banner */}
        {totalAlerts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertTriangle size={20} className="text-orange-500 shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 text-sm">
                {totalAlerts} ASO{totalAlerts > 1 ? 's' : ''} vencendo nos próximos 30 dias
              </p>
              <p className="text-orange-600 text-xs mt-0.5">Agende os exames com antecedência para manter a conformidade.</p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total de ASOs', value: asos.length, color: 'blue' },
            { label: 'Aptos', value: aptosCount, color: 'green' },
            { label: 'Inaptos', value: inaptosCount, color: 'red' },
            { label: 'Alertas (30d)', value: totalAlerts, color: 'orange' },
          ].map(stat => (
            <div key={stat.label} className={cn(
              'bg-white rounded-xl border p-4 shadow-sm',
              stat.color === 'orange' && totalAlerts > 0 ? 'border-orange-300' : 'border-slate-200'
            )}>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
              <p className={cn('text-2xl font-bold mt-1',
                stat.color === 'green' ? 'text-green-600' :
                stat.color === 'red' ? 'text-red-600' :
                stat.color === 'orange' && totalAlerts > 0 ? 'text-orange-600' :
                'text-slate-800'
              )}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar colaborador ou tipo..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            />
          </div>

          <div className="relative">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-slate-600"
            >
              <option value="">Todos os tipos</option>
              {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filterResult}
              onChange={e => setFilterResult(e.target.value as '' | typeof RESULTS[number])}
              className="pl-3 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-slate-600"
            >
              <option value="">Todos os resultados</option>
              {RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-all"
          >
            <Plus size={16} /> Novo ASO
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={32} />
              <span>Carregando ASOs...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <Stethoscope size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Nenhum ASO encontrado.</p>
            <p className="text-sm mt-1">Registre o primeiro Atestado de Saúde Ocupacional.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-left">Colaborador</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-left">Tipo</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Resultado</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Data Exame</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Próximo Exame</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-left">Médico</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(aso => {
                    const days = daysUntil(aso.next_exam_date);
                    const isAlert = days !== null && days <= 30;
                    return (
                      <tr key={aso.id} className={cn('hover:bg-slate-50 transition-colors', isAlert && 'bg-orange-50/40')}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {aso.collaborator_name.charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800">{aso.collaborator_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{aso.exam_type}</td>
                        <td className="px-4 py-3 text-center"><ResultBadge result={aso.result} /></td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {new Date(aso.exam_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ExpiryBadge nextDate={aso.next_exam_date} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {aso.doctor ? (
                            <div>
                              <div className="font-medium text-slate-700">{aso.doctor}</div>
                              {aso.crm && <div className="text-xs text-slate-400">CRM: {aso.crm}</div>}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEdit(aso)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(aso.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-800 text-lg">
                    {editingId ? 'Editar ASO' : 'Novo ASO'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Collaborator */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Colaborador *</label>
                    {collaborators.length > 0 ? (
                      <div className="relative">
                        <select
                          value={form.collaborator_id}
                          onChange={e => handleCollaboratorChange(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        >
                          <option value="">Selecione o colaborador</option>
                          {collaborators.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        value={form.collaborator_name}
                        onChange={e => setForm(f => ({ ...f, collaborator_name: e.target.value }))}
                        placeholder="Nome do colaborador"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    )}
                  </div>

                  {/* Exam Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipo de Exame *</label>
                    <div className="relative">
                      <select
                        value={form.exam_type}
                        onChange={e => setForm(f => ({ ...f, exam_type: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      >
                        {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Result */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Resultado *</label>
                    <div className="flex gap-2">
                      {RESULTS.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, result: r }))}
                          className={cn(
                            'flex-1 py-2 px-3 rounded-xl border-2 text-xs font-bold transition-all',
                            form.result === r
                              ? r === 'Apto' ? 'border-green-500 bg-green-50 text-green-700'
                              : r === 'Inapto' ? 'border-red-500 bg-red-50 text-red-700'
                              : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Data do Exame *</label>
                      <input
                        type="date"
                        value={form.exam_date}
                        onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Próximo Exame</label>
                      <input
                        type="date"
                        value={form.next_exam_date}
                        onChange={e => setForm(f => ({ ...f, next_exam_date: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Doctor */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Médico Responsável</label>
                      <input
                        value={form.doctor}
                        onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))}
                        placeholder="Nome do médico"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">CRM</label>
                      <input
                        value={form.crm}
                        onChange={e => setForm(f => ({ ...f, crm: e.target.value }))}
                        placeholder="Ex: 12345/SP"
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Observations */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Observações</label>
                    <textarea
                      value={form.observations}
                      onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
                      placeholder="Restrições, observações médicas..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    />
                  </div>
                </div>

                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                    {editingId ? 'Salvar Alterações' : 'Registrar ASO'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
