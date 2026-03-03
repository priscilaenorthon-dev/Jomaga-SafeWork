'use client';

import React, { useState } from 'react';
import { Shield, Mail, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      toast.error('Digite um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro ao enviar o link de acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1757] via-[#1A237E] to-[#283593] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FF9800]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1A237E] to-[#3949AB] p-8 text-white text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-[#FF9800] rounded-xl p-3">
                <Shield size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Jomaga SafeWork</h1>
            <p className="text-white/70 text-sm mt-1">Sistema de Gestão de Segurança</p>
          </div>

          {/* Body */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {!sent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Entrar na plataforma</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Informe seu e-mail para receber um link de acesso seguro.
                  </p>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">E-mail corporativo</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20 focus:border-[#1A237E] transition-all text-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#1A237E] text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1A237E]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Link de Acesso
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-xs text-slate-400 text-center mt-6">
                    Você receberá um link mágico no e-mail. Não é necessário senha.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Verifique seu e-mail</h2>
                  <p className="text-slate-500 text-sm mb-2">
                    Enviamos um link de acesso para:
                  </p>
                  <p className="font-bold text-[#1A237E] text-sm mb-6">{email}</p>
                  <p className="text-xs text-slate-400">
                    Clique no link do e-mail para entrar na plataforma. O link expira em 1 hora.
                  </p>
                  <button
                    onClick={() => { setSent(false); setEmail(''); }}
                    className="mt-6 text-sm text-slate-500 hover:text-[#1A237E] font-medium underline"
                  >
                    Usar outro e-mail
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} Jomaga SafeWork. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
}
