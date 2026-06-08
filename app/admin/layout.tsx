import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Admin Dashboard - FoodLister',
  description: 'Painel de administração do FoodLister',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}

