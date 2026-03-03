'use client';

import React from 'react';
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
  Search,
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

const dataIncidentes = [
  { name: 'Jan', incidentes: 4, treinamentos: 12 },
  { name: 'Fev', incidentes: 3, treinamentos: 15 },
  { name: 'Mar', incidentes: 2, treinamentos: 18 },
  { name: 'Abr', incidentes: 5, treinamentos: 10 },
  { name: 'Mai', incidentes: 1, treinamentos: 22 },
  { name: 'Jun', incidentes: 0, treinamentos: 25 },
];

const dataEPIs = [
  { name: 'Em Uso', value: 85, color: '#1A237E' },
  { name: 'Vencendo', value: 10, color: '#FF9800' },
  { name: 'Atrasado', value: 5, color: '#F44336' },
];

export default function RelatoriosPage() {
  const [documents, setDocuments] = React.useState([
    { id: 1, name: "PPRA_2025_Final.pdf", size: "2.4 MB", date: "15/01/2026", category: "Segurança" },
    { id: 2, name: "PCMSO_Atualizado.pdf", size: "1.8 MB", date: "20/01/2026", category: "Saúde" },
    { id: 3, name: "Laudo_Eletrico_Setor_A.pdf", size: "4.2 MB", date: "05/02/2026", category: "Elétrica" },
  ]);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleDownload = (title: string) => {
    toast.info(`Iniciando download de: ${title}`);
    setTimeout(() => {
      toast.success(`Download de ${title} concluído!`);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
        const newDoc = {
          id: Date.now(),
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
          date: new Date().toLocaleDateString('pt-BR'),
          category: "Geral"
        };
        setDocuments([newDoc, ...documents]);
        setIsUploading(false);
        toast.success("Documento importado com sucesso!");
      }, 2000);
    }
  };

  const handleDeleteDocument = (id: number) => {
    if (confirm("Deseja realmente excluir este documento do repositório?")) {
      setDocuments(documents.filter(doc => doc.id !== id));
      toast.success("Documento removido.");
    }
  };

  return (
    <>
      <Header title="Relatórios e Indicadores" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        
        {/* KPIs Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Taxa de Frequência", value: "2.4", sub: "-15% vs mês ant.", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Treinamentos Realizados", value: "48", sub: "92% da meta", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            { label: "Incidentes Reportados", value: "12", sub: "3 críticos", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
            { label: "DDS Realizados", value: "100%", sub: "Conformidade total", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((kpi, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
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
          {/* Gráfico de Incidentes vs Treinamentos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" />
                Incidentes vs Treinamentos
              </h3>
              <select className="text-xs font-bold bg-slate-50 border-none rounded-lg px-2 py-1 outline-none">
                <option>Últimos 6 meses</option>
                <option>Ano atual</option>
              </select>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataIncidentes}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="treinamentos" fill="#1A237E" radius={[4, 4, 0, 0]} name="Treinamentos" />
                  <Bar dataKey="incidentes" fill="#F44336" radius={[4, 4, 0, 0]} name="Incidentes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Status de EPIs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <PieChartIcon size={18} className="text-primary" />
              Status Geral de EPIs
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataEPIs}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataEPIs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 ml-4">
                {dataEPIs.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-600">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Relatórios para Download */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
            <FileText size={18} className="text-primary" />
            Relatórios Disponíveis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Relatório Mensal de Segurança", type: "PDF", date: "Fev 2026", icon: FileText },
              { title: "Indicadores de Acidentes", type: "XLSX", date: "Jan-Dez 2025", icon: BarChart3 },
              { title: "Mapa de Riscos Atualizado", type: "PDF", date: "Mar 2026", icon: PieChartIcon },
              { title: "Certificados de Treinamento", type: "ZIP", date: "Q1 2026", icon: CheckCircle2 },
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
                <button 
                  onClick={() => handleDownload(report.title)}
                  className="p-2 text-slate-400 hover:text-primary transition-colors"
                >
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Repositório de Documentos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Repositório de Documentos
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  placeholder="Buscar documentos..."
                  className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
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
                      onClick={() => handleDownload(doc.name)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                    >
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
            <p className="text-xs text-slate-500 mb-6 px-4">Arraste seus arquivos aqui ou clique no botão abaixo para selecionar.</p>
            
            <label className={cn(
              "w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/20",
              isUploading && "opacity-50 cursor-not-allowed"
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
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">Formatos aceitos: PDF, DOCX, XLSX</p>
          </div>
        </div>
      </div>
    </>
  );
}
