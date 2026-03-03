'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { 
  CheckSquare, 
  Calendar, 
  Users, 
  FileCheck, 
  Play, 
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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GoogleGenAI } from "@google/genai";

// Tipagem para um registro de DDS
interface DDSRecord {
  id: string;
  date: string;
  theme: string;
  content: string;
  technician: string;
  participants: string[];
  duration: string;
}

export default function DDSPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'new' | 'ai'>('history');
  const [records, setRecords] = useState<DDSRecord[]>([
    {
      id: '1',
      date: '2024-03-01',
      theme: 'Segurança em Altura (NR-35)',
      content: 'Abordamos os principais riscos de queda, uso correto do cinturão e pontos de ancoragem.',
      technician: 'Roberto Silva',
      participants: ['Carlos Rocha', 'Ana Souza', 'Marcos Lima'],
      duration: '15 min'
    },
    {
      id: '2',
      date: '2024-02-28',
      theme: 'Uso de EPIs e EPCs',
      content: 'Reforço sobre a importância da higienização e guarda correta dos equipamentos.',
      technician: 'Roberto Silva',
      participants: ['Julia Silva', 'Roberto Alves', 'Fernanda Costa'],
      duration: '10 min'
    }
  ]);

  // Estados para o formulário de novo registro
  const [newTheme, setNewTheme] = useState('');
  const [newContent, setNewContent] = useState('');
  const [technicianName, setTechnicianName] = useState('Roberto Silva');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  // Estados para a IA
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const collaborators = [
    "Carlos Rocha", "Ana Souza", "Marcos Lima", "Julia Silva", "Roberto Alves", "Fernanda Costa",
    "Paulo Santos", "Lucia Oliveira", "Ricardo Mendes", "Beatriz Lima"
  ];

  const toggleParticipant = (name: string) => {
    setSelectedParticipants(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleSaveDDS = () => {
    if (!newTheme || !newContent || selectedParticipants.length === 0) {
      toast.error("Por favor, preencha todos os campos e selecione ao menos um participante.");
      return;
    }

    const newRecord: DDSRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      theme: newTheme,
      content: newContent,
      technician: technicianName,
      participants: selectedParticipants,
      duration: '15 min' // Simulação
    };

    setRecords([newRecord, ...records]);
    toast.success("DDS registrado com sucesso!");
    setNewTheme('');
    setNewContent('');
    setSelectedParticipants([]);
    setActiveTab('history');
  };

  const generateWithAI = async () => {
    if (!aiPrompt) {
      toast.error("Digite um tema ou palavra-chave para a IA.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Você é um especialista em Segurança do Trabalho. Elabore um texto curto e direto para um Diálogo Diário de Segurança (DDS) sobre o tema: "${aiPrompt}". O texto deve ser educativo, focado em prevenção e ter no máximo 3 parágrafos.`,
      });

      const text = response.text || "Não foi possível gerar o conteúdo.";
      setGeneratedContent(text);
      setNewTheme(aiPrompt);
      setNewContent(text);
      toast.success("Conteúdo gerado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar conteúdo com IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    toast.success("Registro removido.");
  };

  return (
    <>
      <Header title="Gestão de DDS" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        
        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2",
              activeTab === 'history' ? "border-[#1A237E] text-[#1A237E]" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <History size={18} />
            Histórico e Rastreabilidade
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={cn(
              "px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2",
              activeTab === 'new' ? "border-[#1A237E] text-[#1A237E]" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <Plus size={18} />
            Novo Registro
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={cn(
              "px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2",
              activeTab === 'ai' ? "border-[#1A237E] text-[#1A237E]" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <Sparkles size={18} />
            Elaborar com IA
          </button>
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
                      placeholder="Buscar tema ou data..." 
                      className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20"
                    />
                  </div>
                </div>

                {records.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <History size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">Nenhum registro encontrado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {records.map((record) => (
                      <div key={record.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-[#1A237E]/30 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-[#1A237E]/10 group-hover:text-[#1A237E] transition-colors">
                              <FileText size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                                  {record.date}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                                  {record.duration}
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
                                {record.participants.slice(0, 3).map((p, i) => (
                                  <div key={i} className="w-7 h-7 rounded-full bg-[#1A237E] text-white flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                    {p.charAt(0)}
                                  </div>
                                ))}
                                {record.participants.length > 3 && (
                                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                                    +{record.participants.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-slate-400 hover:text-[#1A237E] hover:bg-slate-50 rounded-lg transition-all">
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => deleteRecord(record.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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

                  <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                    {collaborators.map((name) => (
                      <button
                        key={name}
                        onClick={() => toggleParticipant(name)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                          selectedParticipants.includes(name) 
                            ? "bg-green-50 border-green-200 text-green-800" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                            selectedParticipants.includes(name) ? "bg-green-200" : "bg-slate-100"
                          )}>
                            {name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium">{name}</span>
                        </div>
                        {selectedParticipants.includes(name) && <UserCheck size={18} className="text-green-600" />}
                      </button>
                    ))}
                  </div>
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

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
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
                              toast.success("Conteúdo copiado para o formulário!");
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
                    "NR-35: Trabalho em Altura",
                    "Ergonomia no Escritório",
                    "Prevenção de Incêndios"
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
    </>
  );
}
