'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) toggleRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const nav = document.getElementById('admin-nav');
    const focusables = () =>
      Array.from(nav?.querySelectorAll<HTMLElement>('a[href]') ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="flex min-h-[100dvh] bg-[#050505] relative" data-theme="dark">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-orange-500/[0.02] blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/[0.01] blur-[150px]" />
      </div>

      {open && (
        <div
          data-testid="admin-overlay"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <AdminSidebar id="admin-nav" open={open} />
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-auto relative z-10">
        <header
          className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 mb-6 rounded-xl border"
          style={{
            background: "rgba(10,10,10,0.8)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              ref={toggleRef}
              type="button"
              className="md:hidden flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#f5f5f5] hover:bg-white/10"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              aria-controls="admin-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <h1 className="text-lg font-semibold text-[#f5f5f5] truncate">FoodLister Admin</h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden sm:inline text-sm text-[#a0a0a0]">Administrador</span>
            <a
              href="/api/auth/signout"
              className="inline-flex min-h-11 items-center px-2 text-sm text-[#f5f5f5] hover:text-amber-400 transition-colors"
            >
              Sair
            </a>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
