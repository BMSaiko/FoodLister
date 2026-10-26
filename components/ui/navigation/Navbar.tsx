'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'motion/react';
import Ico from '@/components/ui/icons/Ico';
import {useAuth, useFilters } from '@/contexts';
import { openGlobalSearch } from '@/components/ui/GlobalSearch';
import { getClient } from '@/libs/supabase/client';
import NotificationsDropdown from './NotificationsDropdown';
import LanguageCombobox from './LanguageCombobox';
import { useLanguage } from '@/contexts/LanguageContext';
import useNotifications from '@/hooks/data/useNotifications';
import Icon from '@/components/ui/icons/Icon';

interface ProfileData {
  display_name: string;
  avatar_url: string;
  user_id_code: string;
  is_admin: boolean;
}

const NAV_ITEMS = [
  { id: 'restaurants', label: 'Restaurantes', href: '/restaurants' },
  { id: 'map', label: 'Mapa', href: '/map' },
  { id: 'lists', label: 'Listas', href: '/lists' },
] as const;

const HomeIc = ({ className }: { className?: string }) => <Ico name="home" className={className} />;
const ForkIc = ({ className }: { className?: string }) => <Ico name="fork" className={className} />;
const PinIc = ({ className }: { className?: string }) => <Ico name="pin" className={className} />;
const SearchIc = ({ className }: { className?: string }) => <Ico name="search" className={className} />;
const DiceIc = ({ className }: { className?: string }) => <Ico name="dice" className={className} />;
const ListIc = ({ className }: { className?: string }) => <Ico name="list" className={className} />;
const UserIc = ({ className }: { className?: string }) => <Ico name="user" className={className} />;

