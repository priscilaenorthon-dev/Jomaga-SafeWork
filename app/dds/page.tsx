'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import {
  Users,
  X,
  Check,
  UserCheck,
  ClipboardList,
  Plus,
  Search,
  History,
  Sparkles,
  ArrowRight,
  FileText,
  Trash2,
  Edit2,
  Loader2,
  Eye,
  Clock,
  Calendar,
  UserCog,
  Printer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import { executeMutationWithOfflineQueue } from '@/lib/offline-queue';

interface DDSRecord {
  id: string;
  date: string;
  theme: string;
  content: string;
  technician: string;
  participants: string[];
  duration: string;
}

interface Collaborator {
  id: string;
  name: string;
  digital_signature?: string;
}

// Parse duration string to total minutes
function parseDurationMinutes(duration: string): number {
  if (!duration) return 0;
  const d = duration.toLowerCase().replace(/\s/g, '');
  let total = 0;
  const hMatch = d.match(/(\d+(?:\.\d+)?)h/);
  const mMatch = d.match(/(\d+)min/);
  if (hMatch) total += parseFloat(hMatch[1]) * 60;
  if (mMatch) total += parseInt(mMatch[1]);
  if (!hMatch && !mMatch) total = parseInt(d) || 0;
  return total;
}

export default function DDSPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'history' | 'new' | 'ai'>('history');
  const [records, setRecords] = useState<DDSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const [newTheme, setNewTheme] = useState('');
  const [newContent, setNewContent] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [newDuration, setNewDuration] = useState('15 min');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const [editingRecord, setEditingRecord] = useState<DDSRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ theme: '', content: '', technician: '' });
  const [editParticipants, setEditParticipants] = useState<string[]>([]);

  const [detailRecord, setDetailRecord] = useState<DDSRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [aiConfigError, setAiConfigError] = useState<string | null>(null);

  useEffect(() => {
    fetchDDSRecords();
    fetchCollaborators();
    void loadUserProfile();

    const handleProfileUpdate = () => {
      void loadUserProfile();
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const loadUserProfile = async () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jomaga_user_profile');
      let savedProfile: any = null;

      if (saved) {
        try {
          savedProfile = JSON.parse(saved);
        } catch {
          savedProfile = null;
        }
      }

      if (saved) {
        const profileName = typeof savedProfile?.name === 'string' ? savedProfile.name.trim() : '';
        if (profileName && profileName.toLowerCase() !== 'usuário') {
          setTechnicianName(profileName);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      const fallbackName =
        (typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : '') ||
        (user?.email ? user.email.split('@')[0] : '');

      if (fallbackName) {
        setTechnicianName(fallbackName);
        const mergedProfile = {
          ...(savedProfile || {}),
          name: fallbackName,
          role: (savedProfile?.role || '').trim() || 'Técnico de Segurança',
          gender: savedProfile?.gender === 'female' ? 'female' : 'male',
        };
        localStorage.setItem('jomaga_user_profile', JSON.stringify(mergedProfile));
      }
    }
  };

  const fetchDDSRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dds_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching DDS records:', error.message);
      toast.error('Erro ao carregar registros de DDS');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .select('id, name, digital_signature')
        .eq('status', 'Ativo')
        .order('name', { ascending: true });

      if (error) throw error;
      setCollaborators((data || []) as Collaborator[]);
    } catch (error: any) {
      console.error('Error fetching collaborators:', error.message);
      // Fallback to empty array — no hardcoded names
    }
  };

  const filteredRecords = records.filter(r =>
    r.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.date.includes(searchTerm)
  );

  const toggleParticipant = (name: string) => {
    setSelectedParticipants(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handlePrintDDS = (record: DDSRecord) => {
    const companyBranding = (() => {
      try {
        const s = localStorage.getItem('jomaga_company_settings');
        const parsed = s ? JSON.parse(s) : {};
        return {
          companyName: parsed?.companyName || 'SafeWork',
          companyLogo: parsed?.companyLogo && !['/icon', '/icon-192.png', '/icon-512.png', '/logo-sistema.png'].includes(parsed.companyLogo) ? parsed.companyLogo : '/logo-modelos/safework-02-capacete-check.svg',
        };
      } catch {
        return { companyName: 'SafeWork', companyLogo: '/logo-modelos/safework-02-capacete-check.svg' };
      }
    })();

    const participantsWithSig = (record.participants || []).map(name => {
      const c = collaborators.find(c => c.name === name);
      return { name, sig: c?.digital_signature || '' };
    });

    const escapeHtml = (value: string) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const formatDate = (value: string) => {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
    };

    const minimumRows = 41;
    const totalRows = Math.max(participantsWithSig.length, minimumRows);
    const attendanceRows = Array.from({ length: totalRows }, (_, idx) => {
      const participant = participantsWithSig[idx];
      return `
        <tr>
          <td class="col-index">${idx + 1}</td>
          <td class="col-name">${participant ? escapeHtml(participant.name) : ''}</td>
          <td class="col-sign">${participant?.sig ? `<img src="${participant.sig}" alt="Assinatura" />` : ''}</td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Lista DDS — ${escapeHtml(record.theme)}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f1f1f1;
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
      font-size: 11px;
      line-height: 1.2;
    }
    .sheet {
      width: 190mm;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #7f7f7f;
      padding: 3mm;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .meta td,
    .meta th,
    .attendance td,
    .attendance th {
      border: 1px solid #7f7f7f;
      padding: 2px 4px;
      vertical-align: middle;
    }
    .title-row {
      text-align: center;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: .2px;
      height: 22px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
      margin-bottom: 4px;
    }
    .brand-wrap img {
      width: 26px;
      height: 26px;
      object-fit: contain;
    }
    .brand-wrap span {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .2px;
    }
    .label {
      font-weight: 700;
      font-size: 10px;
      white-space: nowrap;
    }
    .value {
      font-size: 10.5px;
      min-height: 14px;
    }
    .theme-row td {
      font-weight: 700;
      font-size: 10.5px;
      height: 20px;
    }
    .attendance {
      margin-top: -1px;
    }
    .attendance thead th {
      text-align: center;
      font-weight: 700;
      font-size: 10.5px;
      height: 20px;
    }
    .attendance tbody td {
      height: 15px;
      font-size: 10px;
      padding: 0 4px;
    }
    .col-index {
      width: 6%;
      text-align: center;
      padding: 0;
    }
    .col-name {
      width: 54%;
    }
    .col-sign {
      width: 40%;
      text-align: center;
      padding: 0;
    }
    .col-sign img {
      display: block;
      margin: 0 auto;
      max-width: 95%;
      max-height: 14px;
      object-fit: contain;
      mix-blend-mode: multiply;
    }
    .footer-note {
      margin-top: 3px;
      text-align: right;
      font-size: 9px;
      color: #444;
    }
    @media print {
      body { background: #fff; }
      .sheet {
        width: auto;
        margin: 0;
        border: 1px solid #7f7f7f;
        padding: 2mm;
      }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="brand-wrap">
      <img src="${escapeHtml(companyBranding.companyLogo)}" alt="Logo" />
      <span>${escapeHtml(companyBranding.companyName)}</span>
    </div>
    <table class="meta">
      <tr>
        <th class="title-row" colspan="4">LISTA DE DDS (Diálogo Diário de Segurança)</th>
      </tr>
      <tr>
        <td class="label">Técnico Seg. Trabalho:</td>
        <td class="value">${escapeHtml(record.technician || '')}</td>
        <td class="label">Data:</td>
        <td class="value">${escapeHtml(formatDate(record.date))}</td>
      </tr>
      <tr>
        <td class="label">Setor:</td>
        <td class="value">&nbsp;</td>
        <td class="label">Carga horária:</td>
        <td class="value">${escapeHtml(record.duration || '')}</td>
      </tr>
      <tr class="theme-row">
        <td colspan="4">TEMA DO CURSO/TREINAMENTO: ${escapeHtml(record.theme || '')}</td>
      </tr>
    </table>

    <table class="attendance">
      <thead>
        <tr>
          <th class="col-index"></th>
          <th class="col-name">Nome completo</th>
          <th class="col-sign">Assinatura</th>
        </tr>
      </thead>
      <tbody>
        ${attendanceRows}
      </tbody>
    </table>

    <div class="footer-note">${escapeHtml(companyBranding.companyName)} · Emitido em ${new Date().toLocaleDateString('pt-BR')}</div>
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  const handleSaveDDS = async () => {
    if (!newTheme.trim() || !newContent.trim() || selectedParticipants.length === 0) {
      toast.error('Preencha todos os campos e selecione ao menos um participante.');
      return;
    }
    if (!technicianName.trim()) {
      toast.error('Defina seu nome em Configurações > Perfil do Usuário antes de salvar o DDS.');
      return;
    }
    const durationMinutes = parseDurationMinutes(newDuration);
    if (durationMinutes < 15) {
      toast.error('A duração mínima do DDS é de 15 minutos. Corrija o campo de duração.');
      return;
    }

    try {
      const result = await executeMutationWithOfflineQueue({
        supabase,
        operation: {
          table: 'dds_records',
          action: 'insert',
          payload: [{
            date: new Date().toISOString().split('T')[0],
            theme: newTheme.trim(),
            content: newContent.trim(),
            technician: technicianName.trim(),
            participants: selectedParticipants,
            duration: newDuration.trim() || '15 min'
          }],
        },
      });

      if (result.status === 'error') throw result.error;

      toast.success(
        result.status === 'queued'
          ? 'Sem conexão: DDS enfileirado para sincronizar depois.'
          : 'DDS registrado com sucesso!'
      );

      setNewTheme('');
      setNewContent('');
      setNewDuration('15 min');
      setSelectedParticipants([]);
      if (result.status === 'synced') {
        fetchDDSRecords();
      }
      setActiveTab('history');
    } catch (error: any) {
      console.error('Error saving DDS:', error.message);
      toast.error('Erro ao salvar DDS');
    }
  };

  const handleOpenEdit = (record: DDSRecord) => {
    setEditingRecord(record);
    setEditForm({
      theme: record.theme,
      content: record.content,
      technician: record.technician,
    });
    setEditParticipants(record.participants || []);
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = (record: DDSRecord) => {
    setDetailRecord(record);
    setIsDetailModalOpen(true);
  };

  const toggleEditParticipant = (name: string) => {
    setEditParticipants(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    if (!editForm.theme.trim() || !editForm.content.trim()) {
      toast.error('Preencha o tema e o conteúdo.');
      return;
    }

    try {
      const result = await executeMutationWithOfflineQueue({
        supabase,
        operation: {
          table: 'dds_records',
          action: 'update',
          payload: {
            theme: editForm.theme.trim(),
            content: editForm.content.trim(),
            technician: editForm.technician.trim(),
            participants: editParticipants,
          },
          match: { column: 'id', value: editingRecord.id },
        },
      });

      if (result.status === 'error') throw result.error;

      toast.success(
        result.status === 'queued'
          ? 'Sem conexão: atualização do DDS enfileirada para sincronizar depois.'
          : 'Registro atualizado com sucesso!'
      );

      setIsEditModalOpen(false);
      setEditingRecord(null);
      if (result.status === 'synced') {
        fetchDDSRecords();
      }
    } catch (error: any) {
      console.error('Error updating DDS:', error.message);
      toast.error('Erro ao atualizar registro');
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const result = await executeMutationWithOfflineQueue({
        supabase,
        operation: {
          table: 'dds_records',
          action: 'delete',
          match: { column: 'id', value: id },
        },
      });

      if (result.status === 'error') throw result.error;
      toast.success(
        result.status === 'queued'
          ? 'Sem conexão: exclusão do DDS enfileirada para sincronizar depois.'
          : 'Registro removido.'
      );
      setRecords(prev => prev.filter(record => record.id !== id));
      if (result.status === 'synced') {
        fetchDDSRecords();
      }
    } catch (error: any) {
      console.error('Error deleting DDS:', error.message);
      toast.error('Erro ao excluir registro');
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Digite um tema ou palavra-chave para a IA.');
      return;
    }

    setIsGenerating(true);
    setAiConfigError(null);
    try {
      const response = await fetch('/api/generate-dds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const payload = await response.json().catch(() => ({} as { error?: string; text?: string }));

      if (!response.ok) {
        const apiMessage = payload?.error || 'Erro desconhecido';

        if (response.status === 401) {
          if (/sessão expirada/i.test(apiMessage)) {
            toast.error('Sua sessão expirou. Faça login novamente para usar a IA.');
          } else {
            toast.error('Acesso não autorizado para gerar conteúdo com IA.');
          }
          return;
        }

        if ((response.status === 500 || response.status === 401) && /chave|api/i.test(apiMessage)) {
          setAiConfigError(apiMessage);
        }

        throw new Error(apiMessage);
      }

      const text = payload?.text || 'Não foi possível gerar o conteúdo.';
      setGeneratedContent(text);
      setNewTheme(aiPrompt);
      setNewContent(text);
      toast.success('Conteúdo gerado com sucesso!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erro ao gerar conteúdo com IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Header title="Gestão de DDS" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200">
          {[
            { id: 'history', label: 'Histórico e Rastreabilidade', icon: History },
            { id: 'new', label: 'Novo Registro', icon: Plus },
            { id: 'ai', label: 'Elaborar com IA', icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={cn(
                'px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2',
                activeTab === id ? 'border-[#1A237E] text-[#1A237E]' : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Rastreabilidade de DDS</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar tema, técnico ou data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20 w-64"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <span>Carregando registros...</span>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <History size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">
                      {searchTerm ? 'Nenhum resultado para a busca.' : 'Nenhum registro encontrado.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredRecords.map((record) => (
                      <div key={record.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#1A237E]/30 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => handleOpenDetail(record)}
                              className="p-3 bg-[#1A237E]/10 text-[#1A237E] rounded-xl hover:bg-[#1A237E] hover:text-white transition-all cursor-pointer shrink-0"
                              title="Ver detalhes do DDS"
                            >
                              <Eye size={24} />
                            </button>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                                  {record.date}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                                  {record.duration}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-green-50 text-green-600 rounded">
                                  {record.technician}
                                </span>
                              </div>
                              <h4 className="font-bold text-slate-800">{record.theme}</h4>
                              <p className="text-sm text-slate-500 line-clamp-1 mt-1">{record.content}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <div className="flex items-center gap-1 justify-end text-xs font-bold text-slate-400 mb-1">
                                <Users size={12} />
                                PARTICIPANTES
                              </div>
                              <div className="flex -space-x-2 justify-end">
                                {record.participants && record.participants.slice(0, 3).map((p, i) => (
                                  <div key={i} className="w-7 h-7 rounded-full bg-[#1A237E] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white" title={p}>
                                    {p.charAt(0)}
                                  </div>
                                ))}
                                {record.participants && record.participants.length > 3 && (
                                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                    +{record.participants.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePrintDDS(record)}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                title="Imprimir relatório"
                              >
                                <Printer size={18} />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(record)}
                                className="p-2 text-slate-400 hover:text-[#1A237E] hover:bg-slate-50 rounded-lg transition-all"
                                title="Editar"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(record.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'new' && (
              <motion.div
                key="new"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList className="text-[#1A237E]" size={20} />
                    Detalhes do DDS
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Técnico Responsável</label>
                      <input
                        type="text"
                        value={technicianName}
                        onChange={(e) => setTechnicianName(e.target.value)}
                        placeholder="Nome do técnico..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duração</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                          placeholder="Ex: 15 min, 30 min, 1h"
                          className={cn(
                            "w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20 transition-all",
                            parseDurationMinutes(newDuration) < 15 && newDuration ? "border-red-300 bg-red-50" : "border-slate-200"
                          )}
                        />
                        {newDuration && parseDurationMinutes(newDuration) < 15 && (
                          <p className="text-xs text-red-500 mt-1">Duração mínima: 15 minutos</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tema do Diálogo</label>
                      <input
                        type="text"
                        value={newTheme}
                        onChange={(e) => setNewTheme(e.target.value)}
                        placeholder="Ex: Segurança em Altura, Uso de Luvas..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Conteúdo Abordado</label>
                      <textarea
                        rows={6}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Descreva brevemente o que foi discutido..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveDDS}
                    className="w-full bg-[#1A237E] text-white py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1A237E]/20"
                  >
                    <Check size={20} />
                    Finalizar e Salvar DDS
                  </button>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Users className="text-[#1A237E]" size={20} />
                      Lista de Presença
                    </h3>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                      {selectedParticipants.length} selecionados
                    </span>
                  </div>

                  {collaborators.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      Nenhum colaborador ativo cadastrado.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                      {collaborators.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => toggleParticipant(c.name)}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-xl border transition-all text-left',
                            selectedParticipants.includes(c.name)
                              ? 'bg-green-50 border-green-200 text-green-800'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs',
                              selectedParticipants.includes(c.name) ? 'bg-green-200' : 'bg-slate-100'
                            )}>
                              {c.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium">{c.name}</span>
                          </div>
                          {selectedParticipants.includes(c.name) && <UserCheck size={18} className="text-green-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto"
              >
                <div className="bg-gradient-to-br from-[#1A237E] to-[#3949AB] p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={120} />
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Assistente de Conteúdo IA</h3>
                      <p className="text-white/70 text-sm">
                        Otimize seu tempo. Deixe que nossa IA elabore os pontos principais do seu DDS baseado no tema escolhido.
                      </p>
                    </div>

                    {aiConfigError && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-900 p-4">
                        <p className="text-sm font-bold">Configuração de IA pendente</p>
                        <p className="text-xs mt-1">{aiConfigError}</p>
                        <p className="text-xs mt-1">Configure a variável no ambiente e publique novamente para habilitar a geração.</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && generateWithAI()}
                        placeholder="Digite o tema (ex: NR-10, Ergonomia...)"
                        className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <button
                        onClick={generateWithAI}
                        disabled={isGenerating}
                        className="px-8 py-4 bg-white text-[#1A237E] rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        Gerar Conteúdo
                      </button>
                    </div>

                    {generatedContent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/10 border border-white/20 p-6 rounded-xl space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-white/60">Sugestão Gerada</span>
                          <button
                            onClick={() => {
                              setActiveTab('new');
                              toast.success('Conteúdo copiado para o formulário!');
                            }}
                            className="text-xs font-bold flex items-center gap-1 hover:underline"
                          >
                            Usar este texto <ArrowRight size={14} />
                          </button>
                        </div>
                        <div className="text-sm leading-relaxed text-white/90 whitespace-pre-wrap">
                          {generatedContent}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    'NR-35: Trabalho em Altura',
                    'Ergonomia no Escritório',
                    'Prevenção de Incêndios',
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setAiPrompt(topic)}
                      className="p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-[#1A237E] hover:text-[#1A237E] transition-all text-left flex items-center justify-between group"
                    >
                      {topic}
                      <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal Editar Registro */}
      <AnimatePresence>
        {isEditModalOpen && editingRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
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
                  <div className="p-2 bg-[#1A237E]/10 text-[#1A237E] rounded-lg">
                    <Edit2 size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Editar Registro DDS</h3>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Técnico Responsável</label>
                  <input
                    type="text"
                    value={editForm.technician}
                    onChange={(e) => setEditForm({ ...editForm, technician: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1A237E]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tema do Diálogo</label>
                  <input
                    type="text"
                    value={editForm.theme}
                    onChange={(e) => setEditForm({ ...editForm, theme: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1A237E]/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Conteúdo</label>
                  <textarea
                    rows={4}
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#1A237E]/20 outline-none resize-none"
                  />
                </div>

                {/* Participantes */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Participantes</label>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                      {editParticipants.length} selecionados
                    </span>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 custom-scrollbar">
                    {collaborators.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">Nenhum colaborador disponível</p>
                    ) : (
                      collaborators.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => toggleEditParticipant(c.name)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all text-sm',
                            editParticipants.includes(c.name)
                              ? 'bg-green-50 text-green-800 border border-green-200'
                              : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]',
                              editParticipants.includes(c.name) ? 'bg-green-200 text-green-800' : 'bg-slate-100 text-slate-500'
                            )}>
                              {c.name.charAt(0)}
                            </div>
                            <span className="font-medium">{c.name}</span>
                          </div>
                          {editParticipants.includes(c.name) && <UserCheck size={14} className="text-green-600" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Detalhes do DDS */}
      <AnimatePresence>
        {isDetailModalOpen && detailRecord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-[#1A237E] to-[#3949AB]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-lg">
                      <FileText size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Detalhes do DDS</h3>
                      <p className="text-xs text-white/60">Registro completo do diálogo</p>
                    </div>
                  </div>
                  <button onClick={() => setIsDetailModalOpen(false)} className="p-2 text-white/60 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Informações básicas */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl text-center">
                    <Calendar size={16} className="mx-auto text-slate-400 mb-1" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Data</p>
                    <p className="text-sm font-bold text-slate-800">{detailRecord.date}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-center">
                    <Clock size={16} className="mx-auto text-slate-400 mb-1" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Duração</p>
                    <p className="text-sm font-bold text-slate-800">{detailRecord.duration}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-center">
                    <Users size={16} className="mx-auto text-slate-400 mb-1" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Presentes</p>
                    <p className="text-sm font-bold text-slate-800">{detailRecord.participants?.length || 0}</p>
                  </div>
                </div>

                {/* Técnico */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <UserCog size={18} className="text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase">Técnico Responsável</p>
                    <p className="text-sm font-bold text-blue-800">{detailRecord.technician}</p>
                  </div>
                </div>

                {/* Tema */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Tema do Diálogo</p>
                  <h4 className="text-lg font-bold text-slate-800">{detailRecord.theme}</h4>
                </div>

                {/* Conteúdo */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Conteúdo Abordado</p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{detailRecord.content}</p>
                  </div>
                </div>

                {/* Participantes */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Lista de Presença</p>
                  <div className="grid grid-cols-2 gap-2">
                    {detailRecord.participants && detailRecord.participants.length > 0 ? (
                      detailRecord.participants.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-100 rounded-lg">
                          <div className="w-7 h-7 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {p.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-green-800 truncate">{p}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 col-span-2 text-center py-3">Nenhum participante registrado.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all text-sm"
                >
                  Fechar
                </button>
                <button
                  onClick={() => { setIsDetailModalOpen(false); handleOpenEdit(detailRecord); }}
                  className="flex-1 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Edit2 size={16} />
                  Editar Registro
                </button>
              </div>
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Registro?</h3>
              <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { deleteRecord(confirmDeleteId); setConfirmDeleteId(null); }}
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
