"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useVerification } from "@/hooks/auth/useVerification";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, loading: hookLoading } = useVerification();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (!token || type !== "email") {
      setStatus("error");
      setErrorMessage("Token de verificação inválido ou em falta.");
      return;
    }

    const handleVerification = async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          router.push("/auth/verify/success");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage(
          result.error?.message || "Falha ao verificar o email. O token pode ter expirado."
        );
      }
    };

    handleVerification();
  }, [searchParams, verifyEmail, router]);

  return (
    <div className="min-min-h-[100dvh] bg-[var(--background)] relative overflow-hidden flex items-center justify-center p-4">
      {/* Mesh gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        {/* Premium email icon with gradient */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-white/[0.08] flex items-center justify-center mb-6">
            <Mail className="h-7 w-7 text-purple-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
            Verificação de Email
          </h1>
        </div>

        {/* Double-Bezel card */}
        <div className="p-1.5 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03]">
            {status === "loading" && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/[0.08] border-t-purple-500 mx-auto mb-4" />
                <p className="text-white/50">A verificar o seu email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-green-500/20">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-400 font-medium text-lg mb-2">
                  Email verificado com sucesso!
                </p>
                <p className="text-white/40 text-sm">
                  A redirecionar...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-red-500/20">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-400 font-medium text-lg mb-2">
                  Falha na verificação
                </p>
                <p className="text-white/40 text-sm mb-6">{errorMessage}</p>
                <div className="space-y-3">
                  <Link
                    href="/auth/signin"
                    className="block w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-colors text-center min-h-[48px]"
                  >
                    Ir para Login
                  </Link>
                  <Link
                    href="/"
                    className="block w-full py-3 bg-white/[0.03] border border-white/[0.08] text-white/70 rounded-xl hover:bg-white/[0.06] transition-colors text-center min-h-[48px]"
                  >
                    Página Inicial
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
