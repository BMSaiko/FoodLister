'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UtensilsCrossed, Star, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Utilizadores', icon: Users },
  { href: '/admin/restaurants', label: 'Restaurantes', icon: UtensilsCrossed },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/statistics', label: 'Estatísticas', icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen border-r p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="mb-8">
        <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>🛡️ Admin</h2>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>FoodLister Admin</p>
      </div>
      <nav className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'font-medium' : 'hover:opacity-80'}`}
              style={{ backgroundColor: isActive ? 'var(--primary)' : 'transparent', color: isActive ? 'white' : 'var(--foreground)' }}>
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

