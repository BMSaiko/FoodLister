'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Menu, X, User, LogOut, Settings, Shield, Search, Plus, Bell, List, Shuffle, Calendar, Sparkles, Megaphone } from 'lucide-react';
import { useAuth, useFilters } from '@/contexts';
import { openGlobalSearch } from '@/components/ui/GlobalSearch';
import { getClient } from '@/libs/supabase/client';
import NotificationsDropdown from './NotificationsDropdown';

interface ProfileData {
  display_name: string;
  avatar_url: string;
  user_id_code: string;
  is_admin: boolean;
}

const NAV_ITEMS = [
  { id: 'restaurants', label: 'Restaurantes', href: '/restaurants' },
  { id: 'lists', label: 'Listas', href: '/lists' },
] as const;

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const { clearFilters: clearFiltersFromContext } = useFilters();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [hasNotifications, setHasNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll-driven transform
  const { scrollY } = useScroll();
  const navbarHeight = useTransform(scrollY, [0, 100], [64, 52]);
  const springHeight = useSpring(navbarHeight, { stiffness: 120, damping: 20 });

  // Active section
  const activeSection = pathname?.includes('/lists') ? 'lists' : 'restaurants';

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

  const SearchTrigger = () => (
    <button
      onClick={() => openGlobalSearch()}
      className="hidden md:flex items-center gap-2 w-full max-w-[280px] px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.08] transition-colors cursor-text group"
    >
      <Search className="h-4 w-4 text-white/25 flex-shrink-0" />
      <span className="text-sm text-white/25 truncate flex-1 text-left">Pesquisar...</span>
      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-white/20 bg-white/[0.04] border border-white/[0.06]">⌘K</kbd>
    </button>
  );

  return (
    <>
      {/* Desktop: Floating Pill Navbar */}
      <motion.header
        style={{ height: springHeight }}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-4xl"
      >
        <motion.nav
          className="navbar-glass h-full rounded-2xl px-3 sm:px-5 flex items-center justify-between gap-3"
        >
          {/* Logo */}
          <Link href="/restaurants" className="flex items-center gap-2 flex-shrink-0 animate-logo-breathe">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center">
              <span className="text-black font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-[var(--foreground)] hidden sm:inline text-sm">FoodLister</span>
          </Link>

          {/* Nav Items with Animated Indicator */}
          <div className="hidden md:flex items-center gap-0.5 bg-white/[0.03] rounded-full p-1 relative">
            {NAV_ITEMS.map((item) => (
              <Link key={item.id} href={item.href} className="relative z-10">
                <motion.span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ${
                    activeSection === item.id
                      ? 'text-black'
                      : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-[var(--primary)] rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* Search — opens global search modal */}
          <div className="hidden md:block flex-1 max-w-[280px]">
            <SearchTrigger />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Create button (logged in) */}
            {user && (
              <Link
                href="/restaurants/create"
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                title="Criar restaurante"
              >
                <Plus className="w-4 h-4 text-[var(--foreground)]" />
              </Link>
            )}

            {/* Roulette button (logged in) */}
            {user && (
              <Link
                href="/roulette"
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/15 hover:border-purple-500/30 transition-all duration-200 hover:scale-110"
                title="Roleta de Restaurantes"
              >
                <Shuffle className="w-4 h-4 text-purple-400" />
              </Link>
            )}

            {/* Notifications (logged in) */}
            {user && (
              <div className="hidden md:block">
                <NotificationsDropdown />
              </div>
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
                  aria-label="Menu do usuário"
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
                          <User className="w-4 h-4" /> Meu Perfil
                        </Link>
                        <Link
                          href="/users/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                        >
                          <Settings className="w-4 h-4" /> Configurações
                        </Link>
                        {userProfile?.is_admin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                          >
                            <Shield className="w-4 h-4" /> Admin
                          </Link>
                        )}
                        <Link
                          href="/meals"
                          onClick={() => setUserMenuOpen(false)}
                          className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                        >
                          <Calendar className="w-4 h-4" /> Refeições
                        </Link>
                        <Link
                          href="/pricing"
                          onClick={() => setUserMenuOpen(false)}
                          className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                        >
                          <Sparkles className="w-4 h-4" /> Premium
                        </Link>
                        {userProfile?.is_admin && (
                          <Link
                            href="/marketing"
                            onClick={() => setUserMenuOpen(false)}
                            className="magnetic-hover flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/[0.03] hover:text-[var(--foreground)]"
                          >
                            <Megaphone className="w-4 h-4" /> Marketing
                          </Link>
                        )}
                        <div className="border-t border-white/[0.06] my-1" />
                        <button
                          onClick={handleSignOut}
                          className="magnetic-hover flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--error-light)]"
                        >
                          <LogOut className="w-4 h-4" /> Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-1.5 bg-[var(--primary)] text-black text-sm font-semibold rounded-full hover:bg-[var(--primary-hover)] transition-colors min-h-[36px] flex items-center"
              >
                Entrar
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-[var(--foreground)]" /> : <Menu className="w-4 h-4 text-[var(--foreground)]" />}
            </button>
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile: Bottom Tab Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden fixed bottom-3 left-3 right-3 z-50"
      >
        <nav className="bottom-tab-bar rounded-2xl bg-[var(--card-bg)]/90 backdrop-blur-2xl border border-white/[0.08] px-1 py-1.5 flex items-center justify-around">
          {[
            { id: 'home', icon: Menu, label: 'Home', href: '/' },
            { id: 'restaurants', icon: Search, label: 'Restaurantes', href: '/restaurants' },
            { id: 'search', icon: Search, label: 'Search', action: 'search' },
            { id: 'roulette', icon: Shuffle, label: 'Roleta', href: '/roulette' },
            { id: 'lists', icon: List, label: 'Listas', href: '/lists' },
            { id: 'profile', icon: User, label: 'Perfil', href: user ? `/users/${userProfile?.user_id_code || user.id}` : '/auth/signin' },
          ].map((item) => {
            const isActive =
              (item.id === 'home' && pathname === '/') ||
              (item.id === 'restaurants' && pathname?.includes('/restaurants')) ||
              (item.id === 'lists' && pathname?.includes('/lists')) ||
              (item.id === 'profile' && pathname?.includes('/users'));
            const baseClass = `bottom-tab-item relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl ${isActive ? 'active' : ''}`;
            if ('action' in item && item.action === 'search') {
              return (
                <button
                  key={item.id}
                  onClick={() => openGlobalSearch()}
                  className={baseClass}
                  aria-label="Pesquisar"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            }
            return (
              <Link key={item.id} href={item.href!} className={baseClass}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-4 left-4 right-4 rounded-2xl bg-[var(--card-bg)] border border-white/[0.08] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <button
                  onClick={() => { setMobileMenuOpen(false); openGlobalSearch(); }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-left"
                >
                  <Search className="h-4 w-4 text-white/25" />
                  <span className="text-sm text-white/25">Pesquisar...</span>
                </button>
              </div>
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-[var(--primary)] text-black'
                        : 'text-[var(--foreground)] hover:bg-white/[0.03]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {user && (
                  <>
                    <div className="border-t border-white/[0.06] my-2" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-[var(--error)] hover:bg-[var(--error-light)]"
                    >
                      Sair
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for floating navbar */}
      <div className="h-20 md:h-16" />
    </>
  );
}