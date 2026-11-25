'use client';

import Icon from '@/components/ui/icons/Icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'painel' },
  { href: '/admin/users', label: 'Utilizadores', icon: 'utilizadores' },
  { href: '/admin/restaurants', label: 'Restaurantes', icon: 'refeicoes' },
  { href: '/admin/lists', label: 'Listas', icon: 'lista' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'estrela' },
  { href: '/admin/reports', label: 'Reports', icon: 'bandeira' },
  { href: '/admin/marketing', label: 'Marketing', icon: 'marketing' },
  { href: '/admin/statistics', label: 'Estatísticas', icon: 'grafico' },
  { href: '/restaurants', label: 'Voltar à App', icon: 'seta-esq', external: true },
] as const;

export default function AdminSidebar({ id, open = false }: { id?: string; open?: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      id={id}
      className={`fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-white/5 p-6 bg-[#080808]/95 backdrop-blur-2xl transition-transform duration-200 md:static md:z-20 md:min-h-[100dvh] md:translate-x-0 md:bg-[#080808]/80 md:visible ${
        open ? 'translate-x-0' : '-translate-x-full invisible'
      }`}
    >
      {/* Logo */}
      <div className="mb-10">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-colors duration-150">
            <span className="text-white text-lg font-bold">F</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">FoodLister</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="space-y-1">
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-3 min-h-11 rounded-xl text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-white/10 text-white shadow-lg shadow-white/5'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon name={icon} className={`h-4 w-4 transition-colors ${isActive ? 'text-amber-400' : 'text-white/30 group-hover:text-white/50'}`} />
              {label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
