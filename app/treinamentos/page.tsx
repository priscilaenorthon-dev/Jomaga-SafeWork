'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  Calendar,
  User,
  BookOpen,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { createClient } from '@/lib/supabase-client';

interface Training {
  id: string;
  title: string;
  instructor: string;
  date: string;
  duration: string;
  status: 'Concluído' | 'Agendado' | 'Em Andamento';
  participants: number;
}

export default function TreinamentosPage() {
  const supabase = createClient();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [formData, setFormData] = useState<Omit<Training, 'id'>>({
    title: '',
    instructor: '',
    date: '',
    duration: '',
    status: 'Agendado',
    participants: 0
  });

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTrainings(data || []);
    } catch (error: any) {
      console.error('Error fetching trainings:', error.message);
      toast.error('Erro ao carregar treinamentos');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainings = trainings.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (training?: Training) => {
    if (training) {
      setEditingTraining(training);
      setFormData({
        title: training.title,
        instructor: training.instructor,
        date: training.date,
        duration: training.duration,
        status: training.status,
        participants: training.participants
      });
    } else {
      setEditingTraining(null);
      setFormData({
        title: '',
        instructor: '',
        date: '',
        duration: '',
        status: 'Agendado',
        participants: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTraining(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTraining) {
        const { error } = await supabase
          .from('trainings')
          .update({
            title: formData.title,
            instructor: formData.instructor,
            date: formData.date,
            duration: formData.duration,
            status: formData.status,
            participants: formData.participants
          })
          .eq('id', editingTraining.id);

        if (error) throw error;
        toast.success('Treinamento atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('trainings')
          .insert([{
            title: formData.title,
            instructor: formData.instructor,
            date: formData.date,
            duration: formData.duration,
            status: formData.status,
            participants: formData.participants
          }]);

        if (error) throw error;
        toast.success('Treinamento agendado com sucesso!');
      }
      fetchTrainings();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving training:', error.message);
      toast.error('Erro ao salvar treinamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este treinamento?')) {
      try {
        const { error } = await supabase
          .from('trainings')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Treinamento removido.');
        fetchTrainings();
      } catch (error: any) {
        console.error('Error deleting training:', error.message);
        toast.error('Erro ao excluir treinamento');
      }
    }
  };

  return (
    <>
      <Header title="Gestão de Treinamentos" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Treinamentos Ativos", value: trainings.filter(t => t.status !== 'Concluído').length.toString(), icon: GraduationCap, color: "text-blue-600" },
            { label: "Total Concluído", value: trainings.filter(t => t.status === 'Concluído').length.toString(), icon: CheckCircle, color: "text-green-600" },
            { label: "Participantes", value: trainings.reduce((acc, t) => acc + t.participants, 0).toString(), icon: Users, color: "text-purple-600" },
            { label: "Carga Horária Total", value: "1.240h", icon: Clock, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon size={18} className={stat.color} />
                <span className="text-xs font-bold text-slate-500 uppercase">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por título ou instrutor..."
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
            Novo Treinamento
          </button>
        </div>

        {/* Training List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Treinamento</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Instrutor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando treinamentos...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode='popLayout'>
                    {filteredTrainings.map((t) => (
                      <motion.tr 
                        key={t.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">{t.title}</div>
                          <div className="text-xs text-slate-500">{t.duration} de carga horária</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{t.instructor}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                            t.status === 'Concluído' ? "bg-green-100 text-green-700" : 
                            t.status === 'Em Andamento' ? "bg-blue-100 text-blue-700" : 
                            "bg-orange-100 text-orange-700"
                          )}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenModal(t)}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(t.id)}
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
                {!loading && filteredTrainings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Nenhum treinamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingTraining ? 'Editar Treinamento' : 'Novo Treinamento'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <BookOpen size={14} /> Título do Treinamento
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: NR-35 Trabalho em Altura"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <User size={14} /> Instrutor
                  </label>
                  <input 
                    required
                    type="text" 
                    placeholder="Nome do instrutor"
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Calendar size={14} /> Data
                    </label>
                    <input 
                      required
                      type="date" 
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Clock size={14} /> Carga Horária
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ex: 8h"
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select 
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="Agendado">Agendado</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Users size={14} /> Participantes
                    </label>
                    <input 
                      required
                      type="number" 
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.participants}
                      onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    {editingTraining ? 'Salvar Alterações' : 'Agendar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
