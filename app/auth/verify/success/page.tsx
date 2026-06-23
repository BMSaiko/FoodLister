"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Home } from "lucide-react";

export default function VerifySuccessPage() {
  return (
    <div className="min-h-[100dvh] bg-[var(--background)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-green-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-emerald-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        {/* Premium success icon with gradient */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 ring-1 ring-green-500/20 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
            Email Verificado!
          </h1>
        </div>

        {/* Double-Bezel card */}
        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03] text-center">
            <p className="text-white/60 mb-8 leading-relaxed">
              O seu email foi verificado com sucesso. Agora tem acesso a todas as funcionalidades do FoodLister.
            </p>

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-colors min-h-[48px]"
              >
                Fazer Login <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/[0.03] border border-white/[0.08] text-white/70 rounded-xl hover:bg-white/[0.06] transition-colors min-h-[48px]"
              >
                <Home className="h-4 w-4" /> Ir para Página Inicial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
