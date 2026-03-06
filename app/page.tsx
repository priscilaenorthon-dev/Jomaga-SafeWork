'use client';

import React from 'react';
import {
  Users,
  AlertTriangle,
  BarChart3,
  UserCheck,
  PlusCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  Package,
  ClipboardCheck,
  CalendarClock,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase-client';

interface DashboardStats {
  activeCollaborators: number;
  signatureCoverage: number;
  signedCollaborators: number;
  lgpdCoverage: number;
  ddsConformity: number;
  ddsLast30: number;
  asoAlerts: number;
  asoExpired: number;
  asoExpiring30: number;
  asoOnTime: number;
  inventoryCritical: number;
  openIncidents: number;
  incidentsLast30: number;
  incidentsEvidenceCoverage: number;
  trainingsUpcoming30: number;
  episExpired: number;
}

interface DashboardAlert {
  title: string;
  time: string;
  description: string;
  type: string;
  status: string;
  icon: any;
  iconBg: string;
}

const StatCard = ({ title, value, change, icon: Icon, iconColor, bgColor, trend, loading, onClick }: { 
  title: string, 
  value: string | number, 
  change: string, 
  icon: any, 
  iconColor: string, 
  bgColor: string,
  trend?: 'up' | 'down' | 'warning' | 'danger' | 'success',
  loading?: boolean,
  onClick?: () => void,
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    } : undefined}
    className={cn(
      'bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[140px]',
      onClick && 'cursor-pointer hover:border-primary/30 hover:bg-slate-50/40 transition-colors'
    )}
  >
    <div className="flex justify-between items-start">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <div className={cn("p-1.5 rounded-lg", bgColor)}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
    <div className="mt-4">
      {loading ? (
        <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
      ) : (
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{value}</h3>
      )}
      <p className={cn(
        "text-xs font-bold mt-1 flex items-center gap-1",
        trend === 'up' && "text-green-600",
        trend === 'down' && "text-green-600",
        trend === 'warning' && "text-orange-600",
        trend === 'danger' && "text-red-600",
        trend === 'success' && "text-green-600",
      )}>
        {trend === 'up' && <TrendingUp size={12} />}
        {trend === 'down' && <TrendingUp size={12} className="rotate-180" />}
        {change}
      </p>
    </div>
  </motion.div>
);

