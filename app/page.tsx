'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  HardHat, 
  AlertTriangle, 
  BarChart3, 
  TrendingUp,
  XCircle,
  Stethoscope,
  ClipboardCheck,
  Thermometer,
  Droplets,
  UserCheck,
  PlusCircle,
  FileText,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

const StatCard = ({ title, value, change, icon: Icon, iconColor, bgColor, trend }: { 
  title: string, 
  value: string, 
  change: string, 
  icon: any, 
  iconColor: string, 
  bgColor: string,
  trend?: 'up' | 'down' | 'warning' | 'danger' | 'success'
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
  >
    <div className="flex justify-between items-start">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <div className={cn("p-1.5 rounded-lg", bgColor)}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
    <div className="mt-4">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{value}</h3>
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

const AlertItem = ({ title, time, description, type, status, icon: Icon, iconBg }: {
  title: string,
  time: string,
  description: string,
  type: string,
  status: string,
  icon: any,
  iconBg: string
}) => (
  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/20 transition-colors">
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
  const handleAction = (action: string) => {
    toast.success(`${action} iniciado com sucesso!`);
  };

  return (
    <>
      <Header title="Visão Geral do Dashboard" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            title="EPIs Ativos" 
            value="4" 
            change="Em uso" 
            icon={HardHat} 
            iconColor="text-[#1A237E]" 
            bgColor="bg-[#1A237E]/10" 
            trend="success" 
          />
          <StatCard 
            title="Próximos ao Vencimento" 
            value="1" 
            change="Atenção" 
            icon={AlertTriangle} 
            iconColor="text-[#FF9800]" 
            bgColor="bg-[#FF9800]/10" 
            trend="warning" 
          />
          <StatCard 
            title="Treinamentos Ativos" 
            value="3" 
            change="Agendados" 
            icon={ClipboardCheck} 
            iconColor="text-blue-500" 
            bgColor="bg-blue-50" 
            trend="up" 
          />
          <StatCard 
            title="Incidentes Reportados" 
            value="3" 
            change="Últimos 30 dias" 
            icon={AlertTriangle} 
            iconColor="text-red-500" 
            bgColor="bg-red-50" 
            trend="danger" 
          />
          <StatCard 
            title="Conformidade DDS" 
            value="98%" 
            change="Na Meta" 
            icon={UserCheck} 
            iconColor="text-green-500" 
            bgColor="bg-green-50" 
            trend="success" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Feed de Alertas de Segurança</h3>
              <button className="text-sm font-bold text-[#1A237E] hover:underline flex items-center gap-1">
                Ver Tudo <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <AlertItem 
                title="Aviso de Alta Temperatura"
                time="10 min atrás"
                description="Almoxarifado A - Zona 4 reportou temperaturas acima do limite de segurança (38°C)."
                type="Alerta"
                status="Crítico"
                icon={Thermometer}
                iconBg="bg-orange-100 text-orange-600"
              />
              <AlertItem 
                title="Vazamento Químico Reportado"
                time="2 horas atrás"
                description="Setor B3 - Doca de Carga reportou pequeno derramamento de líquido. Equipe de limpeza enviada."
                type="Incidente"
                status="Em Andamento"
                icon={Droplets}
                iconBg="bg-red-100 text-red-600"
              />
              <AlertItem 
                title="Inspeção de EPI Pendente"
                time="4 horas atrás"
                description="Equipe Alpha Manutenção necessita de inspeção mensal de cintos antes do início do turno."
                type="Manutenção"
                status="Agendado"
                icon={UserCheck}
                iconBg="bg-blue-100 text-blue-600"
              />
            </div>
          </div>

          {/* Quick Actions & Side Info */}
          <div className="space-y-6">
            <div className="bg-[#1A237E] rounded-xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleAction('Novo Incidente')}
                  className="w-full bg-white text-[#1A237E] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                >
                  <PlusCircle size={20} />
                  Novo Incidente
                </button>
                <button 
                  onClick={() => handleAction('Registro de DDS')}
                  className="w-full bg-[#FF9800] text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                >
                  <FileText size={20} />
                  Registrar DDS
                </button>
                <button 
                  onClick={() => handleAction('Criação de Relatório')}
                  className="w-full bg-white/10 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-colors border border-white/10"
                >
                  <BarChart3 size={20} />
                  Criar Relatório
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider">Status de Conformidade</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Segurança Contra Incêndio</span>
                    <span className="text-[#1A237E]">100%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-green-500 h-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Resíduos Perigosos</span>
                    <span className="text-[#1A237E]">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "85%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="bg-[#1A237E] h-full"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">NR-10 Elétrica</span>
                    <span className="text-[#1A237E]">92%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
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
