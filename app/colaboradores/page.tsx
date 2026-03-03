'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { 
  UserPlus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  X, 
  Check,
  User,
  Mail,
  Briefcase,
  IdCard,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: string;
  registration: string;
  status: 'Ativo' | 'Inativo';
}

const initialCollaborators: Collaborator[] = [
  { id: '1', name: 'Carlos Rocha', email: 'carlos.rocha@jomaga.com', role: 'Técnico de Segurança', registration: 'JS-1023', status: 'Ativo' },
  { id: '2', name: 'Ana Souza', email: 'ana.souza@jomaga.com', role: 'Operadora de Produção', registration: 'JS-2045', status: 'Ativo' },
  { id: '3', name: 'Marcos Lima', email: 'marcos.lima@jomaga.com', role: 'Eletricista', registration: 'JS-3012', status: 'Ativo' },
  { id: '4', name: 'Julia Silva', email: 'julia.silva@jomaga.com', role: 'Engenheira Civil', registration: 'JS-4056', status: 'Inativo' },
];

export default function CollaboratorsPage() {
  const supabase = createClient();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
  const [formData, setFormData] = useState<Omit<Collaborator, 'id'>>({
    name: '',
    email: '',
    role: '',
    registration: '',
    status: 'Ativo'
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error: any) {
      console.error('Error fetching collaborators:', error.message);
      toast.error('Erro ao carregar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const filteredCollaborators = collaborators.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.registration.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (collaborator?: Collaborator) => {
    if (collaborator) {
      setEditingCollaborator(collaborator);
      setFormData({
        name: collaborator.name,
        email: collaborator.email,
        role: collaborator.role,
        registration: collaborator.registration,
        status: collaborator.status
      });
    } else {
      setEditingCollaborator(null);
      setFormData({
        name: '',
        email: '',
        role: '',
        registration: '',
        status: 'Ativo'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCollaborator(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCollaborator) {
        const { error } = await supabase
          .from('collaborators')
          .update({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            registration: formData.registration,
            status: formData.status
          })
          .eq('id', editingCollaborator.id);

        if (error) throw error;
        toast.success('Colaborador atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('collaborators')
          .insert([{
            name: formData.name,
            email: formData.email,
            role: formData.role,
            registration: formData.registration,
            status: formData.status
          }]);

        if (error) throw error;
        toast.success('Colaborador cadastrado com sucesso!');
      }
      fetchCollaborators();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving collaborator:', error.message);
      toast.error('Erro ao salvar colaborador. Verifique se a matrícula já existe.');
    }
  };

  const confirmDelete = (id: string) => {
    setCollaboratorToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (collaboratorToDelete) {
      try {
        const { error } = await supabase
          .from('collaborators')
          .delete()
          .eq('id', collaboratorToDelete);

        if (error) throw error;

        toast.success('Colaborador removido.');
        fetchCollaborators();
        setIsDeleteModalOpen(false);
        setCollaboratorToDelete(null);
      } catch (error: any) {
        console.error('Error deleting collaborator:', error.message);
        toast.error('Erro ao excluir colaborador');
      }
    }
  };

  return (
    <>
      <Header title="Cadastro de Colaboradores" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou matrícula..."
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-sm"
          >
            <UserPlus size={20} />
            Novo Colaborador
          </button>
        </div>

        {/* Collaborators List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Colaborador</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Matrícula</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cargo</th>
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
                        <span className="text-sm">Carregando colaboradores...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode='popLayout'>
                    {filteredCollaborators.map((c) => (
                      <motion.tr 
                        key={c.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">{c.name}</div>
                              <div className="text-xs text-slate-500">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{c.registration}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{c.role}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                            c.status === 'Ativo' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                          )}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenModal(c)}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => confirmDelete(c.id)}
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
                {!loading && filteredCollaborators.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Nenhum colaborador encontrado.
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
                  {editingCollaborator ? 'Editar Colaborador' : 'Novo Colaborador'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <User size={14} /> Nome Completo
                  </label>
                  <input 
                    required
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Mail size={14} /> E-mail
                    </label>
                    <input 
                      required
                      type="email" 
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <IdCard size={14} /> Matrícula
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.registration}
                      onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Briefcase size={14} /> Cargo
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select 
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Ativo' | 'Inativo' })}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
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
                    {editingCollaborator ? 'Salvar Alterações' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Colaborador?</h3>
              <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita. O colaborador será removido permanentemente.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
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
