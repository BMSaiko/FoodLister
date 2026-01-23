'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Mail, Lock, LogIn, ChefHat, Sparkles, Utensils } from 'lucide-react';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'check-email') {
      toast.info('Verifique seu email e clique no link de confirmação antes de fazer login.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const { error } = await signIn(email, password);

    setIsLoading(false);

    if (!error) {
      // Check if toast was already shown in this session
      const toastShown = sessionStorage.getItem('loginToastShown');
      if (!toastShown) {
        // Show success toast
        toast.success('Login realizado com sucesso!');
        // Mark that toast was shown
        sessionStorage.setItem('loginToastShown', 'true');
      }
      // Redirect to restaurants page
      router.push('/restaurants');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Floating decorative elements - optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-12 h-12 sm:w-16 sm:h-16 bg-amber-300 rounded-full opacity-50 animate-pulse transition-all duration-1000 shadow-lg"></div>
        <ChefHat className="absolute top-60 right-10 w-6 h-6 sm:w-8 sm:h-8 text-amber-600 opacity-70 animate-bounce transition-all duration-1000 delay-700 drop-shadow-md" />
        <div className="absolute bottom-1/3 right-5 w-4 h-4 sm:w-5 sm:h-5 bg-orange-400 rounded-full opacity-55 animate-bounce transition-all duration-1000 delay-1500"></div>
        <div className="absolute top-40 right-20 w-8 h-8 sm:w-12 sm:h-12 bg-orange-400 rounded-full opacity-45 animate-bounce transition-all duration-1000 delay-300 shadow-md hidden sm:block"></div>
        <div className="absolute bottom-40 left-20 w-6 h-6 sm:w-10 sm:h-10 bg-yellow-400 rounded-full opacity-55 animate-pulse transition-all duration-1000 delay-500 shadow-lg hidden sm:block"></div>
        <Utensils className="absolute top-32 left-1/3 w-4 h-4 sm:w-5 sm:h-5 text-amber-600 opacity-60 animate-bounce transition-all duration-1000 delay-900 hidden sm:block" />
        <div className="absolute bottom-20 right-1/3 w-3 h-3 sm:w-4 sm:h-4 bg-orange-600 rounded-full opacity-65 animate-pulse transition-all duration-1000 delay-1100 hidden sm:block"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <LogIn className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo de volta!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Continue organizando suas experiências gastronômicas
            </p>
            <p className="text-sm text-gray-500">
              Ou{' '}
              <Link
                href="/auth/signup"
                className="font-semibold text-amber-600 hover:text-orange-600 transition-colors duration-200"
              >
                crie uma nova conta gratuita
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-amber-100/50">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-amber-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none relative block w-full pl-12 pr-4 py-3 border border-amber-200 placeholder-amber-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="Endereço de email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-amber-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="appearance-none relative block w-full pl-12 pr-12 py-3 border border-amber-200 placeholder-amber-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <button
                        type="button"
                        className="text-amber-500 hover:text-amber-700 focus:outline-none transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-sm">
                  <Link
                    href="/auth/reset-password"
                    className="font-medium text-amber-600 hover:text-orange-600 transition-colors duration-200"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                      Entrar
                      <Sparkles className="w-4 h-4 transition-transform group-hover:-rotate-12" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
