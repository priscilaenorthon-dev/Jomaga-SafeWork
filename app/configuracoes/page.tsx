'use client';

import React, { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { UserAvatar } from '@/components/UserAvatar';
import { Settings, User, Bell, Shield, Globe, X, Save, Mail, Briefcase, Building2, ImageUp, RotateCcw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-client';
import { executeMutationWithOfflineQueue } from '@/lib/offline-queue';

type SettingType = 'perfil' | 'notificacoes' | 'seguranca' | 'idioma' | 'empresa' | null;
const DEFAULT_COMPANY_LOGO = '/logo-modelos/safework-02-capacete-check.svg';

type UserGender = 'male' | 'female';

interface LocalUserProfile {
  name: string;
  email: string;
  role: string;
  gender: UserGender;
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

interface CompanySettings {
  companyName: string;
  companyLogo: string;
  cnpj: string;
}

const defaultUserProfile: LocalUserProfile = {
  name: 'Perfil sem nome',
  email: '',
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

const defaultCompanySettings: CompanySettings = {
  companyName: 'Jomaga',
  companyLogo: DEFAULT_COMPANY_LOGO,
  cnpj: '',
};

function normalizeLogoUrl(value?: string) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw || raw === '/icon' || raw === '/icon-192.png' || raw === '/icon-512.png' || raw === '/logo-sistema.png') return DEFAULT_COMPANY_LOGO;
  return raw;
}

function normalizeUserProfile(value: any): LocalUserProfile {
  const rawName = typeof value?.name === 'string' ? value.name.trim() : '';
  const rawEmail = typeof value?.email === 'string' ? value.email.trim() : '';
  const rawRole = typeof value?.role === 'string' ? value.role.trim() : '';
  const rawGender = value?.gender === 'female' ? 'female' : 'male';

  return {
    name: rawName && rawName.toLowerCase() !== 'usuário' ? rawName : defaultUserProfile.name,
    email: rawEmail,
    role: rawRole || defaultUserProfile.role,
    gender: rawGender,
  };
}

export default function ConfiguracoesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [activeModal, setActiveModal] = useState<SettingType>(null);
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jomaga_user_profile');
      return saved ? normalizeUserProfile(JSON.parse(saved)) : defaultUserProfile;
    }
    return defaultUserProfile;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jomaga_notification_settings');
      return saved ? { ...defaultNotificationSettings, ...JSON.parse(saved) } : defaultNotificationSettings;
    }
    return defaultNotificationSettings;
  });

  const [languageSettings, setLanguageSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jomaga_language_settings');
      return saved ? JSON.parse(saved) : { language: 'pt-BR', timezone: 'GMT-3' };
    }
    return { language: 'pt-BR', timezone: 'GMT-3' };
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jomaga_company_settings');
      return saved ? { ...defaultCompanySettings, ...JSON.parse(saved) } : defaultCompanySettings;
    }
    return defaultCompanySettings;
  });

  useEffect(() => {
    const loadCompanyFromDatabase = async () => {
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('company_name, logo_url, cnpj')
          .eq('id', 1)
          .maybeSingle();

        if (error || !data) return;

        const merged = {
          companyName: data.company_name || defaultCompanySettings.companyName,
          companyLogo: normalizeLogoUrl(data.logo_url || defaultCompanySettings.companyLogo),
          cnpj: data.cnpj || defaultCompanySettings.cnpj,
        };

        setCompanySettings(merged);
        localStorage.setItem('jomaga_company_settings', JSON.stringify(merged));
        window.dispatchEvent(new Event('company-settings-updated'));
      } catch {
        // fallback to local storage already loaded
      }
    };

    loadCompanyFromDatabase();
  }, [supabase]);

  const handleCompanyLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLogoUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `company-logo-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(path, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('branding').getPublicUrl(path);
      const logoUrl = data.publicUrl;

      setCompanySettings(prev => ({ ...prev, companyLogo: logoUrl }));
      toast.success('Logo enviada com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Não foi possível enviar a logo.');
    } finally {
      setIsLogoUploading(false);
      event.target.value = '';
    }
  };

  const handleSave = async (type: string) => {
    try {
      if (activeModal === 'perfil') {
        localStorage.setItem('jomaga_user_profile', JSON.stringify(userProfile));
        window.dispatchEvent(new Event('user-profile-updated'));
      } else if (activeModal === 'notificacoes') {
        localStorage.setItem('jomaga_notification_settings', JSON.stringify(notificationSettings));
        window.dispatchEvent(new Event('notification-settings-updated'));
      } else if (activeModal === 'idioma') {
        localStorage.setItem('jomaga_language_settings', JSON.stringify(languageSettings));
      } else if (activeModal === 'empresa') {
        localStorage.setItem('jomaga_company_settings', JSON.stringify(companySettings));
        window.dispatchEvent(new Event('company-settings-updated'));

        let updatedBy: string | null = null;
        if (navigator.onLine) {
          const { data: { user } } = await supabase.auth.getUser();

          if (user?.id) {
            const { error: profileEnsureError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
              }, { onConflict: 'id' });

            if (!profileEnsureError) {
              updatedBy = user.id;
            }
          }
        }

        const result = await executeMutationWithOfflineQueue({
          supabase,
          operation: {
            table: 'company_settings',
            action: 'upsert',
            payload: {
              id: 1,
              company_name: companySettings.companyName,
              logo_url: companySettings.companyLogo,
              cnpj: companySettings.cnpj || null,
              updated_by: updatedBy,
            },
            onConflict: 'id',
          },
        });

        if (result.status === 'error') throw result.error;
        if (result.status === 'queued') {
          toast.success('Sem conexão: configurações da empresa enfileiradas para sincronizar depois.');
        }
      }

      toast.success(`Configurações de ${type} salvas com sucesso!`);
      setActiveModal(null);
    } catch (error: any) {
      toast.error(error?.message || 'Não foi possível salvar as configurações.');
    }
  };

  const settingsOptions = [
    { id: 'empresa' as const, label: "Empresa", desc: "Nome da empresa e dados institucionais", icon: Building2 },
    { id: 'perfil' as const, label: "Perfil do Usuário", desc: "Gerencie suas informações pessoais", icon: User },
    { id: 'notificacoes' as const, label: "Notificações", desc: "Configure alertas e avisos", icon: Bell },
    { id: 'seguranca' as const, label: "Segurança e Acesso", desc: "Autenticação e permissões", icon: Shield },
    { id: 'idioma' as const, label: "Idioma e Região", desc: "Português (Brasil), GMT-3", icon: Globe },
  ];

  return (
    <>
      <Header title="Configurações do Sistema" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        <div className="max-w-2xl space-y-4">
          {settingsOptions.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={item.id}
              onClick={() => setActiveModal(item.id)}
              className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:border-primary/30 hover:bg-slate-50 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <item.icon size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.label}</h4>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
              <Settings size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    {activeModal === 'empresa' && <Building2 size={20} />}
                    {activeModal === 'perfil' && <User size={20} />}
                    {activeModal === 'notificacoes' && <Bell size={20} />}
                    {activeModal === 'seguranca' && <Shield size={20} />}
                    {activeModal === 'idioma' && <Globe size={20} />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {settingsOptions.find(o => o.id === activeModal)?.label}
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">

                {/* EMPRESA */}
                {activeModal === 'empresa' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-xs text-blue-700 font-medium">
                        O nome da empresa aparecerá no menu lateral, nos relatórios e nos documentos gerados pelo sistema.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Logo da Empresa</label>
                      <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <img
                          src={companySettings.companyLogo || '/icon'}
                          alt="Logo da empresa"
                          className="w-14 h-14 rounded-lg object-contain"
                          onError={() => setCompanySettings(prev => ({ ...prev, companyLogo: DEFAULT_COMPANY_LOGO }))}
                        />
                        <div className="flex-1 space-y-2">
                          <input
                            id="company-logo-input"
                            type="file"
                            accept="image/*"
                            onChange={handleCompanyLogoUpload}
                            className="hidden"
                            disabled={isLogoUploading}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={isLogoUploading}
                              onClick={() => document.getElementById('company-logo-input')?.click()}
                              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 disabled:opacity-60"
                            >
                              {isLogoUploading ? <Loader2 size={14} className="animate-spin" /> : <ImageUp size={14} />}
                              {isLogoUploading ? 'Enviando...' : 'Upload'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompanySettings({ ...companySettings, companyLogo: DEFAULT_COMPANY_LOGO })}
                              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5"
                            >
                              <RotateCcw size={14} />
                              Ícone padrão
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500">A logo será usada em relatórios e documentos impressos/PDF.</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                        <Building2 size={14} /> Nome da Empresa
                      </label>
                      <input
                        value={companySettings.companyName}
                        onChange={e => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                        placeholder="Ex: Minha Empresa Ltda"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">CNPJ</label>
                      <input
                        value={companySettings.cnpj}
                        onChange={e => setCompanySettings({ ...companySettings, cnpj: e.target.value })}
                        placeholder="Ex: 00.000.000/0001-00"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* PERFIL */}
                {activeModal === 'perfil' && (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-6 py-2">
                      <button
                        onClick={() => setUserProfile({ ...userProfile, gender: 'male' })}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all w-32",
                          userProfile.gender === 'male' ? "border-primary bg-primary/5 shadow-md" : "border-slate-100 hover:border-slate-200 bg-white"
                        )}
                      >
                        <UserAvatar gender="male" size={72} className="shadow-lg border-2 border-blue-300" />
                        <span className={cn("text-xs font-bold uppercase tracking-wider", userProfile.gender === 'male' ? "text-primary" : "text-slate-500")}>Homem</span>
                      </button>
                      <button
                        onClick={() => setUserProfile({ ...userProfile, gender: 'female' })}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all w-32",
                          userProfile.gender === 'female' ? "border-primary bg-primary/5 shadow-md" : "border-slate-100 hover:border-slate-200 bg-white"
                        )}
                      >
                        <UserAvatar gender="female" size={72} className="shadow-lg border-2 border-pink-300" />
                        <span className={cn("text-xs font-bold uppercase tracking-wider", userProfile.gender === 'female' ? "text-primary" : "text-slate-500")}>Mulher</span>
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={userProfile.name}
                          onChange={e => setUserProfile({ ...userProfile, name: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">E-mail Corporativo</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={userProfile.email}
                          onChange={e => setUserProfile({ ...userProfile, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Cargo / Função</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={userProfile.role}
                          onChange={e => setUserProfile({ ...userProfile, role: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTIFICAÇÕES */}
                {activeModal === 'notificacoes' && (
                  <div className="space-y-4">
                    {([
                      { id: 'incidentes', label: 'Alertas de Incidentes', desc: 'Receber avisos de novos incidentes reportados' },
                      { id: 'treinamentos', label: 'Vencimento de Treinamentos', desc: 'Avisar quando treinamentos estiverem para vencer' },
                      { id: 'epis', label: 'Controle de EPIs', desc: 'Notificar sobre baixas de estoque ou entregas' },
                      { id: 'asos', label: 'Controle de ASOs', desc: 'Notificar vencimentos e pendências de ASOs' },
                      { id: 'dds', label: 'Agenda de DDS', desc: 'Receber lembretes de DDS programados e pendentes' },
                      { id: 'inventario', label: 'Inventário de EPIs', desc: 'Avisar sobre itens abaixo do estoque mínimo' },
                      { id: 'relatorios', label: 'Relatórios Semanais', desc: 'Receber resumo de indicadores por e-mail' },
                    ] as const).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.label}</p>
                          <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings({ ...notificationSettings, [item.id]: !notificationSettings[item.id] })}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors duration-200",
                            notificationSettings[item.id] ? "bg-primary" : "bg-slate-300"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200",
                            notificationSettings[item.id] ? "left-6" : "left-1"
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* SEGURANÇA */}
                {activeModal === 'seguranca' && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <Shield size={24} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-800 mb-1">Autenticação via Magic Link</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Este sistema utiliza Magic Link por e-mail — sem senhas. O acesso é concedido por links de uso único enviados para seu e-mail corporativo, tornando o login mais seguro e prático.
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">Boas práticas de segurança</p>
                      <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
                        <li>Nunca compartilhe links de acesso recebidos por e-mail</li>
                        <li>Sempre faça logout ao terminar o uso em dispositivos compartilhados</li>
                        <li>Verifique o remetente do e-mail antes de clicar em links</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* IDIOMA */}
                {activeModal === 'idioma' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Idioma do Sistema</label>
                      <select
                        value={languageSettings.language}
                        onChange={e => setLanguageSettings({ ...languageSettings, language: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Fuso Horário</label>
                      <select
                        value={languageSettings.timezone}
                        onChange={e => setLanguageSettings({ ...languageSettings, timezone: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      >
                        <option value="GMT-3">Brasília (GMT-3)</option>
                        <option value="GMT-4">Manaus (GMT-4)</option>
                        <option value="GMT-5">Rio Branco (GMT-5)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all text-sm"
                >
                  Cancelar
                </button>
                {activeModal !== 'seguranca' && (
                  <button
                    onClick={() => handleSave(settingsOptions.find(o => o.id === activeModal)?.label || '')}
                    className="flex-1 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 text-sm active:scale-95"
                  >
                    <Save size={18} />
                    Salvar Alterações
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
