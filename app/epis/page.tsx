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
  Loader2,
  Printer,
  Package,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
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
  digital_signature?: string;
  role?: string;
  registration?: string;
  contract_type?: string;
}

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

function FichaEPIModal({ collaboratorName, epis, collaborators, onClose }: {
  collaboratorName: string;
  epis: EPI[];
  collaborators: Collaborator[];
  onClose: () => void;
}) {
  const collaboratorData = collaborators.find(c => c.name === collaboratorName);
  const collaboratorEPIs = epis.filter(e => e.user === collaboratorName);

  const handlePrint = () => {
    const companyBranding = (() => {
      try {
        const s = localStorage.getItem('jomaga_company_settings');
        const parsed = s ? JSON.parse(s) : {};
        return {
          companyName: parsed?.companyName || 'SafeWork',
          companyLogo: parsed?.companyLogo || '/icon',
        };
      } catch {
        return { companyName: 'SafeWork', companyLogo: '/icon' };
      }
    })();

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Ficha de EPI — ${collaboratorName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; font-size: 13px; }
    h1 { font-size: 18px; color: #1A237E; border-bottom: 2px solid #1A237E; padding-bottom: 8px; margin-bottom: 4px; }
    .company { font-size: 11px; color: #666; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .brand img { width: 34px; height: 34px; object-fit: contain; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
    .info-item { background: #f8f9fa; padding: 10px; border-radius: 6px; }
    .info-label { font-size: 10px; color: #888; text-transform: uppercase; font-weight: bold; }
    .info-value { font-size: 13px; font-weight: bold; color: #1a1a1a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #1A237E; color: white; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:nth-child(even) td { background: #f8f9fa; }
    .status-ativo { color: #16a34a; font-weight: bold; }
    .status-vencendo { color: #d97706; font-weight: bold; }
    .status-expirado { color: #dc2626; font-weight: bold; }
    .sig-section { margin-top: 32px; }
    .sig-label { font-size: 11px; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; }
    .sig-box { border: 1px solid #ddd; border-radius: 8px; padding: 8px; display: inline-block; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="brand">
    <img src="${companyBranding.companyLogo}" alt="Logo da empresa" />
    <strong>${companyBranding.companyName}</strong>
  </div>
  <h1>Ficha de EPI — ${collaboratorName}</h1>
  <p class="company">${companyBranding.companyName} — Sistema SafeWork &nbsp;|&nbsp; Emitido em: ${new Date().toLocaleDateString('pt-BR')}</p>
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Colaborador</div><div class="info-value">${collaboratorName}</div></div>
    <div class="info-item"><div class="info-label">Matrícula</div><div class="info-value">${collaboratorData?.registration || '—'}</div></div>
    <div class="info-item"><div class="info-label">Cargo</div><div class="info-value">${collaboratorData?.role || '—'}</div></div>
    <div class="info-item"><div class="info-label">Tipo de Contrato</div><div class="info-value">${collaboratorData?.contract_type || '—'}</div></div>
  </div>
  <table>
    <thead><tr><th>Item de EPI</th><th>Status</th><th>Vencimento</th></tr></thead>
    <tbody>
      ${collaboratorEPIs.map(e => `
      <tr>
        <td>${e.item}</td>
        <td class="status-${e.status.toLowerCase()}">${e.status}</td>
        <td>${e.date ? new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
      </tr>`).join('')}
      ${collaboratorEPIs.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#888;">Nenhum EPI registrado</td></tr>' : ''}
    </tbody>
  </table>
  <div class="sig-section">
    <div class="sig-label">Assinatura Digital do Colaborador</div>
    ${collaboratorData?.digital_signature
      ? `<div class="sig-box"><img src="${collaboratorData.digital_signature}" style="height:80px;display:block;" alt="Assinatura" /></div>`
      : '<div style="border:1px dashed #ccc;border-radius:8px;padding:24px 40px;display:inline-block;color:#aaa;font-size:12px;">Assinatura não cadastrada</div>'
    }
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Ficha de EPI</h3>
              <p className="text-xs text-slate-500">{collaboratorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all"
            >
              <Printer size={14} /> Imprimir
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Dados do colaborador */}
          {collaboratorData && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Matrícula', value: collaboratorData.registration || '—' },
                { label: 'Cargo', value: collaboratorData.role || '—' },
                { label: 'Tipo de Contrato', value: collaboratorData.contract_type || '—' },
                { label: 'Total de EPIs', value: String(collaboratorEPIs.length) },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Lista de EPIs */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Equipamentos de Proteção</h4>
            <div className="space-y-2">
              {collaboratorEPIs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum EPI registrado para este colaborador.</p>
              ) : collaboratorEPIs.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <HardHat size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">{e.item}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{e.date ? new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                      e.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                      e.status === 'Vencendo' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {e.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assinatura Digital */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Assinatura Digital</h4>
            {collaboratorData?.digital_signature ? (
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <img
                  src={collaboratorData.digital_signature}
                  alt="Assinatura digital"
                  className="max-h-24 object-contain"
                />
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 text-sm">
                Assinatura não cadastrada
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
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
  const [fichaCollaborator, setFichaCollaborator] = useState<string | null>(null);

  useEffect(() => {
    fetchEPIs();
    fetchCollaborators();
  }, []);

  const fetchEPIs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('epis').select('*').order('date', { ascending: true });
      if (error) throw error;
      const updated = (data || []).map((e: EPI) => ({ ...e, status: calcStatus(e.date) }));
      setEpis(updated);
    } catch (error: any) {
      toast.error('Erro ao carregar EPIs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborators = async () => {
    const { data } = await supabase
      .from('collaborators')
      .select('id, name, digital_signature, role, registration, contract_type')
      .eq('status', 'Ativo')
      .order('name');
    if (data) setCollaborators(data);
  };

  const filteredEPIs = epis.filter(e =>
    e.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAtivo = epis.filter(e => e.status === 'Ativo').length;
  const totalVencendo = epis.filter(e => e.status === 'Vencendo').length;
  const totalExpirado = epis.filter(e => e.status === 'Expirado').length;
  const conformidade = epis.length > 0 ? Math.round((totalAtivo / epis.length) * 100) : 0;

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

  const handleCloseModal = () => { setIsModalOpen(false); setEditingEPI(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item.trim() || !formData.user.trim() || !formData.date) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    const status = calcStatus(formData.date);
    try {
      if (editingEPI) {
        const { error } = await supabase.from('epis').update({ item: formData.item.trim(), user: formData.user.trim(), status, date: formData.date }).eq('id', editingEPI.id);
        if (error) throw error;
        toast.success('EPI atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('epis').insert([{ item: formData.item.trim(), user: formData.user.trim(), status, date: formData.date }]);
        if (error) throw error;
        toast.success('EPI registrado com sucesso!');
      }
      fetchEPIs();
      handleCloseModal();
    } catch (error: any) {
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
      toast.error('Erro ao excluir EPI');
    }
  };

  return (
    <>
      <Header title="Gestão de EPIs" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Sub-menu tabs */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm">
            <FileText size={16} /> Fichas de EPI
          </button>
          <Link href="/epis/inventario">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">
              <Package size={16} /> Inventário
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Ativos', value: totalAtivo.toString(), icon: CheckCircle2, color: 'text-green-600' },
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
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => setFichaCollaborator(e.user)}
                            className="text-primary hover:underline font-medium"
                          >
                            {e.user}
                          </button>
                        </td>
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

      {/* Ficha de EPI Modal */}
      <AnimatePresence>
        {fichaCollaborator && (
          <FichaEPIModal
            collaboratorName={fichaCollaborator}
            epis={epis}
            collaborators={collaborators}
            onClose={() => setFichaCollaborator(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">{editingEPI ? 'Editar Registro de EPI' : 'Novo Registro de EPI'}</h3>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Tag size={14} /> Nome do Item</label>
                  <input required type="text" placeholder="Ex: Capacete de Segurança" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><User size={14} /> Colaborador Responsável</label>
                  <select required className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white" value={formData.user} onChange={(e) => setFormData({ ...formData, user: e.target.value })}>
                    <option value="">Selecione um colaborador</option>
                    {collaborators.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                    {formData.user && !collaborators.find(c => c.name === formData.user) && (<option value={formData.user}>{formData.user}</option>)}
                  </select>
                  {collaborators.length === 0 && <p className="text-xs text-slate-400 mt-1">Nenhum colaborador ativo cadastrado.</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={14} /> Data de Vencimento</label>
                  <input required type="date" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                  {formData.date && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">Status automático:</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', calcStatus(formData.date) === 'Ativo' ? 'bg-green-100 text-green-700' : calcStatus(formData.date) === 'Vencendo' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700')}>{calcStatus(formData.date)}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"><Check size={20} />{editingEPI ? 'Salvar Alterações' : 'Registrar'}</button>
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
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir EPI?</h3>
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
