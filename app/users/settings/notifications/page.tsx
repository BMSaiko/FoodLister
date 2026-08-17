'use client';

import React from 'react';
import { Bell, Mail, BellRing, Utensils, Users, List, Settings, CalendarCheck, Loader2 } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/data/useNotificationPreferences';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePageTitle } from "@/hooks/usePageTitle";
import { useLanguage } from "@/contexts";

interface PreferenceToggleProps {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function PreferenceToggle({ id, label, description, icon, checked, onChange, disabled }: PreferenceToggleProps) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors min-h-[72px] ${checked ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/[0.06] bg-white/[0.02]'}`}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${checked ? 'bg-amber-500/10 text-amber-400' : 'bg-white/[0.03] text-white/30'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="text-sm font-semibold text-white/90 cursor-pointer">
            {label}
          </label>
          <p className="text-xs text-white/40 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-amber-500' : 'bg-white/10'}`}
      >
        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-150 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function NotificationPreferencesPage() {
  const { t } = useLanguage();
  usePageTitle(t("Definições · Notificações - FoodLister"));
  const { preferences, loading, togglePreference } = useNotificationPreferences();

  return (
    <div className="min-h-[100dvh] bg-[#050505]">
      <Navbar />
      <Container variant="narrow" className="py-6 sm:py-8">
        <PageHeader
          title={t("Preferencias de Notificacoes")}
          subtitle={t("Escolhe que tipo de notificacoes recebes e como as recebes")}
          backLink="/users/settings"
        />

        {loading && !preferences ? (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            <span className="ml-3 text-white/40">{t("A carregar preferencias...")}</span>
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <BellRing className="h-5 w-5 text-amber-500" />
                {t("Metodo de Entrega")}
              </h2>
              <div className="space-y-3">
                <PreferenceToggle id="email_notifications" label={t("Notificacoes por Email")} description={t("Recebe notificacoes importantes no teu email")} icon={<Mail className="h-5 w-5" />} checked={preferences.email_notifications} onChange={() => togglePreference('email_notifications')} disabled={loading} />
                <PreferenceToggle id="push_notifications" label={t("Notificacoes Push")} description={t("Recebe notificacoes no navegador em tempo real")} icon={<Bell className="h-5 w-5" />} checked={preferences.push_notifications} onChange={() => togglePreference('push_notifications')} disabled={loading} />
                <PreferenceToggle id="weekly_digest" label={t("Resumo Semanal")} description={t("Recebe um resumo semanal da atividade nas tuas listas")} icon={<CalendarCheck className="h-5 w-5" />} checked={preferences.weekly_digest} onChange={() => togglePreference('weekly_digest')} disabled={loading} />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-500" />
                {t("Tipos de Notificacao")}
              </h2>
              <div className="space-y-3">
                <PreferenceToggle id="meal_invitations" label={t("Convites para Refeicoes")} description={t("Quando te convidam para uma refeicao em grupo")} icon={<Utensils className="h-5 w-5" />} checked={preferences.meal_invitations} onChange={() => togglePreference('meal_invitations')} disabled={loading} />
                <PreferenceToggle id="collaborator_updates" label={t("Atualizacoes de Colaboradores")} description={t("Quando alguem colabora nas tuas listas")} icon={<Users className="h-5 w-5" />} checked={preferences.collaborator_updates} onChange={() => togglePreference('collaborator_updates')} disabled={loading} />
                <PreferenceToggle id="list_activity" label={t("Atividade em Listas")} description={t("Mudancas e comentarios nas tuas listas")} icon={<List className="h-5 w-5" />} checked={preferences.list_activity} onChange={() => togglePreference('list_activity')} disabled={loading} />
                <PreferenceToggle id="system_updates" label={t("Atualizacoes do Sistema")} description={t("Novidades, manutencao e avisos importantes")} icon={<Bell className="h-5 w-5" />} checked={preferences.system_updates} onChange={() => togglePreference('system_updates')} disabled={loading} />
              </div>
            </section>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
              <p className="text-sm text-white/50">
                <strong className="text-amber-400">{t("Nota:")}</strong> {t("As notificacoes push requerem que o teu navegador tenha permissoes de notificacao ativadas.")}
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