const AlertItem = ({ title, time, description, type, status, icon: Icon, iconBg, onClick }: {
  title: string,
  time: string,
  description: string,
  type: string,
  status: string,
  icon: any,
  iconBg: string,
  onClick?: () => void,
}) => (
  <div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    } : undefined}
    className={cn(
      'flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-colors',
      onClick && 'cursor-pointer'
    )}
  >
    <div className={cn("w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
      <Icon size={24} className="sm:size-32 opacity-80" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{title}</h4>
        <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap ml-2">{time}</span>
      </div>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase">{type}</span>
        <span className={cn(
          "px-2 py-1 rounded text-[10px] font-bold uppercase",
          status === 'Crítico' ? "bg-primary/10 text-primary" : 
          status === 'Em Andamento' ? "bg-orange-100 text-orange-600" : 
          "bg-blue-100 text-blue-600"
        )}>{status}</span>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<DashboardStats>({
    activeCollaborators: 0,
    signatureCoverage: 0,
    signedCollaborators: 0,
    lgpdCoverage: 0,
    ddsConformity: 0,
    ddsLast30: 0,
    asoAlerts: 0,
    asoExpired: 0,
    asoExpiring30: 0,
    asoOnTime: 0,
    inventoryCritical: 0,
    openIncidents: 0,
    incidentsLast30: 0,
    incidentsEvidenceCoverage: 0,
    trainingsUpcoming30: 0,
    episExpired: 0,
  });
  const [alerts, setAlerts] = React.useState<DashboardAlert[]>([]);

  React.useEffect(() => {
    void fetchStats();
  }, []);

  const openReport = (reportTitle: string) => {
    router.push(`/relatorios?report=${encodeURIComponent(reportTitle)}`);
  };

  const reportByAlertType: Record<string, string> = {
    Inventário: 'Ficha de EPI (Consolidada)',
    ASO: 'Relatório Mensal de Segurança',
    Incidente: 'Relatório de Incidentes (CAT)',
    EPI: 'Ficha de EPI (Consolidada)',
    Treinamento: 'Certificados de Treinamento',
    Conformidade: 'Relatório Mensal de Segurança',
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const thirtyDaysAhead = new Date(today);
      thirtyDaysAhead.setDate(today.getDate() + 30);
      const todayStr = today.toISOString().split('T')[0];
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
      const thirtyDaysAheadStr = thirtyDaysAhead.toISOString().split('T')[0];

      const [
        { data: collaborators },
        { data: asos },
        { data: inventory },
        { data: incidents },
        { data: trainings },
        { data: dds },
        { data: epis },
      ] = await Promise.all([
        supabase.from('collaborators').select('status, digital_signature, lgpd_consent'),
        supabase.from('asos').select('next_exam_date'),
        supabase.from('epi_inventory').select('epi_name, current_stock, minimum_stock'),
        supabase.from('incidents').select('status, created_at, photos'),
        supabase.from('trainings').select('date, status'),
        supabase.from('dds_records').select('date, participants'),
        supabase.from('epis').select('date'),
      ]);

      const activeCollaborators = (collaborators || []).filter((c: any) => c.status === 'Ativo');
      const activeCount = activeCollaborators.length;
      const signedCollaborators = activeCollaborators.filter((c: any) => typeof c.digital_signature === 'string' && c.digital_signature.trim().length > 0).length;
      const lgpdAccepted = activeCollaborators.filter((c: any) => c.lgpd_consent === true).length;

      const signatureCoverage = activeCount > 0 ? Math.round((signedCollaborators / activeCount) * 100) : 0;
      const lgpdCoverage = activeCount > 0 ? Math.round((lgpdAccepted / activeCount) * 100) : 0;

      const asoWithDate = (asos || []).filter((a: any) => !!a.next_exam_date);
      const asoExpired = asoWithDate.filter((a: any) => {
        const target = new Date(`${a.next_exam_date}T00:00:00`);
        return target < today;
      }).length;
      const asoExpiring30 = asoWithDate.filter((a: any) => {
        const target = new Date(`${a.next_exam_date}T00:00:00`);
        return target >= today && target <= thirtyDaysAhead;
      }).length;
      const asoAlerts = asoExpired + asoExpiring30;
      const asoOnTime = asoWithDate.length > 0
        ? Math.round(((asoWithDate.length - asoExpired) / asoWithDate.length) * 100)
        : 0;

      const inventoryCritical = (inventory || []).filter((i: any) => i.current_stock < i.minimum_stock).length;

      const openIncidents = (incidents || []).filter((i: any) => i.status !== 'Fechado').length;
      const incidentsLast30 = (incidents || []).filter((i: any) => {
        const created = new Date(i.created_at);
        return created >= thirtyDaysAgo;
      });
      const incidentsWithEvidence = incidentsLast30.filter((i: any) => Array.isArray(i.photos) && i.photos.length > 0).length;
      const incidentsEvidenceCoverage = incidentsLast30.length > 0
        ? Math.round((incidentsWithEvidence / incidentsLast30.length) * 100)
        : 0;

      const trainingsUpcoming30 = (trainings || []).filter((t: any) => {
        if (!t.date || t.status === 'Concluído') return false;
        return t.date >= todayStr && t.date <= thirtyDaysAheadStr;
      }).length;

      const ddsLast30 = (dds || []).filter((d: any) => d.date >= thirtyDaysAgoStr);
      const ddsWithParticipants = ddsLast30.filter((d: any) => Array.isArray(d.participants) && d.participants.length > 0).length;
      const ddsConformity = ddsLast30.length > 0
        ? Math.round((ddsWithParticipants / ddsLast30.length) * 100)
        : 0;

      const episExpired = (epis || []).filter((e: any) => {
        if (!e.date) return false;
        const expiry = new Date(`${e.date}T00:00:00`);
        return expiry < today;
      }).length;

      setStats({
        activeCollaborators: activeCount,
        signatureCoverage,
        signedCollaborators,
        lgpdCoverage,
        ddsConformity,
        ddsLast30: ddsLast30.length,
        asoAlerts,
        asoExpired,
        asoExpiring30,
        asoOnTime,
        inventoryCritical,
        openIncidents,
        incidentsLast30: incidentsLast30.length,
        incidentsEvidenceCoverage,
        trainingsUpcoming30,
        episExpired,
      });

      const nextAlerts: DashboardAlert[] = [];
      if (inventoryCritical > 0) {
        nextAlerts.push({
          title: 'Estoque crítico no inventário de EPIs',
          time: 'Atualizado agora',
          description: `${inventoryCritical} item(ns) abaixo do estoque mínimo no inventário de EPIs.`,
          type: 'Inventário',
          status: 'Crítico',
          icon: Package,
          iconBg: 'bg-red-100 text-red-600',
        });
      }
      if (asoExpired > 0) {
        nextAlerts.push({
          title: 'ASOs vencidos exigem ação imediata',
          time: 'Atualizado agora',
          description: `${asoExpired} ASO(s) estão vencidos e precisam de regularização.`,
          type: 'ASO',
          status: 'Crítico',
          icon: Stethoscope,
          iconBg: 'bg-red-100 text-red-600',
        });
      }
      if (asoExpiring30 > 0) {
        nextAlerts.push({
          title: 'ASOs próximos do vencimento',
          time: 'Janela de 30 dias',
          description: `${asoExpiring30} exame(s) vencerão nos próximos 30 dias.`,
          type: 'ASO',
          status: 'Em Andamento',
          icon: CalendarClock,
          iconBg: 'bg-orange-100 text-orange-600',
        });
      }
      if (openIncidents > 0) {
        nextAlerts.push({
          title: 'Incidentes em aberto',
          time: 'Últimos 30 dias',
          description: `${openIncidents} ocorrência(s) ainda sem fechamento.`,
          type: 'Incidente',
          status: 'Em Andamento',
          icon: AlertTriangle,
          iconBg: 'bg-orange-100 text-orange-600',
        });
      }
      if (episExpired > 0) {
        nextAlerts.push({
          title: 'EPIs expirados cadastrados',
          time: 'Atualizado agora',
          description: `${episExpired} registro(s) de EPI já expirados.`,
          type: 'EPI',
          status: 'Crítico',
          icon: AlertTriangle,
          iconBg: 'bg-red-100 text-red-600',
        });
      }
      if (trainingsUpcoming30 > 0) {
        nextAlerts.push({
          title: 'Treinamentos próximos no calendário',
          time: 'Próximos 30 dias',
          description: `${trainingsUpcoming30} treinamento(s) agendados/em andamento.`,
          type: 'Treinamento',
          status: 'Agendado',
          icon: ClipboardCheck,
          iconBg: 'bg-blue-100 text-blue-600',
        });
      }

      if (nextAlerts.length === 0) {
        nextAlerts.push({
          title: 'Sem alertas críticos no momento',
          time: 'Atualizado agora',
          description: 'Indicadores operacionais dentro do esperado para os dados registrados.',
          type: 'Conformidade',
          status: 'Agendado',
          icon: ShieldCheck,
          iconBg: 'bg-green-100 text-green-600',
        });
      }

      setAlerts(nextAlerts.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Visão Geral do Dashboard" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            title="Colaboradores Ativos"
            value={stats.activeCollaborators}
            change={`${stats.signedCollaborators} com assinatura digital`}
            icon={Users}
            iconColor="text-[#1A237E]"
            bgColor="bg-[#1A237E]/10"
            trend="success"
            loading={loading}
            onClick={() => openReport('Relatório Mensal de Segurança')}
          />
          <StatCard
            title="Cobertura de Assinatura"
            value={stats.activeCollaborators > 0 ? `${stats.signatureCoverage}%` : '—'}
            change={stats.signatureCoverage >= 90 ? 'Alto engajamento' : 'Abaixo da meta'}
            icon={UserCheck}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
            trend={stats.signatureCoverage >= 90 ? 'success' : 'warning'}
            loading={loading}
            onClick={() => openReport('Relatório Mensal de Segurança')}
          />
          <StatCard
            title="Conformidade DDS (30d)"
            value={stats.ddsLast30 > 0 ? `${stats.ddsConformity}%` : '—'}
            change={stats.ddsLast30 > 0 ? `${stats.ddsLast30} DDS no período` : 'Sem registros'}
            icon={ClipboardCheck}
            iconColor="text-green-600"
            bgColor="bg-green-50"
            trend={stats.ddsConformity >= 80 ? 'success' : 'warning'}
            loading={loading}
            onClick={() => openReport('Ata de DDS')}
          />
          <StatCard
            title="Pendências de ASO"
            value={stats.asoAlerts}
            change={`${stats.asoExpired} vencidos • ${stats.asoExpiring30} a vencer`}
            icon={Stethoscope}
            iconColor="text-orange-600"
            bgColor="bg-orange-50"
            trend={stats.asoAlerts > 0 ? 'warning' : 'success'}
            loading={loading}
            onClick={() => openReport('Relatório Mensal de Segurança')}
          />
          <StatCard
            title="Estoque Crítico de EPI"
            value={stats.inventoryCritical}
            change={stats.inventoryCritical > 0 ? 'Itens abaixo do mínimo' : 'Sem alertas'}
            icon={Package}
            iconColor="text-red-600"
            bgColor="bg-red-50"
            trend={stats.inventoryCritical > 0 ? 'danger' : 'success'}
            loading={loading}
            onClick={() => openReport('Ficha de EPI (Consolidada)')}
          />
          <StatCard
            title="Incidentes em Aberto"
            value={stats.openIncidents}
            change={`${stats.incidentsLast30} nos últimos 30 dias`}
            icon={AlertTriangle}
            iconColor="text-red-500"
            bgColor="bg-red-50"
            trend={stats.openIncidents > 0 ? 'danger' : 'success'}
            loading={loading}
            onClick={() => openReport('Relatório de Incidentes (CAT)')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Feed de Alertas de Segurança</h3>
              <Link href="/incidentes" className="text-sm font-bold text-[#1A237E] hover:underline flex items-center gap-1">
                Ver Tudo <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.title}
                  title={alert.title}
                  time={alert.time}
                  description={alert.description}
                  type={alert.type}
                  status={alert.status}
                  icon={alert.icon}
                  iconBg={alert.iconBg}
                  onClick={() => openReport(reportByAlertType[alert.type] || 'Relatório Mensal de Segurança')}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions & Side Info */}
          <div className="space-y-6">
            <div className="bg-[#1A237E] rounded-xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 gap-3">
                <Link
                  href="/incidentes"
                  className="w-full bg-white text-[#1A237E] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                >
                  <PlusCircle size={20} />
                  Novo Incidente
                </Link>
                <Link
                  href="/dds"
                  className="w-full bg-[#FF9800] text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                >
                  <FileText size={20} />
                  Registrar DDS
                </Link>
                <Link
                  href="/relatorios"
                  className="w-full bg-white/10 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-colors border border-white/10"
                >
                  <BarChart3 size={20} />
                  Ver Relatórios
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider">Status de Conformidade</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Assinatura Digital</span>
                    <span className="text-[#1A237E]">{loading ? '—' : `${stats.signatureCoverage}%`}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.signatureCoverage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-[#1A237E] h-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Consentimento LGPD</span>
                    <span className="text-[#1A237E]">{loading ? '—' : `${stats.lgpdCoverage}%`}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.lgpdCoverage}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="bg-[#1A237E] h-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">ASOs em Dia</span>
                    <span className="text-[#1A237E]">{loading ? '—' : `${stats.asoOnTime}%`}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.asoOnTime}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                      className="bg-[#1A237E] h-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Incidentes com Evidência (30d)</span>
                    <span className="text-[#1A237E]">{loading ? '—' : `${stats.incidentsEvidenceCoverage}%`}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.incidentsEvidenceCoverage}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                      className="bg-[#1A237E] h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
