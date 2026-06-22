"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");
    if (message === "check-email") {
      toast.info("Verifique o seu email e clique no link de confirmacao antes de fazer login.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) { toast.error("Erro ao fazer login: " + (error.message || "Tente novamente")); return; }
      router.push("/restaurants");
    } catch (err) {
      toast.error("Erro inesperado. Tente novamente.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
            <ArrowRight className="h-7 w-7 text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Bem-vindo de volta</h1>
          <p className="text-white/40 text-sm">Continua a organizar as tuas experiencias gastronomicas</p>
        </div>

        {/* Card */}
        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
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

              {/* Password */}
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/25" />
                  </div>
                  <input
                    id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all disabled:opacity-50 min-h-[48px]"
                    placeholder="Password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/25 hover:text-white/50 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <Link href="/auth/reset-password" className="text-xs text-purple-400/70 hover:text-purple-400 transition-colors">
                  Esqueceu a password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Entrar <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/30 mt-6">
          Nao tem conta?{" "}
          <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Crie uma gratuita
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
