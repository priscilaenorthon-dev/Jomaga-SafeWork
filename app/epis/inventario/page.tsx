'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Loader2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import { executeMutationWithOfflineQueue } from '@/lib/offline-queue';

interface InventoryItem {
  id: string;
  epi_name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  notes?: string;
}

export default function EPIInventarioPage() {
  const supabase = createClient();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ epi_name: '', current_stock: 0, minimum_stock: 5, unit: 'unidade', notes: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('epi_inventory').select('*').order('epi_name');
      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar inventário');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(i => i.epi_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalItems = items.length;
  const totalAlerts = items.filter(i => i.current_stock < i.minimum_stock).length;
  const totalOk = items.filter(i => i.current_stock >= i.minimum_stock).length;

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ epi_name: item.epi_name, current_stock: item.current_stock, minimum_stock: item.minimum_stock, unit: item.unit, notes: item.notes || '' });
    } else {
      setEditingItem(null);
      setFormData({ epi_name: '', current_stock: 0, minimum_stock: 5, unit: 'unidade', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { epi_name: formData.epi_name.trim(), current_stock: formData.current_stock, minimum_stock: formData.minimum_stock, unit: formData.unit, notes: formData.notes || null };
      if (editingItem) {
        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'epi_inventory',
            action: 'update',
            payload,
            match: { column: 'id', value: editingItem.id },
          },
        });

        if (result.status === 'error') throw result.error;
        toast.success(
          result.status === 'queued'
            ? 'Sem conexão: atualização do inventário enfileirada para sincronizar depois.'
            : 'Item atualizado!'
        );

        if (result.status === 'synced') {
          fetchItems();
        }
      } else {
        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'epi_inventory',
            action: 'insert',
            payload: [payload],
          },
        });

        if (result.status === 'error') throw result.error;
        toast.success(
          result.status === 'queued'
            ? 'Sem conexão: cadastro no inventário enfileirado para sincronizar depois.'
            : 'Item adicionado ao inventário!'
        );

        if (result.status === 'synced') {
          fetchItems();
        }
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      toast.error('Erro ao salvar item');
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const result = await executeMutationWithOfflineQueue({
        supabase,
        operation: {
          table: 'epi_inventory',
          action: 'delete',
          match: { column: 'id', value: confirmDeleteId },
        },
      });

      if (result.status === 'error') throw result.error;

      toast.success(
        result.status === 'queued'
          ? 'Sem conexão: exclusão do inventário enfileirada para sincronizar depois.'
          : 'Item removido.'
      );

      setConfirmDeleteId(null);
      setItems(prev => prev.filter(item => item.id !== confirmDeleteId));
      if (result.status === 'synced') {
        fetchItems();
      }
    } catch { toast.error('Erro ao excluir item'); }
  };

  return (
    <>
      <Header title="Inventário de EPIs" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        {/* Sub-menu tabs */}
        <div className="flex items-center gap-2">
          <Link href="/epis">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all">
              <FileText size={16} /> Fichas de EPI
            </button>
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm">
            <Package size={16} /> Inventário
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Tipos de EPI', value: totalItems.toString(), icon: Package, color: 'text-primary' },
            { label: 'Estoque OK', value: totalOk.toString(), icon: CheckCircle2, color: 'text-green-600' },
            { label: 'Abaixo do Mínimo', value: totalAlerts.toString(), icon: AlertTriangle, color: 'text-red-600' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn("bg-white p-6 rounded-xl border shadow-sm", stat.color === 'text-red-600' && totalAlerts > 0 ? "border-red-200 bg-red-50" : "border-slate-200")}
            >
              <div className="flex items-center gap-3 mb-2">
                <stat.icon size={18} className={stat.color} />
                <span className="text-xs font-bold text-slate-500 uppercase">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{loading ? '—' : stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Alert banner */}
        {!loading && totalAlerts > 0 && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertTriangle size={20} className="shrink-0" />
            <p className="text-sm font-medium">
              <strong>{totalAlerts} {totalAlerts === 1 ? 'item' : 'itens'}</strong> {totalAlerts === 1 ? 'está' : 'estão'} abaixo do estoque mínimo. Faça o reabastecimento.
            </p>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar item do inventário..."
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
            Novo Item
          </button>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">EPI</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Unidade</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estoque Atual</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Mínimo</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">Carregando inventário...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                      const isLow = item.current_stock < item.minimum_stock;
                      return (
                        <motion.tr
                          key={item.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={cn("hover:bg-slate-50 transition-colors", isLow && "bg-red-50/50")}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {isLow && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                              <span className="text-sm font-medium text-slate-800">{item.epi_name}</span>
                            </div>
                            {item.notes && <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{item.unit}</td>
                          <td className="px-6 py-4">
                            <span className={cn("text-lg font-bold", isLow ? "text-red-600" : "text-slate-800")}>
                              {item.current_stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{item.minimum_stock}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                              isLow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                            )}>
                              {isLow ? 'Alerta' : 'OK'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => setConfirmDeleteId(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
                {!loading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Nenhum item no inventário.
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">{editingItem ? 'Editar Item' : 'Novo Item de Inventário'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome do EPI</label>
                  <input required type="text" placeholder="Ex: Capacete de Segurança" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.epi_name} onChange={e => setFormData({ ...formData, epi_name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Unidade</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                    <option value="unidade">Unidade</option>
                    <option value="par">Par</option>
                    <option value="caixa">Caixa</option>
                    <option value="rolo">Rolo</option>
                    <option value="kit">Kit</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Estoque Atual</label>
                    <input required type="number" min="0" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.current_stock} onChange={e => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Estoque Mínimo</label>
                    <input required type="number" min="0" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.minimum_stock} onChange={e => setFormData({ ...formData, minimum_stock: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                {formData.current_stock < formData.minimum_stock && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
                    <AlertTriangle size={14} />
                    Estoque atual está abaixo do mínimo — será marcado como alerta
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Observações (opcional)</label>
                  <input type="text" placeholder="Ex: Validade, fornecedor..." className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 px-6 py-2.5 bg-[#1A237E] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"><Check size={20} />{editingItem ? 'Salvar' : 'Adicionar'}</button>
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
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Item?</h3>
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
