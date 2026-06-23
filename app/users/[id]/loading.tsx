import PageLoader from "@/components/loading/PageLoader";

export default function UserLoadingPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--background)]">
      <PageLoader variant="spinner" size="md" text="A carregar perfil..." />
    </div>
  );
}
