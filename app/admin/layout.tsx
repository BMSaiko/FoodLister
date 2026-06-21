import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin Dashboard - FoodLister",
  description: "Painel de administração do FoodLister",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-[#050505] relative" data-theme="dark">
      {/* Mesh gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-orange-500/[0.02] blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/[0.01] blur-[150px]" />
      </div>

      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto relative z-10">
        <header
          className="flex items-center justify-between px-6 py-4 mb-6 rounded-xl border"
          style={{
            background: "rgba(10,10,10,0.8)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <h1 className="text-lg font-semibold text-[#f5f5f5]">FoodLister Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#a0a0a0]">Administrador</span>
            <a
              href="/api/auth/signout"
              className="text-sm text-[#f5f5f5] hover:text-amber-400 transition-colors"
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
