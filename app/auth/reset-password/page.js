"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClient } from "@/libs/supabase/client";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, Key, ArrowRight, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Digite o seu email"); return; }
    setIsLoading(true);
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
      if (error) { toast.error("Erro ao enviar codigo. Verifique se o email esta correto."); return; }
      setIsOtpMode(true);
      toast.success("Codigo de 6 digitos enviado para o seu email!");
    } catch { toast.error("Erro inesperado. Tente novamente."); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) { toast.error("Digite o codigo de 6 digitos"); return; }
    setIsLoading(true);
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otpCode.trim(), type: "recovery" });
      if (error) { toast.error("Codigo invalido ou expirado."); return; }
      setIsResetMode(true);
      toast.success("Codigo verificado! Defina a sua nova password.");
    } catch { toast.error("Erro ao verificar codigo."); }
    finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("As senhas nao coincidem"); return; }
    if (password.length < 6) { toast.error("A password deve ter pelo menos 6 caracteres"); return; }
    setIsLoading(true);
    try {
      const supabase = getClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { toast.error("Erro ao atualizar password."); return; }
      setIsSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 2500);
    } catch { toast.error("Erro inesperado. Tente novamente."); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-purple-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Success */}
        {isSuccess && (
          <div className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Atualizada!</h2>
            <p className="text-white/40 text-sm">A sua password foi alterada com sucesso. A redirecionar...</p>
          </div>
        )}

        {/* Step 1: Email */}
        {!isOtpMode && !isSuccess && (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
                <Mail className="h-7 w-7 text-purple-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Recuperar Password</h1>
              <p className="text-white/40 text-sm">Introduza o seu email para receber um codigo de verificacao</p>
            </div>
            <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
              <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03]">
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-white/25" />
                      </div>
                      <input
                        id="email" name="email" type="email" autoComplete="email" required disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all disabled:opacity-50 min-h-[48px]"
                        placeholder="Endereco de email"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Enviar Codigo <ArrowRight className="h-4 w-4" /></>}
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
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
                <Key className="h-7 w-7 text-purple-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Verificar Codigo</h1>
              <p className="text-white/40 text-sm">Introduza o codigo de 6 digitos enviado para <span className="text-purple-400">{email}</span></p>
            </div>
            <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
              <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03]">
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label htmlFor="otpCode" className="sr-only">Codigo</label>
                    <input
                      id="otpCode" name="otpCode" type="text" maxLength={6} required disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all disabled:opacity-50 min-h-[48px] text-center text-2xl tracking-[0.5em] font-mono"
                      placeholder="000000"
                      value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verificar <ArrowRight className="h-4 w-4" /></>}
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
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
                <Lock className="h-7 w-7 text-purple-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Nova Password</h1>
              <p className="text-white/40 text-sm">Defina a sua nova password</p>
            </div>
            <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
              <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03]">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="sr-only">Nova Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white/25" />
                      </div>
                      <input
                        id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required disabled={isLoading}
                        className="w-full pl-12 pr-12 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all disabled:opacity-50 min-h-[48px]"
                        placeholder="Nova password (min. 6 caracteres)"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/25 hover:text-white/50 transition-colors">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">Confirmar Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-white/25" />
                      </div>
                      <input
                        id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required disabled={isLoading}
                        className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all disabled:opacity-50 min-h-[48px]"
                        placeholder="Confirmar password"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Atualizar Password <CheckCircle className="h-4 w-4" /></>}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        {!isSuccess && (
          <p className="text-center text-sm text-white/30 mt-6">
            <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Voltar ao login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
