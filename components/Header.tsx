'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Check, Clock, AlertTriangle, LogOut, HardHat, Stethoscope, ClipboardList, Package, FileClock } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
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
  type: 'incident' | 'training' | 'epi' | 'aso' | 'dds' | 'inventory' | 'report';
  route: string;
  severity: 'high' | 'medium' | 'low';
}

interface NotificationSettings {
  incidentes: boolean;
  treinamentos: boolean;
  epis: boolean;
  asos: boolean;
  dds: boolean;
  inventario: boolean;
  relatorios: boolean;
}

type UserGender = 'male' | 'female';

interface UserProfile {
  name: string;
  role: string;
  gender: UserGender;
}

const defaultUserProfile: UserProfile = {
  name: 'Perfil sem nome',
  role: 'Técnico de Segurança',
  gender: 'male',
};

const defaultNotificationSettings: NotificationSettings = {
  incidentes: true,
  treinamentos: true,
  epis: false,
  asos: true,
  dds: true,
  inventario: true,
  relatorios: true,
};

function loadNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return defaultNotificationSettings;
  const saved = localStorage.getItem('jomaga_notification_settings');
  if (!saved) return defaultNotificationSettings;
  try {
    return { ...defaultNotificationSettings, ...JSON.parse(saved) };
  } catch {
    return defaultNotificationSettings;
  }
}

function normalizeUserProfile(value: any): UserProfile {
  const rawName = typeof value?.name === 'string' ? value.name.trim() : '';
  const rawRole = typeof value?.role === 'string' ? value.role.trim() : '';
  const rawGender = value?.gender === 'female' ? 'female' : 'male';

  return {
    name: rawName && rawName.toLowerCase() !== 'usuário' ? rawName : defaultUserProfile.name,
    role: rawRole || defaultUserProfile.role,
    gender: rawGender,
  };
}

