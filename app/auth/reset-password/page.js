"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClient } from "@/libs/supabase/client";
import { toast } from "react-toastify";
import { useLanguage } from "@/contexts";
import { usePageTitle } from "@/hooks/usePageTitle";
import ToviLoader from "@/components/loading/ToviLoader";
import ToviSpinner from '@/components/loading/ToviSpinner';
import Icon from '@/components/ui/icons/Icon';

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error(t("Digite o seu email")); return; }
    setIsLoading(true);
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
      if (error) { toast.error(t("Erro ao enviar código. Verifique se o email está correto.")); return; }
      setIsOtpMode(true);
      toast.success(t("Código de 6 dígitos enviado para o seu email!"));
    } catch { toast.error(t("Erro inesperado. Tente novamente.")); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) { toast.error(t("Digite o código de 6 dígitos")); return; }
    setIsLoading(true);
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otpCode.trim(), type: "recovery" });
      if (error) { toast.error(t("Código inválido ou expirado.")); return; }
      setIsResetMode(true);
      toast.success(t("Código verificado! Defina a sua nova password."));
    } catch { toast.error(t("Erro ao verificar código.")); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError("");
    if (password !== confirmPassword) { setFormError(t("As senhas não coincidem")); return; }
    if (password.length < 6) { setFormError(t("A password deve ter pelo menos 6 caracteres")); return; }
    setIsLoading(true);
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { toast.error(t("Erro ao atualizar password.")); return; }
      setIsSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 2500);
    } catch { toast.error(t("Erro inesperado. Tente novamente.")); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-[var(--primary)]/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[var(--primary)]/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Success */}
        {isSuccess && (
          <div className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Icon name="ok-circulo" className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t("Password Atualizada!")}</h2>
            <p className="text-white/40 text-sm">{t("A sua password foi alterada com sucesso. A redirecionar...")}</p>
          </div>
        )}

        {/* Step 1: Email */}
        {!isOtpMode && !isSuccess && (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--primary-lighter)] ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
                <Icon name="mail" className="h-7 w-7 text-[var(--primary)]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{t("Recuperar Password")}</h1>
              <p className="text-white/40 text-sm">{t("Introduza o seu email para receber um código de verificação")}</p>
            </div>
            <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
              <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03]">
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="sr-only">{t("Email")}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon name="mail" className="h-5 w-5 text-white/25" />
                      </div>
                      <input
                        id="email" name="email" type="email" autoComplete="email" required disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/30 transition-colors disabled:opacity-50 min-h-[48px]"
                        placeholder={t("Endereço de email")}
                        value={email} onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-colors disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {isLoading ? <ToviSpinner className="w-5 h-5" /> : <>{t("Enviar Código")} <Icon name="seta-dir" className="h-4 w-4" /></>}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Step 2: OTP */}
        {isOtpMode && !isResetMode && !isSuccess && (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--primary-lighter)] ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
                <Icon name="chave" className="h-7 w-7 text-[var(--primary)]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{t("Verificar Código")}</h1>
              <p className="text-white/40 text-sm">{t("Introduza o código de 6 dígitos enviado para ")}<span className="text-[var(--primary)]">{email}</span></p>
            </div>
            <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
              <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03]">
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label htmlFor="otpCode" className="sr-only">{t("Código")}</label>
                    <input
                      id="otpCode" name="otpCode" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} required disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/30 transition-colors disabled:opacity-50 min-h-[48px] text-center text-2xl tracking-[0.5em] font-mono"
                      placeholder="000000"
                      value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-colors disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {isLoading ? <ToviSpinner className="w-5 h-5" /> : <>{t("Verificar")} <Icon name="seta-dir" className="h-4 w-4" /></>}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Step 3: New Password */}
        {isResetMode && !isSuccess && (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--primary-lighter)] ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
                <Icon name="privado" className="h-7 w-7 text-[var(--primary)]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">{t("Nova Password")}</h1>
              <p className="text-white/40 text-sm">{t("Defina a sua nova password")}</p>
            </div>
            <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
              <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03]">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="sr-only">{t("Nova Password")}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon name="privado" className="h-5 w-5 text-white/25" />
                      </div>
                      <input
                        id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required disabled={isLoading}
                        className="w-full pl-12 pr-12 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/30 transition-colors disabled:opacity-50 min-h-[48px]"
                        placeholder={t("Nova password (min. 6 caracteres)")}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" aria-label={showPassword ? t("Ocultar password") : t("Mostrar password")} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 min-w-[48px] justify-center flex items-center text-white/25 hover:text-white/50 transition-colors">
                        {showPassword ? <Icon name="olho-off" className="h-5 w-5" /> : <Icon name="olho" className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">{t("Confirmar Password")}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon name="privado" className="h-5 w-5 text-white/25" />
                      </div>
                      <input
                        id="confirmPassword" name="confirmPassword" type="password" aria-invalid={!!formError} aria-describedby={formError ? "form-error" : undefined} autoComplete="new-password" required disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]/30 transition-colors disabled:opacity-50 min-h-[48px]"
                        placeholder={t("Confirmar password")}
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  {formError && <p id="form-error" role="alert" className="text-sm text-red-400">{formError}</p>}
                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-colors disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {isLoading ? <ToviSpinner className="w-5 h-5" /> : <>{t("Atualizar Password")} <Icon name="ok-circulo" className="h-4 w-4" /></>}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        {!isSuccess && (
          <p className="text-center text-sm text-white/30 mt-6">
            <Link href="/auth/signin" className="inline-flex items-center min-h-[44px] text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors">
              {t("Voltar ao login")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  usePageTitle(t("Repor palavra-passe - FoodLister"));
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center">
        <ToviLoader size="sm" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
