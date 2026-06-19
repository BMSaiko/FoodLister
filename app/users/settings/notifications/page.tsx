'use client';

import React from 'react';
import { Bell, Mail, BellRing, Utensils, Users, List, Settings, CalendarCheck, Loader2 } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/data/useNotificationPreferences';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';

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
    <div className={`flex items-center justify-between p-4 rounded-[var(--radius-lg)] border transition-colors ${checked ? 'border-primary-light bg-primary-lighter/30' : 'border-gray-200 bg-card-bg'}`}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${checked ? 'bg-primary-lighter text-primary-dark' : 'bg-gray-100 text-foreground-secondary'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="text-sm font-semibold text-foreground cursor-pointer">
            {label}
          </label>
          <p className="text-xs text-foreground-secondary mt-0.5">{description}</p>
        </div>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${checked ? 'bg-primary' : 'bg-gray-200'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function NotificationPreferencesPage() {
  const { preferences, loading, togglePreference } = useNotificationPreferences();

  return (
    <div className="min-h-screen bg-background-secondary">
      <Navbar />
      <Container variant="narrow" className="py-6 sm:py-8">
        <PageHeader
          title="Preferências de Notificações"
          subtitle="Escolhe que tipo de notificações recebes e como as recebes"
          backLink="/users/settings"
        />

        {loading && !preferences ? (
          <div className="card p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="ml-3 text-foreground-secondary">A carregar preferências...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Delivery Methods */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <BellRing className="h-5 w-5 text-primary" />
                Método de Entrega
              </h2>
              <div className="space-y-3">
                <PreferenceToggle
                  id="email_notifications"
                  label="Notificações por Email"
                  description="Recebe notificações importantes no teu email"
                  icon={<Mail className="h-5 w-5" />}
                  checked={preferences.email_notifications}
                  onChange={() => togglePreference('email_notifications')}
                  disabled={loading}
                />
                <PreferenceToggle
                  id="push_notifications"
                  label="Notificações Push"
                  description="Recebe notificações no navegador em tempo real"
                  icon={<Bell className="h-5 w-5" />}
                  checked={preferences.push_notifications}
                  onChange={() => togglePreference('push_notifications')}
                  disabled={loading}
                />
                <PreferenceToggle
                  id="weekly_digest"
                  label="Resumo Semanal"
                  description="Recebe um resumo semanal da atividade nas tuas listas"
                  icon={<CalendarCheck className="h-5 w-5" />}
                  checked={preferences.weekly_digest}
                  onChange={() => togglePreference('weekly_digest')}
                  disabled={loading}
                />
              </div>
            </section>

            {/* Notification Types */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Tipos de Notificação
              </h2>
              <div className="space-y-3">
                <PreferenceToggle
                  id="meal_invitations"
                  label="Convites para Refeições"
                  description="Quando te convidam para uma refeição em grupo"
                  icon={<Utensils className="h-5 w-5" />}
                  checked={preferences.meal_invitations}
                  onChange={() => togglePreference('meal_invitations')}
                  disabled={loading}
                />
                <PreferenceToggle
                  id="collaborator_updates"
                  label="Atualizações de Colaboradores"
                  description="Quando alguém colabora nas tuas listas"
                  icon={<Users className="h-5 w-5" />}
                  checked={preferences.collaborator_updates}
                  onChange={() => togglePreference('collaborator_updates')}
                  disabled={loading}
                />
                <PreferenceToggle
                  id="list_activity"
                  label="Atividade em Listas"
                  description="Mudanças e comentários nas tuas listas"
                  icon={<List className="h-5 w-5" />}
                  checked={preferences.list_activity}
                  onChange={() => togglePreference('list_activity')}
                  disabled={loading}
                />
                <PreferenceToggle
                  id="system_updates"
                  label="Atualizações do Sistema"
                  description="Novidades, manutenção e avisos importantes"
                  icon={<Bell className="h-5 w-5" />}
                  checked={preferences.system_updates}
                  onChange={() => togglePreference('system_updates')}
                  disabled={loading}
                />
              </div>
            </section>

            {/* Info */}
            <div className="card p-4 bg-primary-lighter/20 border-primary-light">
              <p className="text-sm text-foreground-secondary">
                <strong className="text-foreground">Nota:</strong> As notificações push requerem que o teu navegador tenha permissões de notificação ativadas.
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
