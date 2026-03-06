'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  HardHat,
  GraduationCap,
  ShieldAlert,
  CheckSquare,
  BarChart3,
  Settings,
  HelpCircle,
  UserCheck,
  MoreHorizontal,
  X,
  LogOut,
  Stethoscope,
  Package,
  TableProperties,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: UserCheck, label: 'Colaboradores', href: '/colaboradores' },
  { icon: HardHat, label: 'Gestão de EPIs', href: '/epis', sub: [
    { label: 'Fichas de EPI', href: '/epis' },
    { label: 'Inventário', href: '/epis/inventario' },
  ]},
  { icon: GraduationCap, label: 'Treinamentos', href: '/treinamentos', sub: [
    { label: 'Lista de Treinamentos', href: '/treinamentos' },
    { label: 'Matriz de Treinamento', href: '/treinamentos/matriz' },
  ]},
  { icon: ShieldAlert, label: 'Gestão de Risco', href: '/incidentes' },
  { icon: CheckSquare, label: 'Conformidade DDS', href: '/dds' },
  { icon: Stethoscope, label: 'Gestão de ASO', href: '/aso' },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
];

const footerItems = [
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  { icon: HelpCircle, label: 'Suporte', href: '/suporte' },
];

const bottomNavItems = [
  { icon: LayoutDashboard, label: 'Início', href: '/' },
  { icon: HardHat, label: 'EPIs', href: '/epis' },
  { icon: ShieldAlert, label: 'Risco', href: '/incidentes' },
  { icon: CheckSquare, label: 'DDS', href: '/dds' },
];

const moreSheetItems = [
  { icon: UserCheck, label: 'Colaboradores', href: '/colaboradores' },
  { icon: GraduationCap, label: 'Treinamentos', href: '/treinamentos' },
  { icon: TableProperties, label: 'Matriz', href: '/treinamentos/matriz' },
  { icon: Package, label: 'Inventário', href: '/epis/inventario' },
  { icon: Stethoscope, label: 'ASO', href: '/aso' },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  { icon: HelpCircle, label: 'Suporte', href: '/suporte' },
];

function DesktopMenuItem({ item, pathname }: { item: typeof menuItems[0]; pathname: string }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = pathname === item.href || (item.sub && item.sub.some(s => pathname === s.href));

  if (item.sub) {
    return (
      <div>
        <button
          onClick={() => setExpanded(v => !v)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group mb-1',
            isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
          )}
        >
          <item.icon size={20} className={cn(isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
          <span className={cn('text-sm flex-1 text-left', isActive ? 'font-semibold' : 'font-medium')}>{item.label}</span>
          <svg className={cn("w-3 h-3 transition-transform", expanded ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {expanded && (
          <div className="ml-8 mb-1 space-y-0.5">
            {item.sub.map(s => (
              <Link key={s.href} href={s.href}>
                <div className={cn(
                  'text-xs px-3 py-2 rounded-lg transition-all cursor-pointer',
                  pathname === s.href ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}>
                  {s.label}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.href}>
      <div className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group mb-1',
        isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
      )}>
        <item.icon size={20} className={cn(isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
        <span className={cn('text-sm', isActive ? 'font-semibold' : 'font-medium')}>{item.label}</span>
      </div>
    </Link>
  );
}

const DesktopSidebarContent = ({ pathname, companyName, companyLogo }: { pathname: string; companyName: string; companyLogo: string }) => (
  <div className="flex flex-col h-full bg-[#1A237E] text-white">
    <div className="p-6 flex items-center gap-3">
      <img
        src={companyLogo || '/icon'}
        alt="Logo da empresa"
        className="w-[38px] h-[38px] object-contain"
      />
      <div>
        <h1 className="text-lg font-bold leading-tight tracking-tight">{companyName}</h1>
        <p className="text-xs text-slate-300 font-medium">Sistema SafeWork</p>
      </div>
    </div>

    <nav className="flex-1 px-4 py-4 space-y-0.5 overflow-y-auto">
      {menuItems.map((item) => (
        <DesktopMenuItem key={item.href} item={item} pathname={pathname} />
      ))}
    </nav>

    <div className="px-4 py-6 border-t border-white/10 space-y-1">
      {footerItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <div className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group',
            pathname === item.href ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
          )}>
            <item.icon size={20} className="text-slate-400 group-hover:text-white" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [showMore, setShowMore] = useState(false);
  const [companyName, setCompanyName] = useState('Jomaga');
  const [companyLogo, setCompanyLogo] = useState('/icon');

  useEffect(() => {
    const loadCompanyName = () => {
      const saved = localStorage.getItem('jomaga_company_settings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          if (settings.companyName) setCompanyName(settings.companyName);
          if (settings.companyLogo) setCompanyLogo(settings.companyLogo);
        } catch {}
      }
    };
    loadCompanyName();
    window.addEventListener('company-settings-updated', loadCompanyName);
    return () => window.removeEventListener('company-settings-updated', loadCompanyName);
  }, []);

  const handleLogout = async () => {
    setShowMore(false);
    await supabase.auth.signOut();
    router.push('/login');
    toast.success('Sessão encerrada com sucesso.');
  };

  const isMoreActive = moreSheetItems.some((item) => pathname === item.href);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0">
        <DesktopSidebarContent pathname={pathname} companyName={companyName} companyLogo={companyLogo} />
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_16px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-16">
          {bottomNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 relative"
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#1A237E] rounded-b-full" />
                )}
                <item.icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={cn('transition-colors', active ? 'text-[#1A237E]' : 'text-slate-400')}
                />
                <span className={cn(
                  'text-[10px] font-semibold leading-none',
                  active ? 'text-[#1A237E]' : 'text-slate-400'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Mais button */}
          <button
            onClick={() => setShowMore(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0 relative"
          >
            {isMoreActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#1A237E] rounded-b-full" />
            )}
            <MoreHorizontal
              size={22}
              strokeWidth={isMoreActive ? 2.5 : 1.8}
              className={cn('transition-colors', isMoreActive ? 'text-[#1A237E]' : 'text-slate-400')}
            />
            <span className={cn(
              'text-[10px] font-semibold leading-none',
              isMoreActive ? 'text-[#1A237E]' : 'text-slate-400'
            )}>
              Mais
            </span>
          </button>
        </div>
      </nav>

      {/* "Mais" Bottom Sheet */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMore(false)}
              className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl lg:hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img
                    src={companyLogo || '/icon'}
                    alt="Logo da empresa"
                    className="w-6 h-6 object-contain"
                  />
                  <span className="font-bold text-slate-800">{companyName}</span>
                </div>
                <button
                  onClick={() => setShowMore(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <div className="p-4 grid grid-cols-4 gap-3">
                {moreSheetItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        'flex flex-col items-center gap-2 py-3 px-1 rounded-xl transition-colors',
                        active ? 'bg-[#1A237E]/10' : 'bg-slate-50 active:bg-slate-100'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        active ? 'bg-[#1A237E]' : 'bg-white border border-slate-200 shadow-sm'
                      )}>
                        <item.icon size={20} className={active ? 'text-white' : 'text-slate-600'} />
                      </div>
                      <span className={cn(
                        'text-[10px] font-semibold text-center leading-tight',
                        active ? 'text-[#1A237E]' : 'text-slate-700'
                      )}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="px-4 pb-5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-bold text-sm transition-colors active:bg-red-100"
                >
                  <LogOut size={18} />
                  Sair do sistema
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
