"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {useLanguage,  useAuth } from "@/contexts";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import ToviLoader from "@/components/loading/ToviLoader";
import ToviSpinner from '@/components/loading/ToviSpinner';

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (password !== confirmPassword) { setFormError(t("As senhas não coincidem")); return; }
    if (password.length < 6) { setFormError(t("A password deve ter pelo menos 6 caracteres")); return; }
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) { toast.error(t("Erro ao criar conta: {error}", { error: error.message || t("Tente novamente") })); return; }
      router.push("/auth/signin?message=check-email");
    } catch (err) {
      toast.error(t("Erro inesperado. Tente novamente."));
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[var(--primary)]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[var(--primary)]/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--primary-lighter)] ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
            <User className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{t("Criar Conta")}</h1>
          <p className="text-white/40 text-sm">{t("Junta-te à comunidade FoodLister")}</p>
        </div>

        {/* Card */}
        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="sr-only">{t("Email")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/25" />
                  </div>
                  <input
                    id="email" name="email" type="email" autoComplete="email" required disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/30 transition-colors disabled:opacity-50 min-h-[48px]"
                    placeholder={t("Endereço de email")}
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="sr-only">{t("Password")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/25" />
                  </div>
                  <input
                    id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/30 transition-colors disabled:opacity-50 min-h-[48px]"
                    placeholder={t("Password (min. 6 caracteres)")}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" aria-label={showPassword ? t("Ocultar password") : t("Mostrar password")} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 min-w-[48px] justify-center flex items-center text-white/25 hover:text-white/50 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="sr-only">{t("Confirmar Password")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/25" />
                  </div>
                  <input
                    id="confirmPassword" name="confirmPassword" type="password" aria-invalid={!!formError} aria-describedby={formError ? "form-error" : undefined} autoComplete="new-password" required disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/30 transition-colors disabled:opacity-50 min-h-[48px]"
                    placeholder={t("Confirmar password")}
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit */}
              {formError && <p id="form-error" role="alert" className="text-sm text-red-400">{formError}</p>}
              <button
                type="submit" disabled={isLoading}
                className="w-full py-3.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-colors disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <ToviSpinner className="w-5 h-5" />
                ) : (
                  <>{t("Criar Conta")} <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/30 mt-6">
          {t("Já tem conta?")}{" "}
          <Link href="/auth/signin" className="inline-flex items-center min-h-[44px] text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors">
            {t("Faça login")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { t } = useLanguage();
  usePageTitle(t("Criar conta - FoodLister"));
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center">
        <ToviLoader size="sm" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
