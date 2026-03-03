'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { HelpCircle, MessageCircle, Book, Phone } from 'lucide-react';

export default function SuportePage() {
  return (
    <>
      <Header title="Suporte e Ajuda" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Chat ao Vivo", desc: "Fale com um especialista agora", icon: MessageCircle, color: "bg-green-100 text-green-600" },
            { title: "Base de Conhecimento", desc: "Tutoriais e documentação", icon: Book, color: "bg-blue-100 text-blue-600" },
            { title: "Central Telefônica", desc: "0800 123 4567", icon: Phone, color: "bg-purple-100 text-purple-600" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mx-auto`}>
                <item.icon size={24} />
              </div>
              <h4 className="font-bold text-slate-800">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#1A237E] p-8 rounded-xl text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Precisa de ajuda urgente?</h3>
            <p className="text-slate-300 text-sm">Nossa equipe de suporte técnico está disponível 24/7 para emergências.</p>
          </div>
          <button className="bg-white text-[#1A237E] px-6 py-2 rounded-lg font-bold hover:bg-slate-100 transition-all">
            Abrir Chamado
          </button>
        </div>
      </div>
    </>
  );
}
