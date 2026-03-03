'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, Bell, X, Check, Clock, AlertTriangle, LogOut, HardHat } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'incident' | 'training' | 'epi';
}

export function Header({ title }: { title: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jomaga_user_profile');
      return saved ? JSON.parse(saved) : { name: 'Usuário', role: 'Técnico de Segurança', gender: 'male' };
    }
    return { name: 'Usuário', role: 'Técnico de Segurança', gender: 'male' };
  });
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setAuthEmail(user.email);
    };
    init();
    fetchNotifications();

    const handleUpdate = () => {
      const saved = localStorage.getItem('jomaga_user_profile');
      if (saved) setUserProfile(JSON.parse(saved));
    };
    window.addEventListener('user-profile-updated', handleUpdate);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('user-profile-updated', handleUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const today = new Date();
      const in30Days = new Date(today);
      in30Days.setDate(today.getDate() + 30);
      const in30DaysStr = in30Days.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];

      const [
        { data: expiringEpis },
        { data: openIncidents },
        { data: pendingTrainings }
      ] = await Promise.all([
        supabase
          .from('epis')
          .select('item, user, date')
          .lte('date', in30DaysStr)
          .gte('date', todayStr)
          .order('date', { ascending: true })
          .limit(3),
        supabase
          .from('incidents')
          .select('title, area, created_at')
          .eq('status', 'Aberto')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('trainings')
          .select('title, date')
          .eq('status', 'Agendado')
          .lte('date', in30DaysStr)
          .gte('date', todayStr)
          .order('date', { ascending: true })
          .limit(3),
      ]);

      const notifs: Notification[] = [];

      (expiringEpis || []).forEach((epi: any, i: number) => {
        const expiry = new Date(epi.date + 'T12:00:00');
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        notifs.push({
          id: `epi-${i}`,
          title: 'EPI próximo do vencimento',
          desc: `${epi.item} de ${epi.user} — vence em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
          time: expiry.toLocaleDateString('pt-BR'),
          type: 'epi',
        });
      });

      (openIncidents || []).forEach((inc: any, i: number) => {
        const created = new Date(inc.created_at);
        const diffHours = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60));
        notifs.push({
          id: `inc-${i}`,
          title: 'Incidente em aberto',
          desc: `${inc.title} — ${inc.area}`,
          time: diffHours < 24 ? `${diffHours}h atrás` : `${Math.floor(diffHours / 24)}d atrás`,
          type: 'incident',
        });
      });

      (pendingTrainings || []).forEach((t: any, i: number) => {
        const trainingDate = new Date(t.date + 'T12:00:00');
        const diffDays = Math.ceil((trainingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        notifs.push({
          id: `training-${i}`,
          title: 'Treinamento agendado',
          desc: `${t.title} — em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
          time: trainingDate.toLocaleDateString('pt-BR'),
          type: 'training',
        });
      });

      setNotifications(notifs);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    toast.success('Sessão encerrada com sucesso.');
  };

  const iconMap = {
    incident: <AlertTriangle size={14} />,
    training: <Clock size={14} />,
    epi: <HardHat size={14} />,
  };

  const colorMap = {
    incident: 'bg-red-100 text-red-600',
    training: 'bg-blue-100 text-blue-600',
    epi: 'bg-orange-100 text-orange-600',
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
      <div className="flex items-center gap-4 lg:gap-6">
        <h2 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 truncate max-w-[180px] lg:max-w-none">
          {title}
        </h2>
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Buscar registros..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              'p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors',
              showNotifications && 'bg-slate-100 text-primary'
            )}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF9800] rounded-full border-2 border-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800">Notificações</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{notifications.length} alerta{notifications.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      <Check size={24} className="mx-auto mb-2 text-green-400" />
                      Nenhum alerta pendente
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', colorMap[n.type])}>
                            {iconMap[n.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{n.desc}</p>
                            <p className="text-[9px] text-slate-400 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => { setShowNotifications(false); router.push('/epis'); }}
                  className="w-full py-3 text-xs font-bold text-slate-500 hover:text-primary transition-colors bg-slate-50 border-t border-slate-100"
                >
                  Ver EPIs e alertas →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 lg:mx-2" />

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{userProfile.name}</p>
            <p className="text-[10px] lg:text-xs text-slate-500 font-medium">{authEmail || userProfile.role}</p>
          </div>
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300 relative shrink-0">
            <Image
              src={userProfile.gender === 'male'
                ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
                : 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'
              }
              alt={userProfile.name}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