export function Header({ title }: { title: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => loadNotificationSettings());
  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jomaga_user_profile');
      return saved ? normalizeUserProfile(JSON.parse(saved)) : defaultUserProfile;
    }
    return defaultUserProfile;
  });
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || null;
      setAuthEmail(userEmail);

      const authName = typeof user?.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name.trim()
        : '';
      const fallbackName = authName || (userEmail ? userEmail.split('@')[0] : '');

      if (fallbackName) {
        setUserProfile((previous) => {
          const resolved = normalizeUserProfile({
            ...previous,
            name: previous.name === defaultUserProfile.name ? fallbackName : previous.name,
          });
          localStorage.setItem('jomaga_user_profile', JSON.stringify(resolved));
          return resolved;
        });
      }
    };
    init();
    const initialSettings = loadNotificationSettings();
    setNotificationSettings(initialSettings);
    fetchNotifications(initialSettings);

    const handleUpdate = () => {
      const saved = localStorage.getItem('jomaga_user_profile');
      if (saved) {
        setUserProfile(normalizeUserProfile(JSON.parse(saved)));
      }
    };
    window.addEventListener('user-profile-updated', handleUpdate);

    const handleNotificationSettingsUpdate = () => {
      const loaded = loadNotificationSettings();
      setNotificationSettings(loaded);
      fetchNotifications(loaded);
    };
    window.addEventListener('notification-settings-updated', handleNotificationSettingsUpdate);

    const interval = window.setInterval(() => {
      fetchNotifications(loadNotificationSettings());
    }, 60000);

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('user-profile-updated', handleUpdate);
      window.removeEventListener('notification-settings-updated', handleNotificationSettingsUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
      window.clearInterval(interval);
    };
  }, []);

  const fetchNotifications = async (settings: NotificationSettings = notificationSettings) => {
    try {
      const today = new Date();
      const in30Days = new Date(today);
      in30Days.setDate(today.getDate() + 30);
      const in30DaysStr = in30Days.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];

      const [
        { data: expiringEpis },
        { data: openIncidents },
        { data: pendingTrainings },
        { data: asoAlerts },
        { data: inventoryItems },
        { data: latestDds }
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
        supabase
          .from('asos')
          .select('collaborator_name, next_exam_date')
          .not('next_exam_date', 'is', null)
          .lte('next_exam_date', in30DaysStr)
          .gte('next_exam_date', todayStr)
          .order('next_exam_date', { ascending: true })
          .limit(3),
        supabase
          .from('epi_inventory')
          .select('epi_name, current_stock, minimum_stock')
          .limit(50),
        supabase
          .from('dds_records')
          .select('date, theme')
          .order('date', { ascending: false })
          .limit(1),
      ]);

      const notifs: Notification[] = [];

      if (settings.epis) {
        (expiringEpis || []).forEach((epi: any, i: number) => {
          const expiry = new Date(epi.date + 'T12:00:00');
          const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          notifs.push({
            id: `epi-${i}`,
            title: 'EPI próximo do vencimento',
            desc: `${epi.item} de ${epi.user} — vence em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
            time: expiry.toLocaleDateString('pt-BR'),
            type: 'epi',
            route: '/epis',
            severity: diffDays <= 7 ? 'high' : 'medium',
          });
        });
      }

      if (settings.incidentes) {
        (openIncidents || []).forEach((inc: any, i: number) => {
          const created = new Date(inc.created_at);
          const diffHours = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60));
          notifs.push({
            id: `inc-${i}`,
            title: 'Incidente em aberto',
            desc: `${inc.title} — ${inc.area}`,
            time: diffHours < 24 ? `${diffHours}h atrás` : `${Math.floor(diffHours / 24)}d atrás`,
            type: 'incident',
            route: '/incidentes',
            severity: 'high',
          });
        });
      }

      if (settings.treinamentos) {
        (pendingTrainings || []).forEach((t: any, i: number) => {
          const trainingDate = new Date(t.date + 'T12:00:00');
          const diffDays = Math.ceil((trainingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          notifs.push({
            id: `training-${i}`,
            title: 'Treinamento agendado',
            desc: `${t.title} — em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
            time: trainingDate.toLocaleDateString('pt-BR'),
            type: 'training',
            route: '/treinamentos',
            severity: diffDays <= 7 ? 'high' : 'medium',
          });
        });
      }

      if (settings.asos) {
        (asoAlerts || []).forEach((aso: any, i: number) => {
          const nextExam = new Date(aso.next_exam_date + 'T12:00:00');
          const diffDays = Math.ceil((nextExam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          notifs.push({
            id: `aso-${i}`,
            title: 'ASO em alerta',
            desc: `${aso.collaborator_name} — vence em ${diffDays} dia${diffDays !== 1 ? 's' : ''}`,
            time: nextExam.toLocaleDateString('pt-BR'),
            type: 'aso',
            route: '/aso',
            severity: diffDays <= 7 ? 'high' : 'medium',
          });
        });
      }

      if (settings.inventario) {
        (inventoryItems || [])
          .filter((item: any) => Number(item.current_stock) < Number(item.minimum_stock))
          .slice(0, 3)
          .forEach((item: any, i: number) => {
            notifs.push({
              id: `inv-${i}`,
              title: 'Estoque crítico de EPI',
              desc: `${item.epi_name} — estoque ${item.current_stock}/${item.minimum_stock}`,
              time: 'Inventário',
              type: 'inventory',
              route: '/epis/inventario',
              severity: 'high',
            });
          });
      }

      if (settings.dds) {
        const latest = (latestDds || [])[0];
        if (!latest) {
          notifs.push({
            id: 'dds-empty',
            title: 'DDS sem registros recentes',
            desc: 'Não há DDS registrado. Programe o próximo diálogo diário.',
            time: 'Hoje',
            type: 'dds',
            route: '/dds',
            severity: 'medium',
          });
        } else {
          const latestDate = new Date(`${latest.date}T12:00:00`);
          const diffDays = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 1) {
            notifs.push({
              id: 'dds-delay',
              title: 'Reforçar agenda de DDS',
              desc: `Último DDS: ${latest.theme || 'Tema não informado'} (${diffDays} dia${diffDays !== 1 ? 's' : ''} atrás).`,
              time: latestDate.toLocaleDateString('pt-BR'),
              type: 'dds',
              route: '/dds',
              severity: diffDays >= 2 ? 'high' : 'medium',
            });
          }
        }
      }

      if (settings.relatorios) {
        notifs.push({
          id: 'report-monthly',
          title: 'Relatório mensal disponível',
          desc: 'Gere o Relatório Mensal de Segurança em PDF profissional.',
          time: new Date().toLocaleDateString('pt-BR'),
          type: 'report',
          route: '/relatorios',
          severity: 'low',
        });
      }

      const severityOrder = { high: 0, medium: 1, low: 2 };
      const sorted = notifs.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setNotifications(sorted);
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
    aso: <Stethoscope size={14} />,
    dds: <ClipboardList size={14} />,
    inventory: <Package size={14} />,
    report: <FileClock size={14} />,
  };

  const colorMap = {
    incident: 'bg-red-100 text-red-600',
    training: 'bg-blue-100 text-blue-600',
    epi: 'bg-orange-100 text-orange-600',
    aso: 'bg-purple-100 text-purple-700',
    dds: 'bg-amber-100 text-amber-700',
    inventory: 'bg-rose-100 text-rose-700',
    report: 'bg-slate-100 text-slate-600',
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
                        onClick={() => { setShowNotifications(false); router.push(n.route); }}
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
                  onClick={() => { setShowNotifications(false); router.push('/relatorios'); }}
                  className="w-full py-3 text-xs font-bold text-slate-500 hover:text-primary transition-colors bg-slate-50 border-t border-slate-100"
                >
                  Ver central de alertas →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-1 lg:mx-2" />

        <div className="flex items-center gap-2 lg:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{userProfile.name}</p>
            <p className="text-[10px] lg:text-xs text-slate-500 font-medium">{userProfile.role || 'Cargo não definido'}</p>
          </div>
          <UserAvatar 
            gender={userProfile.gender === 'female' ? 'female' : 'male'} 
            size={40}
            className="w-8 h-8 lg:w-10 lg:h-10 border-2 border-slate-200 shadow-sm"
          />
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
