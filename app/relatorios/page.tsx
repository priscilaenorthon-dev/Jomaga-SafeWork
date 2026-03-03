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
}

interface EpiStatus {
  name: string;
  value: number;
  color: string;
}

export default function RelatoriosPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [epiData, setEpiData] = useState<EpiStatus[]>([]);
  const [kpis, setKpis] = useState({ incidentes: 0, treinamentos: 0, ddsTotal: 0, ddsConformity: 0 });

  const [documents, setDocuments] = useState([
    { id: 1, name: 'PPRA_2025_Final.pdf', size: '2.4 MB', date: '15/01/2026', category: 'Segurança' },
    { id: 2, name: 'PCMSO_Atualizado.pdf', size: '1.8 MB', date: '20/01/2026', category: 'Saúde' },
    { id: 3, name: 'Laudo_Eletrico_Setor_A.pdf', size: '4.2 MB', date: '05/02/2026', category: 'Elétrica' },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteDocId, setConfirmDeleteDocId] = useState<number | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentYear = now.getFullYear();
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        return { year: d.getFullYear(), month: d.getMonth() + 1, name: MONTH_NAMES[d.getMonth()] };
      });

      const [
        { data: allIncidents },
        { data: allTrainings },
        { data: allEpis },
        { data: allDds },
      ] = await Promise.all([
        supabase.from('incidents').select('created_at').gte('created_at', `${currentYear - 1}-01-01`),
        supabase.from('trainings').select('date, status'),
        supabase.from('epis').select('status, date'),
        supabase.from('dds_records').select('date, participants'),
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

        return { name, incidentes, treinamentos };
      });
      setMonthlyData(monthly);

      // EPI status distribution (auto-calculate from dates)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let ativo = 0, vencendo = 0, expirado = 0;
      (allEpis || []).forEach((e: any) => {
        if (!e.date) { ativo++; return; }
        const expiry = new Date(e.date + 'T12:00:00');
        const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0) expirado++;
        else if (diff <= 30) vencendo++;
        else ativo++;
      });
      const totalEpis = ativo + vencendo + expirado;
      setEpiData([
        { name: 'Em Dia', value: totalEpis > 0 ? Math.round((ativo / totalEpis) * 100) : 0, color: '#1A237E' },
        { name: 'Vencendo', value: totalEpis > 0 ? Math.round((vencendo / totalEpis) * 100) : 0, color: '#FF9800' },
        { name: 'Expirado', value: totalEpis > 0 ? Math.round((expirado / totalEpis) * 100) : 0, color: '#F44336' },
      ]);

      // KPIs (current month)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const incidentsThisMonth = (allIncidents || []).filter((i: any) => i.created_at >= monthStart).length;
      const trainingsThisMonth = (allTrainings || []).filter((t: any) => {
        if (!t.date) return false;
        return t.date >= monthStart.split('T')[0];
      }).length;

      const ddsThisMonth = (allDds || []).filter((d: any) => {
        if (!d.date) return false;
        return d.date >= monthStart.split('T')[0];
      });
      const ddsWithPart = ddsThisMonth.filter((d: any) => d.participants && d.participants.length > 0).length;
      const conformity = ddsThisMonth.length > 0 ? Math.round((ddsWithPart / ddsThisMonth.length) * 100) : 0;

      setKpis({
        incidentes: incidentsThisMonth,
        treinamentos: trainingsThisMonth,
        ddsTotal: ddsThisMonth.length,
        ddsConformity: conformity,
      });
    } catch (err) {
      console.error('Error fetching report data:', err);
      toast.error('Erro ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (title: string) => {
    toast.info(`Iniciando download: ${title}`);
    setTimeout(() => toast.success(`Download de ${title} concluído!`), 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setTimeout(() => {
      setDocuments(prev => [{
        id: Date.now(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toLocaleDateString('pt-BR'),
        category: 'Geral',
      }, ...prev]);
      setIsUploading(false);
      toast.success('Documento importado com sucesso!');
    }, 1500);
  };

  const handleDeleteDocument = () => {
    if (!confirmDeleteDocId) return;
    setDocuments(prev => prev.filter(doc => doc.id !== confirmDeleteDocId));
    setConfirmDeleteDocId(null);
    toast.success('Documento removido.');
  };

  return (
    <>
      <Header title="Relatórios e Indicadores" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">

        {/* KPIs — real data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-28 animate-pulse" />
            ))
          ) : [
            {
              label: 'Incidentes no Mês',
              value: kpis.incidentes.toString(),
              sub: kpis.incidentes === 0 ? 'Mês sem incidentes' : `${kpis.incidentes} reportado${kpis.incidentes !== 1 ? 's' : ''}`,
              icon: AlertCircle,
              color: kpis.incidentes === 0 ? 'text-green-600' : 'text-red-600',
              bg: kpis.incidentes === 0 ? 'bg-green-50' : 'bg-red-50',
            },
            {
              label: 'Treinamentos no Mês',
              value: kpis.treinamentos.toString(),
              sub: 'Agendados ou concluídos',
              icon: CheckCircle2,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'DDS Realizados',
              value: kpis.ddsTotal.toString(),
              sub: 'No mês atual',
              icon: Calendar,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
            },
            {
              label: 'Conformidade DDS',
              value: kpis.ddsTotal > 0 ? `${kpis.ddsConformity}%` : '—',
              sub: kpis.ddsConformity >= 80 ? 'Na meta' : kpis.ddsTotal > 0 ? 'Abaixo da meta' : 'Sem dados',
              icon: TrendingUp,
              color: kpis.ddsConformity >= 80 ? 'text-green-600' : 'text-orange-600',
              bg: kpis.ddsConformity >= 80 ? 'bg-green-50' : 'bg-orange-50',
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
          {/* Chart: Incidents vs Trainings (real data) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Incidentes vs Treinamentos
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
                    <Bar dataKey="treinamentos" fill="#1A237E" radius={[4, 4, 0, 0]} name="Treinamentos" />
                    <Bar dataKey="incidentes" fill="#F44336" radius={[4, 4, 0, 0]} name="Incidentes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart: EPI Status (real data) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <PieChartIcon size={18} className="text-primary" />
              Status Geral de EPIs
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
            ) : epiData.every(e => e.value === 0) ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <PieChartIcon size={48} className="mb-3 text-slate-200" />
                <p className="text-sm">Nenhum EPI cadastrado ainda.</p>
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
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3 ml-4">
                  {epiData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold text-slate-600 whitespace-nowrap">{item.name}: {item.value}%</span>
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
              { title: 'Mapa de Riscos Atualizado', type: 'PDF', date: 'Trimestre atual', icon: PieChartIcon },
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
                    <button onClick={() => handleDownload(doc.name)} className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all">
                      <Download size={16} />
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
