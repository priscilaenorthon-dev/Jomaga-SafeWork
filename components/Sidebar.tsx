'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  LayoutDashboard, 
  HardHat, 
  GraduationCap, 
  AlertTriangle, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: UserCheck, label: "Colaboradores", href: "/colaboradores" },
  { icon: HardHat, label: "Gestão de EPIs", href: "/epis" },
  { icon: GraduationCap, label: "Treinamentos", href: "/treinamentos" },
  { icon: AlertTriangle, label: "Incidentes", href: "/incidentes" },
  { icon: CheckSquare, label: "Conformidade DDS", href: "/dds" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
];

const footerItems = [
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
  { icon: HelpCircle, label: "Suporte", href: "/suporte" },
];

const SidebarContent = ({ pathname, setIsOpen }: { pathname: string, setIsOpen: (val: boolean) => void }) => (
  <div className="flex flex-col h-full bg-[#1A237E] text-white">
    <div className="p-6 flex items-center gap-3">
      <div className="bg-[#FF9800] rounded-lg p-1.5 flex items-center justify-center">
        <Shield size={24} className="text-white" />
      </div>
      <div>
        <h1 className="text-lg font-bold leading-tight tracking-tight">Jomaga</h1>
        <p className="text-xs text-slate-300 font-medium">Sistema SafeWork</p>
      </div>
    </div>

    <nav className="flex-1 px-4 py-4 space-y-1">
      {menuItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group mb-1",
              active 
                ? "bg-white/10 text-white" 
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            )}>
              <item.icon size={20} className={cn(active ? "text-white" : "text-slate-400 group-hover:text-white")} />
              <span className={cn("text-sm", active ? "font-semibold" : "font-medium")}>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>

    <div className="px-4 py-6 border-t border-white/10 space-y-1">
      {footerItems.map((item) => (
        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group",
            pathname === item.href ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1A237E] text-white rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0">
        <SidebarContent pathname={pathname} setIsOpen={setIsOpen} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-[70] lg:hidden"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-[-48px] p-2 bg-[#1A237E] text-white rounded-lg"
              >
                <X size={20} />
              </button>
              <SidebarContent pathname={pathname} setIsOpen={setIsOpen} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

