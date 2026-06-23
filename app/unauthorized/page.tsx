import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
          Acesso Negado
        </h1>
        <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Não tens permissão para aceder a esta área. Apenas administradores podem ver o dashboard admin.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: 'var(--primary)', color: 'white' }}
        >
          Voltar à Página Inicial
        </Link>
      </div>
    </div>
  );
}

