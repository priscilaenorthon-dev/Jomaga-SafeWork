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
import { executeMutationWithOfflineQueue } from '@/lib/offline-queue';

interface EPI {
  id: string;
  item: string;
  user: string;
  ca_number?: string;
  quantity?: number;
  delivery_date?: string;
  status: 'Ativo' | 'Vencendo' | 'Expirado';
  date: string;
}

interface Collaborator {
  id: string;
  name: string;
  digital_signature?: string;
  role?: string;
  sector?: string;
  admission_date?: string;
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

function escapeHtml(value?: string | number | null) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
          cnpj: parsed?.cnpj || '',
        };
      } catch {
        return { companyName: 'SafeWork', cnpj: '' };
      }
    })();

    const formatDate = (value?: string) => {
      if (!value) return '';
      return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
    };

    const minRows = 28;
    const rows = Array.from({ length: Math.max(collaboratorEPIs.length, minRows) }, (_, index) => {
      const epi = collaboratorEPIs[index];
      if (!epi) {
        return `
          <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td class="center date-cell">/ /</td>
            <td>&nbsp;</td>
          </tr>`;
      }

      const signatureContent = collaboratorData?.digital_signature
        ? `<img src="${escapeHtml(collaboratorData.digital_signature)}" alt="Assinatura" class="line-signature" />`
        : '&nbsp;';

      return `
        <tr>
          <td class="center">${escapeHtml(epi.quantity || 1)}</td>
          <td>${escapeHtml(epi.item)}</td>
          <td class="center">${escapeHtml(epi.ca_number || '-')}</td>
          <td class="center">${escapeHtml(formatDate(epi.delivery_date || epi.date) || '/ /')}</td>
          <td class="center">${signatureContent}</td>
        </tr>`;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Ficha Individual de EPI - ${escapeHtml(collaboratorName)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; padding: 10mm; color: #111; font-size: 12px; }
    .sheet { width: 190mm; margin: 0 auto; }
    .title-box {
      border: 1px solid #222;
      text-align: center;
      padding: 12px 10px;
      margin-bottom: 10px;
      font-weight: 700;
      text-transform: uppercase;
      line-height: 1.5;
      font-size: 13px;
    }
    .title-box .subtitle { display: block; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; }
    .employee-info { margin-bottom: 12px; }
    .employee-info td {
      border: 1px solid #222;
      padding: 3px 6px;
      height: 24px;
      vertical-align: middle;
      font-size: 12px;
    }
    .employee-info .label { font-weight: 700; margin-right: 5px; }
    .delivery-table th,
    .delivery-table td {
      border: 1px solid #222;
      padding: 3px 6px;
      height: 24px;
      font-size: 11px;
    }
    .delivery-table .section-title {
      background: #d9d9d9;
      text-align: center;
      font-weight: 700;
      text-transform: uppercase;
    }
    .delivery-table thead tr:nth-child(2) th {
      text-align: center;
      font-weight: 400;
      background: #f2f2f2;
    }
    .center { text-align: center; }
    .date-cell { letter-spacing: 1px; }
    .line-signature { max-height: 18px; max-width: 110px; object-fit: contain; }
    @page { size: A4 portrait; margin: 8mm; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="title-box">
      FICHA INDIVIDUAL DE EPI
      <span class="subtitle">(EQUIPAMENTO DE PROTECAO INDIVIDUAL)</span>
    </div>

    <table class="employee-info">
      <tbody>
        <tr>
          <td colspan="3"><span class="label">Empresa:</span> ${escapeHtml(companyBranding.companyName)}</td>
          <td colspan="1"><span class="label">CNPJ:</span> ${escapeHtml(companyBranding.cnpj || '-')}</td>
        </tr>
        <tr>
          <td colspan="2"><span class="label">Nome do Funcionario:</span> ${escapeHtml(collaboratorName)}</td>
          <td><span class="label">RE:</span> ${escapeHtml(collaboratorData?.registration || '-')}</td>
          <td><span class="label">Setor:</span> ${escapeHtml(collaboratorData?.sector || '-')}</td>
        </tr>
        <tr>
          <td colspan="2"><span class="label">Funcao:</span> ${escapeHtml(collaboratorData?.role || '-')}</td>
          <td colspan="2"><span class="label">Admissao:</span> ${escapeHtml(formatDate(collaboratorData?.admission_date) || '-')}</td>
        </tr>
      </tbody>
    </table>

    <table class="delivery-table">
      <thead>
        <tr><th class="section-title" colspan="5">RELATORIO DE ENTREGA</th></tr>
        <tr>
          <th style="width: 12%;">Quantidade</th>
          <th style="width: 38%;">Descricao do EPI</th>
          <th style="width: 12%;">N. C.A.</th>
          <th style="width: 18%;">Data de Entrega</th>
          <th style="width: 20%;">Assinatura</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
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
                { label: 'Função', value: collaboratorData.role || '—' },
                { label: 'Setor', value: collaboratorData.sector || '—' },
                {
                  label: 'Admissão',
                  value: collaboratorData.admission_date
                    ? new Date(`${collaboratorData.admission_date}T12:00:00`).toLocaleDateString('pt-BR')
                    : '—',
                },
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
                  <div className="flex items-center gap-2 min-w-0">
                    <HardHat size={16} className="text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{e.item}</p>
                      <p className="text-[11px] text-slate-500">
                        C.A.: {e.ca_number || '—'} | Qtd: {e.quantity || 1} | Entrega: {e.delivery_date ? new Date(`${e.delivery_date}T12:00:00`).toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Validade: {e.date ? new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</span>
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
  const [formData, setFormData] = useState({
    item: '',
    user: '',
    ca_number: '',
    quantity: 1,
    delivery_date: '',
    date: '',
  });
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
      .select('id, name, digital_signature, role, sector, admission_date, registration, contract_type')
      .eq('status', 'Ativo')
      .order('name');
    if (data) setCollaborators(data);
  };

  const filteredEPIs = epis.filter(e =>
    e.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.ca_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAtivo = epis.filter(e => e.status === 'Ativo').length;
  const totalVencendo = epis.filter(e => e.status === 'Vencendo').length;
  const totalExpirado = epis.filter(e => e.status === 'Expirado').length;
  const conformidade = epis.length > 0 ? Math.round((totalAtivo / epis.length) * 100) : 0;

  const handleOpenModal = (epi?: EPI) => {
    if (epi) {
      setEditingEPI(epi);
      setFormData({
        item: epi.item,
        user: epi.user,
        ca_number: epi.ca_number || '',
        quantity: epi.quantity || 1,
        delivery_date: epi.delivery_date || '',
        date: epi.date,
      });
    } else {
      setEditingEPI(null);
      setFormData({ item: '', user: '', ca_number: '', quantity: 1, delivery_date: '', date: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingEPI(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item.trim() || !formData.user.trim() || !formData.ca_number.trim() || !formData.delivery_date || !formData.date || formData.quantity < 1) {
      toast.error('Preencha todos os campos obrigatórios.');
      return;
    }
    const status = calcStatus(formData.date);
    try {
      if (editingEPI) {
        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'epis',
            action: 'update',
            payload: {
              item: formData.item.trim(),
              user: formData.user.trim(),
              ca_number: formData.ca_number.trim(),
              quantity: formData.quantity,
              delivery_date: formData.delivery_date,
              status,
              date: formData.date,
            },
            match: { column: 'id', value: editingEPI.id },
          },
        });

        if (result.status === 'error') throw result.error;
        toast.success(
          result.status === 'queued'
            ? 'Sem conexão: atualização de EPI enfileirada para sincronizar depois.'
            : 'EPI atualizado com sucesso!'
        );

        if (result.status === 'synced') {
          fetchEPIs();
        }
      } else {
        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'epis',
            action: 'insert',
            payload: [{
              item: formData.item.trim(),
              user: formData.user.trim(),
              ca_number: formData.ca_number.trim(),
              quantity: formData.quantity,
              delivery_date: formData.delivery_date,
              status,
              date: formData.date,
            }],
          },
        });

        if (result.status === 'error') throw result.error;
        toast.success(
          result.status === 'queued'
            ? 'Sem conexão: cadastro de EPI enfileirado para sincronizar depois.'
            : 'EPI registrado com sucesso!'
        );

        if (result.status === 'synced') {
          fetchEPIs();
        }
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error('Erro ao salvar EPI');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const result = await executeMutationWithOfflineQueue({
        supabase,
        operation: {
          table: 'epis',
          action: 'delete',
          match: { column: 'id', value: confirmDeleteId },
        },
      });

      if (result.status === 'error') throw result.error;

      toast.success(
        result.status === 'queued'
          ? 'Sem conexão: exclusão de EPI enfileirada para sincronizar depois.'
          : 'EPI removido do sistema.'
      );

      setConfirmDeleteId(null);
      setEpis(prev => prev.filter(item => item.id !== confirmDeleteId));
      if (result.status === 'synced') {
        fetchEPIs();
      }
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
              placeholder="Buscar por item, C.A. ou colaborador..."
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
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nº C.A.</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Entrega</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Colaborador</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Vencimento</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
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
                        <td className="px-6 py-4 text-sm text-slate-600">{e.ca_number || '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{e.delivery_date ? new Date(`${e.delivery_date}T12:00:00`).toLocaleDateString('pt-BR') : '—'}</td>
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
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nº do C.A.</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: 12345"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.ca_number}
                      onChange={(e) => setFormData({ ...formData, ca_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Quantidade</label>
                    <input
                      required
                      min={1}
                      type="number"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 1 })}
                    />
                  </div>
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
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={14} /> Data de Entrega</label>
                  <input required type="date" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} />
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
