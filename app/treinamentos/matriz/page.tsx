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
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';

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

export default function MatrizTreinamentosPage() {
  const supabase = createClient();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'base' | 'cliente'>('base');
  const [filterContract, setFilterContract] = useState<'' | 'onshore' | 'offshore'>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ data: trainData }, { data: collabData }] = await Promise.all([
        supabase.from('trainings').select('id, title, status, date, location_type, training_category, participant_ids').order('title'),
        supabase.from('collaborators').select('id, name, role, contract_type').eq('status', 'Ativo').order('name'),
      ]);
      setTrainings(trainData || []);
      setCollaborators(collabData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const categoryTrainings = trainings.filter(t => t.training_category === activeCategory);

  const filteredCollaborators = filterContract
    ? collaborators.filter(c => c.contract_type === filterContract)
    : collaborators;

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

  return (
    <>
      <Header title="Matriz de Treinamento" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Sub-menu */}
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveCategory('base')}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all", activeCategory === 'base' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <Building size={16} /> Base
            </button>
            <button
              onClick={() => setActiveCategory('cliente')}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all", activeCategory === 'cliente' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <UserCog size={16} /> Cliente
            </button>
          </div>

          {/* Contract filter */}
          <div className="flex items-center gap-2 ml-auto">
            <Filter size={16} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Filtrar:</span>
            {(['', 'onshore', 'offshore'] as const).map(val => (
              <button
                key={val || 'all'}
                onClick={() => setFilterContract(val)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all",
                  filterContract === val ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                {val === 'offshore' ? <><Anchor size={12} />Offshore</> : val === 'onshore' ? <><Globe size={12} />Onshore</> : 'Todos'}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /><span>Concluído</span></div>
          <div className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /><span>Em Andamento</span></div>
          <div className="flex items-center gap-1.5"><XCircle size={14} className="text-slate-300" /><span>Não Iniciado</span></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="animate-spin" size={32} />
              <span>Carregando matriz...</span>
            </div>
          </div>
        ) : categoryTrainings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <TableProperties size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Nenhum treinamento de {activeCategory === 'base' ? 'Base' : 'Cliente'} cadastrado.</p>
            <p className="text-sm mt-1">Crie treinamentos e selecione a categoria correspondente.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="sticky left-0 bg-slate-50 px-6 py-4 text-xs font-bold text-slate-500 uppercase text-left whitespace-nowrap border-r border-slate-200 min-w-[180px]">
                      Colaborador
                    </th>
                    {categoryTrainings.map(t => (
                      <th key={t.id} className="px-4 py-4 text-xs font-bold text-slate-500 uppercase text-center min-w-[140px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="leading-tight">{t.title}</span>
                          <div className="flex items-center gap-1">
                            {t.location_type === 'offshore' ? <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-bold flex items-center gap-0.5"><Anchor size={9} />Offshore</span> : t.location_type === 'onshore' ? <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-[9px] font-bold flex items-center gap-0.5"><Globe size={9} />Onshore</span> : <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">Ambos</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">{completionRate(t)}% concluído</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCollaborators.length === 0 ? (
                    <tr><td colSpan={categoryTrainings.length + 1} className="px-6 py-8 text-center text-slate-500">Nenhum colaborador encontrado com o filtro selecionado.</td></tr>
                  ) : filteredCollaborators.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="sticky left-0 bg-white hover:bg-slate-50 px-6 py-3.5 border-r border-slate-200 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-sm">{c.name}</div>
                            <div className="flex items-center gap-1">
                              {c.contract_type === 'offshore'
                                ? <span className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5"><Anchor size={9} />Offshore</span>
                                : <span className="text-[10px] text-orange-600 font-medium flex items-center gap-0.5"><Globe size={9} />Onshore</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      {categoryTrainings.map(t => {
                        const status = getStatus(c.id, t);
                        return (
                          <td key={t.id} className="px-4 py-3.5 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {statusIcon(status)}
                              <span className={cn("text-[10px] font-medium", status === 'Concluído' ? "text-green-600" : status === 'Em Andamento' ? "text-blue-600" : "text-slate-400")}>
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
    </>
  );
}