export default function Navbar() {
  const { t } = useLanguage();
  const { user, signOut, loading } = useAuth();
  const { clearFilters: clearFiltersFromContext } = useFilters();
  const { unreadCount } = useNotifications({ polling: false });
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getClient();
  // No mobile menu — navbar uses bottom tab bar on mobile
  
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const hasNotifications = (unreadCount || 0) > 0;
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll-driven transform
  const { scrollY } = useScroll();
  const navbarHeight = useTransform(scrollY, [0, 100], [64, 52]);
  const springHeight = useSpring(navbarHeight, { stiffness: 120, damping: 20 });

  // Active section
  const activeSection = pathname === '/roulette' ? 'roulette' : pathname === '/' ? '' : pathname?.includes('/lists') ? 'lists' : pathname === '/map' ? 'map' : 'restaurants';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && !loading) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, user_id_code, is_admin')
            .eq('user_id', user.id)
            .single();
          setUserProfile(data);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
    };
    fetchProfile();
  }, [user, loading, supabase]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    clearFiltersFromContext();
    await signOut();
    router.push('/');
  };

  return (
    <>
      {/* Desktop: barra fixa ao topo (design da home) */}
      <header className="sticky top-0 z-[800] bg-[rgba(5,5,5,0.8)] backdrop-blur-[14px] border-b border-white/[0.08]">
        <div className="mx-auto flex items-center gap-1.5 md:gap-5 min-h-[60px] w-[min(1120px,calc(100%-32px))]">
          {/* Logo */}
          <Link href="/" prefetch={false} className="flex-shrink-0" aria-label={t("FoodLister, início")}>
            <img src="/brand/lockup-dark.svg" alt="FoodLister" className="h-7 w-auto max-w-none" />
          </Link>

          {/* Links */}
          <nav className="hidden md:flex gap-1 ml-3" aria-label={t("Principal")}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                prefetch={false}
                onClick={() => { if (pathname === item.href) window.location.reload(); }}
                aria-current={activeSection === item.id ? 'page' : undefined}
                className={`min-h-[44px] px-3 inline-flex items-center rounded-[10px] text-sm transition-colors hover:bg-white/5 ${
                  activeSection === item.id ? 'text-[var(--primary)]' : 'text-white/55 hover:text-[var(--foreground)]'
                }`}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>

          <span className="flex-1" />

          {/* Pesquisa — abre a pesquisa global */}
          <button
            onClick={() => openGlobalSearch()}
            aria-label={t("Pesquisar")}
            className="hidden md:inline-flex min-h-[44px] px-3 items-center gap-1.5 rounded-[10px] text-sm text-white/55 hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
          >
            <Ico name="search" />
            <span>{t("Pesquisar")}</span>
            <kbd className="font-sans text-[11px] border border-white/[0.08] rounded-md px-1.5 py-px">Ctrl K</kbd>
          </button>

          <div className="flex items-center gap-1.5">
            <LanguageCombobox />
            {user && (
              <Link
                href="/restaurants/create"
                prefetch={false}
                className="hidden md:inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] text-white/55 hover:text-[var(--foreground)] hover:bg-white/5 transition-colors"
                aria-label={t("Criar restaurante")}
                title={t("Criar restaurante")}
              >
                <Ico name="plus" />
              </Link>
            )}
            {user && (
              <Link
                href="/roulette"
                prefetch={false}
                onClick={() => { if (pathname === '/roulette') window.location.reload(); }}
                className={`hidden md:inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] hover:bg-white/5 transition-colors ${
                  pathname === '/roulette' ? 'text-[var(--primary)]' : 'text-white/55 hover:text-[var(--foreground)]'
                }`}
                aria-label={t("Roleta de Restaurantes")}
                title={t("Roleta de Restaurantes")}
              >
                <Ico name="dice" />
              </Link>
            )}
            {user && (
              <>
                <div className="hidden md:block">
                  <NotificationsDropdown />
                </div>
                <div className="md:hidden">
                  <NotificationsDropdown mobile />
                </div>
              </>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  ref={userMenuButtonRef}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    hasNotifications ? 'animate-notification-glow' : ''
                  }`}
                  aria-label={t("Menu do usuário")}
                  aria-expanded={userMenuOpen}
                >
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[var(--primary)] flex items-center justify-center">
                      <span className="text-black text-xs font-bold">
                        {(userProfile?.display_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[var(--card-bg)] border border-white/[0.08] shadow-xl overflow-hidden z-50"
                    >
                      {/* Header */}
                      <div className="p-3 border-b border-white/[0.06]">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">
                          {userProfile?.display_name || user.email}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)] truncate">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href={`/users/${userProfile?.user_id_code || user.id}`}
                          onClick={() => setUserMenuOpen(false)}
                          className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                        >
                          <Icon name="perfil" className="w-4 h-4" /> Meu Perfil
                        </Link>
                        <Link
                          href="/users/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                        >
                          <Icon name="definicoes" className="w-4 h-4" /> Configurações
                        </Link>
                        {userProfile?.is_admin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                          >
                            <Icon name="escudo" className="w-4 h-4" /> Admin
                          </Link>
                        )}
                        <Link
                          href="/meals"
                          onClick={() => setUserMenuOpen(false)}
                          className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                        >
                          <Icon name="calendario" className="w-4 h-4" /> Refeições
                        </Link>
                        <Link
                          href="/pricing"
                          onClick={() => setUserMenuOpen(false)}
                          className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                        >
                          <Icon name="faiscas" className="w-4 h-4" /> Premium
                        </Link>
                        {userProfile?.is_admin && (
                          <Link
                            href="/marketing"
                            onClick={() => setUserMenuOpen(false)}
                            className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                          >
                            <Icon name="marketing" className="w-4 h-4" /> Marketing
                          </Link>
                        )}
                        <div className="border-t border-white/[0.06] my-1" />
                        <button
                          onClick={handleSignOut}
                          className="magnetic-hover flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--error-light)]"
                        >
                          <Icon name="sair" className="w-4 h-4" />{t("Sair")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 min-h-[44px] inline-flex items-center rounded-xl border border-white/[0.08] text-sm font-semibold text-[var(--foreground)] hover:bg-white/5 transition-colors"
              >
                Entrar
              </Link>
            )}

            {/* Mobile: minimal padding, no menu button */}
          </div>
        </div>
      </header>

      {/* Mobile: Bottom Tab Bar */}
      {/* Mobile: Bottom Tab Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden fixed bottom-3 left-3 right-3 z-[800] pb-[env(safe-area-inset-bottom)]"
      >
        <nav className="bottom-tab-bar rounded-2xl bg-[var(--card-bg)]/90 backdrop-blur-2xl border border-white/[0.08] px-1 py-1.5 flex items-center justify-around">
          {[
            { id: 'home', icon: HomeIc, label: 'Home', href: '/' },
            { id: 'restaurants', icon: ForkIc, label: 'Restaurantes', href: '/restaurants' },
            { id: 'map', icon: PinIc, label: 'Mapa', href: '/map' },
            { id: 'search', icon: SearchIc, label: 'Pesquisa', action: 'search' },
            ...(user ? [{ id: 'roulette', icon: DiceIc, label: 'Roleta', href: '/roulette' }] : []),
            { id: 'lists', icon: ListIc, label: 'Listas', href: '/lists' },
            user
              ? { id: 'profile', icon: UserIc, label: 'Perfil', href: `/users/${userProfile?.user_id_code || user.id}` }
              : { id: 'signin', icon: UserIc, label: 'Entrar', href: '/auth/signin' },
          ].map((item) => {
            const isActive =
              (item.id === 'home' && pathname === '/') ||
              (item.id === 'restaurants' && pathname?.includes('/restaurants')) ||
              (item.id === 'map' && pathname === '/map') ||
              (item.id === 'map' && pathname === '/map') ||
              (item.id === 'lists' && pathname?.includes('/lists')) ||
              (item.id === 'profile' && pathname?.includes('/users')) ||
              (item.id === 'roulette' && pathname === '/roulette');
            const baseClass = `bottom-tab-item relative flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl ${isActive ? 'active' : ''}`;
            if ('action' in item && item.action === 'search') {
              return (
                <button
                  key={item.id}
                  onClick={() => openGlobalSearch()}
                  className={baseClass}
                  aria-label={t("Pesquisar")}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[9px] sm:text-[10px] font-medium">{t(item.label)}</span>
                </button>
              );
            }
            return (
              <Link
              key={item.id}
              href={item.href!}
              prefetch={false}
              onClick={() => { if (pathname === item.href) window.location.reload(); }}
              className={baseClass}
            >
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] sm:text-[10px] font-medium">{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>
      </motion.div>

      {/* No mobile menu — navbar is minimal on mobile */}

    </>
  );
}