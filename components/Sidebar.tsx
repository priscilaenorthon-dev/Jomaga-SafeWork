'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  HardHat,
  GraduationCap,
  AlertTriangle,
  CheckSquare,
  BarChart3,
  Settings,
  HelpCircle,
  UserCheck,
  MoreHorizontal,
  X,
  LogOut,
} from 'lucide-react';
import { JomagaLogo } from '@/components/JomagaLogo';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: UserCheck, label: 'Colaboradores', href: '/colaboradores' },
  { icon: HardHat, label: 'Gestão de EPIs', href: '/epis' },
  { icon: GraduationCap, label: 'Treinamentos', href: '/treinamentos' },
  { icon: AlertTriangle, label: 'Incidentes', href: '/incidentes' },
  { icon: CheckSquare, label: 'Conformidade DDS', href: '/dds' },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
];

const footerItems = [
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  { icon: HelpCircle, label: 'Suporte', href: '/suporte' },
];

// 4 main items always visible in the bottom nav
const bottomNavItems = [
  { icon: LayoutDashboard, label: 'Início', href: '/' },
  { icon: HardHat, label: 'EPIs', href: '/epis' },
  { icon: AlertTriangle, label: 'Incidentes', href: '/incidentes' },
  { icon: CheckSquare, label: 'DDS', href: '/dds' },
];

// Remaining items shown in the "Mais" bottom sheet
const moreSheetItems = [
  { icon: UserCheck, label: 'Colaboradores', href: '/colaboradores' },
  { icon: GraduationCap, label: 'Treinamentos', href: '/treinamentos' },
  { icon: BarChart3, label: 'Relatórios', href: '/relatorios' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
  { icon: HelpCircle, label: 'Suporte', href: '/suporte' },
];

const DesktopSidebarContent = ({ pathname }: { pathname: string }) => (
  <div className="flex flex-col h-full bg-[#1A237E] text-white">
    <div className="p-6 flex items-center gap-3">
      <JomagaLogo size={38} />
      <div>
        <h1 className="text-lg font-bold leading-tight tracking-tight">Jomaga</h1>
        <p className="text-xs text-slate-300 font-medium">Sistema SafeWork</p>
      </div>
    </div>

    <nav className="flex-1 px-4 py-4 space-y-1">
      {menuItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group mb-1',
              active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
            )}>
              <item.icon size={20} className={cn(active ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
              <span className={cn('text-sm', active ? 'font-semibold' : 'font-medium')}>{item.label}</span>
            </div>
          </Link>
        );
      })}
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
        <DesktopSidebarContent pathname={pathname} />
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
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <JomagaLogo size={24} />
                  <span className="font-bold text-slate-800">Menu</span>
                </div>
                <button
                  onClick={() => setShowMore(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              {/* Items grid */}
              <div className="p-4 grid grid-cols-3 gap-3">
                {moreSheetItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        'flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-colors',
                        active ? 'bg-[#1A237E]/10' : 'bg-slate-50 active:bg-slate-100'
                      )}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        active ? 'bg-[#1A237E]' : 'bg-white border border-slate-200 shadow-sm'
                      )}>
                        <item.icon size={22} className={active ? 'text-white' : 'text-slate-600'} />
                      </div>
                      <span className={cn(
                        'text-xs font-semibold text-center leading-tight',
                        active ? 'text-[#1A237E]' : 'text-slate-700'
                      )}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Logout */}
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
