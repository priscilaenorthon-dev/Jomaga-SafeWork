'use client';

import React, { useEffect, useState } from 'react';
import { User, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'admin@jomaga.com.br';
const DEFAULT_COMPANY_LOGO = '/logo-modelos/safework-02-capacete-check.svg';

function normalizeLogoUrl(value?: string) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw || raw === '/icon' || raw === '/icon-192.png' || raw === '/icon-512.png' || raw === '/logo-sistema.png') return DEFAULT_COMPANY_LOGO;

  if (
    raw.startsWith('/') ||
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:image/') ||
    raw.startsWith('blob:')
  ) {
    return raw;
  }

  return DEFAULT_COMPANY_LOGO;
}

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState('SafeWork');
  const [companyLogo, setCompanyLogo] = useState(DEFAULT_COMPANY_LOGO);

  useEffect(() => {
    const loadCompanyName = () => {
      try {
        const saved = localStorage.getItem('jomaga_company_settings');
        if (!saved) {
          setCompanyName('SafeWork');
          setCompanyLogo(DEFAULT_COMPANY_LOGO);
          return;
        }

        const parsed = JSON.parse(saved);
        const configuredName = typeof parsed?.companyName === 'string' ? parsed.companyName.trim() : '';
        const configuredLogo = normalizeLogoUrl(parsed?.companyLogo);
        setCompanyName(configuredName || 'SafeWork');
        setCompanyLogo(configuredLogo);
      } catch {
        setCompanyName('SafeWork');
        setCompanyLogo(DEFAULT_COMPANY_LOGO);
      }
    };

    loadCompanyName();
    window.addEventListener('company-settings-updated', loadCompanyName);

    return () => {
      window.removeEventListener('company-settings-updated', loadCompanyName);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      toast.error('Preencha usuário e senha.');
      return;
    }

    if (username.trim().toLowerCase() !== 'admin') {
      toast.error('Usuário ou senha inválidos.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });

      if (error) {
        toast.error('Usuário ou senha inválidos.');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      toast.error('Erro ao realizar login. Tente novamente.');
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
              <img
                src={companyLogo || DEFAULT_COMPANY_LOGO}
                alt="Logo da empresa"
                className="w-14 h-14 object-contain"
                onError={(event) => {
                  const target = event.currentTarget;
                  if (target.src.includes(DEFAULT_COMPANY_LOGO)) return;
                  setCompanyLogo(DEFAULT_COMPANY_LOGO);
                }}
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{companyName}</h1>
            <p className="text-white/70 text-sm mt-1">Sistema de Gestão de Segurança</p>
          </div>

          {/* Body */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Entrar na plataforma</h2>
            <p className="text-sm text-slate-500 mb-6">
              Informe suas credenciais de acesso.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Usuário */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Usuário</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20 focus:border-[#1A237E] transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20 focus:border-[#1A237E] transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A237E] text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1A237E]/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} {companyName}. Todos os direitos reservados.
        </p>
        <p className="text-center text-white/30 text-[10px] mt-1.5">
          Desenvolvido por <span className="text-white/50 font-semibold">Northon</span>
        </p>
      </motion.div>
    </div>
  );
}
