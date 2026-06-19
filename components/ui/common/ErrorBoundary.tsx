"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-[var(--background-secondary)] rounded-[var(--radius-xl)]">
          <div className="text-[var(--error)] text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Algo correu mal</h2>
          <p className="text-[var(--foreground-secondary)] text-center mb-4">
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[var(--primary-hover)] text-[var(--primary-foreground)] rounded-[var(--radius-lg)] hover:bg-[var(--primary-dark)] transition-colors"
          >
            Tentar novamente
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-4 p-4 bg-[var(--gray-900)] text-[var(--error-light)] rounded-[var(--radius-lg)] text-sm overflow-auto max-w-lg">
              {this.state.error.message}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;