"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("As senhas nao coincidem"); return; }
    if (password.length < 6) { toast.error("A password deve ter pelo menos 6 caracteres"); return; }
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) { toast.error("Erro ao criar conta: " + (error.message || "Tente novamente")); return; }
      router.push("/auth/signin?message=check-email");
    } catch (err) {
      toast.error("Erro inesperado. Tente novamente.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
            <User className="h-7 w-7 text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Criar Conta</h1>
          <p className="text-white/40 text-sm">Junta-te a comunidade FoodLister</p>
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
                    className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-colors disabled:opacity-50 min-h-[48px]"
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
                    id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-colors disabled:opacity-50 min-h-[48px]"
                    placeholder="Password (min. 6 caracteres)"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/25 hover:text-white/50 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirmar Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/25" />
                  </div>
                  <input
                    id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-colors disabled:opacity-50 min-h-[48px]"
                    placeholder="Confirmar password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-colors disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Criar Conta <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/30 mt-6">
          Ja tem conta?{" "}
          <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Faca login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
