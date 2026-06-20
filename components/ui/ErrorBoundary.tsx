'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[${this.props.pageName || 'Unknown'}] ErrorBoundary caught:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[var(--error-light)] flex items-center justify-center mb-6">
              <AlertTriangle className="h-8 w-8 text-[var(--error)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
              Algo correu mal
            </h2>
            <p className="text-sm text-[var(--foreground-secondary)] mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--gray-200)] text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors min-h-[44px]"
              >
                <Home className="h-4 w-4" />
                Página inicial
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
