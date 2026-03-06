'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import {
  BarChart3,
  Download,
  FileText,
  PieChart as PieChartIcon,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  Stethoscope,
  Package,
  Upload,
  Trash2,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface MonthlyData {
  name: string;
  incidentes: number;
  treinamentos: number;
  dds: number;
}

interface EpiStatus {
  name: string;
  value: number;
  color: string;
}

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  category: string;
  storage_path: string;
}

interface CompanyBranding {
  companyName: string;
  companyLogo: string;
}

export default function RelatoriosPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [companyBranding, setCompanyBranding] = useState<CompanyBranding>({
    companyName: 'SafeWork',
    companyLogo: '/icon',
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [epiData, setEpiData] = useState<EpiStatus[]>([]);
  const [kpis, setKpis] = useState({
    incidentesAbertos: 0,
    incidentesMes: 0,
    treinamentosConcluidosMes: 0,
    ddsTotalMes: 0,
    ddsConformity: 0,
    lgpdCoverage: 0,
    asoAlerts: 0,
    inventoryCritical: 0,
  });

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteDocId, setConfirmDeleteDocId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
    fetchDocuments();

    const loadCompanyBranding = () => {
      try {
        const saved = localStorage.getItem('jomaga_company_settings');
        if (!saved) {
          setCompanyBranding({ companyName: 'SafeWork', companyLogo: '/icon' });
          return;
        }

        const parsed = JSON.parse(saved);
        setCompanyBranding({
          companyName: parsed?.companyName || 'SafeWork',
          companyLogo: parsed?.companyLogo || '/icon',
        });
      } catch {
        setCompanyBranding({ companyName: 'SafeWork', companyLogo: '/icon' });
      }
    };

    loadCompanyBranding();
    window.addEventListener('company-settings-updated', loadCompanyBranding);

    return () => {
      window.removeEventListener('company-settings-updated', loadCompanyBranding);
    };
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { year: d.getFullYear(), month: d.getMonth() + 1, name: MONTH_NAMES[d.getMonth()] };
      });

      const [
        { data: allIncidents },
        { data: allTrainings },
        { data: allEpis },
        { data: allDds },
        { data: allCollaborators },
        { data: allAsos },
        { data: allInventory },
      ] = await Promise.all([
        supabase.from('incidents').select('created_at, status, photos'),
        supabase.from('trainings').select('date, status'),
        supabase.from('epis').select('date'),
        supabase.from('dds_records').select('date, participants'),
        supabase.from('collaborators').select('status, lgpd_consent'),
        supabase.from('asos').select('next_exam_date'),
        supabase.from('epi_inventory').select('current_stock, minimum_stock'),
      ]);

      // Monthly chart data
      const monthly = last6Months.map(({ year, month, name }) => {
        const incidentes = (allIncidents || []).filter((i: any) => {
          const d = new Date(i.created_at);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        }).length;

        const treinamentos = (allTrainings || []).filter((t: any) => {
          if (!t.date) return false;
          const d = new Date(t.date);
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        }).length;

        const dds = (allDds || []).filter((record: any) => {
          if (!record.date) return false;
          const d = new Date(record.date + 'T12:00:00');
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        }).length;

        return { name, incidentes, treinamentos, dds };
      });
      setMonthlyData(monthly);

      // Operational risk distribution
      const openIncidents = (allIncidents || []).filter((i: any) => i.status !== 'Fechado').length;
      const inventoryCritical = (allInventory || []).filter((item: any) => item.current_stock < item.minimum_stock).length;

      const asosWithDate = (allAsos || []).filter((a: any) => !!a.next_exam_date);
      const asoAlerts = asosWithDate.filter((a: any) => {
        const next = new Date(a.next_exam_date + 'T00:00:00');
        const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }).length;

      let episExpired = 0;
      (allEpis || []).forEach((e: any) => {
        if (!e.date) return;
        const expiry = new Date(e.date + 'T12:00:00');
        if (expiry < today) episExpired++;
      });

      setEpiData([
        { name: 'Incidentes Abertos', value: openIncidents, color: '#F44336' },
        { name: 'ASOs em Alerta', value: asoAlerts, color: '#FF9800' },
        { name: 'EPI Expirado', value: episExpired, color: '#8E24AA' },
        { name: 'Estoque Crítico', value: inventoryCritical, color: '#1A237E' },
      ]);

      // KPIs (current month)
      const monthStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const incidentsThisMonth = (allIncidents || []).filter((i: any) => i.created_at >= `${monthStartDate}T00:00:00`).length;
      const trainingsCompletedMonth = (allTrainings || []).filter((t: any) => {
        if (!t.date) return false;
        return t.date >= monthStartDate && t.status === 'Concluído';
      }).length;

      const ddsThisMonth = (allDds || []).filter((d: any) => {
        if (!d.date) return false;
        return d.date >= monthStartDate;
      });
      const ddsWithPart = ddsThisMonth.filter((d: any) => d.participants && d.participants.length > 0).length;
      const conformity = ddsThisMonth.length > 0 ? Math.round((ddsWithPart / ddsThisMonth.length) * 100) : 0;

      const activeCollaborators = (allCollaborators || []).filter((c: any) => c.status === 'Ativo');
      const lgpdAccepted = activeCollaborators.filter((c: any) => c.lgpd_consent === true).length;
      const lgpdCoverage = activeCollaborators.length > 0 ? Math.round((lgpdAccepted / activeCollaborators.length) * 100) : 0;

      setKpis({
        incidentesAbertos: openIncidents,
        incidentesMes: incidentsThisMonth,
        treinamentosConcluidosMes: trainingsCompletedMonth,
        ddsTotalMes: ddsThisMonth.length,
        ddsConformity: conformity,
        lgpdCoverage,
        asoAlerts,
        inventoryCritical,
      });
    } catch (err) {
      console.error('Error fetching report data:', err);
      toast.error('Erro ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocuments((data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        date: new Date(doc.created_at).toLocaleDateString('pt-BR'),
        category: doc.category || 'Geral',
        storage_path: doc.storage_path,
      })));
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleDownload = async (title: string, storagePath?: string) => {
    try {
      if (storagePath) {
        // Download from Supabase storage
        const docItem = documents.find(d => d.storage_path === storagePath);
        if (docItem) setDownloadingId(docItem.id);
        toast.info(`Iniciando download: ${title}`);

        const { data, error } = await supabase.storage
          .from('documents')
          .download(storagePath);

        if (error) throw error;

        // Create a blob URL and trigger real browser download
        const blob = data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success(`Download de ${title} concluído!`);
      } else {
        // For static reports, generate a client-side export
        toast.info(`Gerando relatório: ${title}...`);
        await generateReportDownload(title);
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error(`Erro ao baixar ${title}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const generateReportDownload = async (title: string) => {
    if (title.includes('Segurança')) {
      generateMonthlySecurityPdf();
      return;
    }

    // Generate a simple CSV/text report based on current data
    let content = '';
    let filename = '';
    let mimeType = 'text/plain';

    if (title.includes('Acidentes')) {
      filename = `Indicadores_Acidentes_${new Date().getFullYear()}.csv`;
      mimeType = 'text/csv';
      content = 'Mês,Incidentes\n';
      monthlyData.forEach(m => {
        content += `${m.name},${m.incidentes}\n`;
      });
    } else if (title.includes('Riscos')) {
      filename = `Mapa_Riscos_${new Date().toISOString().slice(0, 7)}.csv`;
      mimeType = 'text/csv';
      content = 'Indicador,Quantidade\n';
      epiData.forEach(e => {
        content += `${e.name},${e.value}\n`;
      });
    } else if (title.includes('Certificados')) {
      filename = `Certificados_Treinamento.csv`;
      mimeType = 'text/csv';
      content = 'Tipo,Quantidade\n';
      content += `Treinamentos Concluídos no Mês,${kpis.treinamentosConcluidosMes}\n`;
      content += `DDS Realizados no Mês,${kpis.ddsTotalMes}\n`;
    } else {
      filename = `${title.replace(/\s/g, '_')}.txt`;
      content = `Relatório: ${title}\nGerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(`Download de ${filename} concluído!`);
  };

  const generateMonthlySecurityPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Não foi possível abrir a janela de impressão.');
      return;
    }

    const escapeHtml = (value: string) =>
      String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const monthRows = monthlyData.map((m) => `
      <tr>
        <td>${escapeHtml(m.name)}</td>
        <td>${m.incidentes}</td>
        <td>${m.treinamentos}</td>
        <td>${m.dds}</td>
      </tr>
    `).join('');

    const pendingRows = epiData.map((p) => `
      <tr>
        <td>${escapeHtml(p.name)}</td>
        <td>${p.value}</td>
      </tr>
    `).join('');

    const now = new Date();
    const reference = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório Mensal de Segurança</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; margin: 0; font-size: 12px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1A237E; padding-bottom: 10px; margin-bottom: 14px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img { width: 38px; height: 38px; border-radius: 8px; object-fit: contain; border: 1px solid #e2e8f0; padding: 2px; }
    .title { text-align: right; }
    .title h1 { margin: 0; font-size: 16px; color: #1A237E; }
    .title p { margin: 2px 0 0 0; font-size: 10px; color: #64748b; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background: #f8fafc; }
    .card .k { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: .3px; }
    .card .v { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    h2 { margin: 16px 0 8px 0; font-size: 12px; color: #1e293b; text-transform: uppercase; letter-spacing: .3px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #dbe1ea; padding: 6px 8px; text-align: left; }
    th { background: #1A237E; color: #fff; font-size: 10px; text-transform: uppercase; }
    .footer { margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <img src="${escapeHtml(companyBranding.companyLogo)}" alt="Logo" />
      <div>
        <strong>${escapeHtml(companyBranding.companyName)}</strong>
        <div style="font-size:10px;color:#64748b;">Sistema SafeWork</div>
      </div>
    </div>
    <div class="title">
      <h1>Relatório Mensal de Segurança</h1>
      <p>Referência: ${escapeHtml(reference)}</p>
    </div>
  </div>

  <div class="grid">
    <div class="card"><div class="k">Incidentes Abertos</div><div class="v">${kpis.incidentesAbertos}</div></div>
    <div class="card"><div class="k">Incidentes no Mês</div><div class="v">${kpis.incidentesMes}</div></div>
    <div class="card"><div class="k">Treinamentos Concluídos</div><div class="v">${kpis.treinamentosConcluidosMes}</div></div>
    <div class="card"><div class="k">DDS no Mês</div><div class="v">${kpis.ddsTotalMes}</div></div>
    <div class="card"><div class="k">Conformidade DDS</div><div class="v">${kpis.ddsConformity}%</div></div>
    <div class="card"><div class="k">Cobertura LGPD</div><div class="v">${kpis.lgpdCoverage}%</div></div>
    <div class="card"><div class="k">Alertas ASO</div><div class="v">${kpis.asoAlerts}</div></div>
    <div class="card"><div class="k">Estoque Crítico EPI</div><div class="v">${kpis.inventoryCritical}</div></div>
  </div>

  <h2>Ritmo Operacional (6 meses)</h2>
  <table>
    <thead>
      <tr>
        <th>Mês</th>
        <th>Incidentes</th>
        <th>Treinamentos</th>
        <th>DDS</th>
      </tr>
    </thead>
    <tbody>
      ${monthRows || '<tr><td colspan="4">Sem dados no período.</td></tr>'}
    </tbody>
  </table>

  <h2>Pendências Operacionais</h2>
  <table>
    <thead>
      <tr>
        <th>Indicador</th>
        <th>Quantidade</th>
      </tr>
    </thead>
    <tbody>
      ${pendingRows || '<tr><td colspan="2">Sem pendências críticas.</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    <span>${escapeHtml(companyBranding.companyName)} · Relatório gerado automaticamente</span>
    <span>SafeWork</span>
  </div>
</body>
</html>`);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
    toast.success('Relatório profissional pronto. Use “Salvar como PDF” na impressão.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}_${file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Detect category from file name
      const nameLower = file.name.toLowerCase();
      let category = 'Geral';
      if (nameLower.includes('ppra') || nameLower.includes('seguranca') || nameLower.includes('segurança')) category = 'Segurança';
      else if (nameLower.includes('pcmso') || nameLower.includes('saude') || nameLower.includes('saúde')) category = 'Saúde';
      else if (nameLower.includes('laudo') || nameLower.includes('eletric')) category = 'Elétrica';
      else if (nameLower.includes('treinamento') || nameLower.includes('certificado')) category = 'Treinamento';

      // Save metadata to documents table
      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          category,
          storage_path: filePath,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setDocuments(prev => [{
        id: docData.id,
        name: docData.name,
        size: docData.size,
        date: new Date(docData.created_at).toLocaleDateString('pt-BR'),
        category: docData.category,
        storage_path: docData.storage_path,
      }, ...prev]);
      toast.success('Documento importado com sucesso!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err?.message || 'Erro ao enviar documento.');
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async () => {
    if (!confirmDeleteDocId) return;
    const doc = documents.find(d => d.id === confirmDeleteDocId);
    if (!doc) return;

    try {
      // Delete from storage
      if (doc.storage_path) {
        await supabase.storage.from('documents').remove([doc.storage_path]);
      }

      // Delete from DB
      const { error } = await supabase.from('documents').delete().eq('id', doc.id);
      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== confirmDeleteDocId));
      toast.success('Documento removido.');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Erro ao remover documento.');
    } finally {
      setConfirmDeleteDocId(null);
    }
  };

  return (
    <>
      <Header title="Relatórios e Indicadores" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">

        {/* KPIs — real data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-28 animate-pulse" />
            ))
          ) : [
            {
              label: 'Incidentes em Aberto',
              value: kpis.incidentesAbertos.toString(),
              sub: `${kpis.incidentesMes} registrado${kpis.incidentesMes !== 1 ? 's' : ''} no mês`,
              icon: AlertCircle,
              color: kpis.incidentesAbertos === 0 ? 'text-green-600' : 'text-red-600',
              bg: kpis.incidentesAbertos === 0 ? 'bg-green-50' : 'bg-red-50',
            },
            {
              label: 'Treinamentos Concluídos',
              value: kpis.treinamentosConcluidosMes.toString(),
              sub: 'Concluídos no mês atual',
              icon: CheckCircle2,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Conformidade de DDS',
              value: kpis.ddsTotalMes > 0 ? `${kpis.ddsConformity}%` : '—',
              sub: `${kpis.ddsTotalMes} DDS registrados no mês`,
              icon: Calendar,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
            },
            {
              label: 'Cobertura LGPD',
              value: `${kpis.lgpdCoverage}%`,
              sub: 'Colaboradores ativos com consentimento',
              icon: Users,
              color: kpis.lgpdCoverage >= 90 ? 'text-green-600' : 'text-orange-600',
              bg: kpis.lgpdCoverage >= 90 ? 'bg-green-50' : 'bg-orange-50',
            },
            {
              label: 'Alertas de ASO',
              value: kpis.asoAlerts.toString(),
              sub: 'Vencidos ou a vencer em até 30 dias',
              icon: Stethoscope,
              color: kpis.asoAlerts > 0 ? 'text-red-600' : 'text-green-600',
              bg: kpis.asoAlerts > 0 ? 'bg-red-50' : 'bg-green-50',
            },
            {
              label: 'Estoque Crítico de EPI',
              value: kpis.inventoryCritical.toString(),
              sub: kpis.inventoryCritical > 0 ? 'Itens abaixo do mínimo' : 'Sem alertas de estoque',
              icon: Package,
              color: kpis.inventoryCritical > 0 ? 'text-red-600' : 'text-green-600',
              bg: kpis.inventoryCritical > 0 ? 'bg-red-50' : 'bg-green-50',
            },
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 ${kpi.bg} ${kpi.color} rounded-lg`}>
                  <kpi.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mês Atual</span>
              </div>
              <div className="text-2xl font-black text-slate-800">{kpi.value}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">{kpi.label}</div>
              <div className={`text-[10px] font-bold mt-2 ${kpi.color}`}>{kpi.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart: Incidents vs Trainings vs DDS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Ritmo Operacional SST
              </h3>
              <span className="text-xs text-slate-400 font-bold uppercase">Últimos 6 meses</span>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="dds" fill="#FF9800" radius={[4, 4, 0, 0]} name="DDS" />
                    <Bar dataKey="treinamentos" fill="#1A237E" radius={[4, 4, 0, 0]} name="Treinamentos" />
                    <Bar dataKey="incidentes" fill="#F44336" radius={[4, 4, 0, 0]} name="Incidentes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart: Operational pending items */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <PieChartIcon size={18} className="text-primary" />
              Pendências Operacionais
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
            ) : epiData.every(e => e.value === 0) ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <PieChartIcon size={48} className="mb-3 text-slate-200" />
                <p className="text-sm">Sem pendências críticas no momento.</p>
              </div>
            ) : (
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie data={epiData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                      {epiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} item(ns)`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3 ml-4">
                  {epiData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Available reports for download */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
            <FileText size={18} className="text-primary" />
            Relatórios Disponíveis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Relatório Mensal de Segurança', type: 'PDF', date: 'Mês atual', icon: FileText },
              { title: 'Indicadores de Acidentes', type: 'XLSX', date: 'Ano atual', icon: BarChart3 },
              { title: 'Mapa de Riscos Operacionais', type: 'CSV', date: 'Atualizado', icon: AlertCircle },
              { title: 'Certificados de Treinamento', type: 'ZIP', date: 'Acumulado', icon: CheckCircle2 },
            ].map((report, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-primary/20 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                    <report.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{report.title}</h4>
                    <p className="text-[10px] text-slate-400 font-medium uppercase">{report.type} • {report.date}</p>
                  </div>
                </div>
                <button onClick={() => handleDownload(report.title)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Document repository */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Repositório de Documentos
              </h3>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">{doc.category} • {doc.size} • {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownload(doc.name, doc.storage_path)}
                      disabled={downloadingId === doc.id}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all disabled:opacity-50"
                    >
                      {downloadingId === doc.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    </button>
                    <button onClick={() => setConfirmDeleteDocId(doc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="py-12 text-center">
                  <FileText className="mx-auto text-slate-200 mb-2" size={48} />
                  <p className="text-sm text-slate-400">Nenhum documento no repositório.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-4">
              <Upload size={32} />
            </div>
            <h4 className="font-bold text-slate-800 mb-2">Importar Documentos</h4>
            <p className="text-xs text-slate-500 mb-6 px-4">Selecione arquivos PDF, DOCX ou XLSX para adicionar ao repositório.</p>

            <label className={cn(
              'w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/20',
              isUploading && 'opacity-50 cursor-not-allowed'
            )}>
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Selecionar Arquivo
                </>
              )}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept=".pdf,.docx,.xlsx" />
            </label>
            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">PDF • DOCX • XLSX</p>
          </div>
        </div>
      </div>

      {/* Confirm delete document modal */}
      <AnimatePresence>
        {confirmDeleteDocId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteDocId(null)}
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Documento?</h3>
              <p className="text-sm text-slate-500 mb-6">Esta ação remove o arquivo do repositório.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteDocId(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteDocument}
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
