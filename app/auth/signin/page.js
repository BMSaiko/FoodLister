"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {useLanguage, useAuth } from "@/contexts";
import { usePageTitle } from "@/hooks/usePageTitle";
import ToviLoader from "@/components/loading/ToviLoader";
import ToviSpinner from '@/components/loading/ToviSpinner';

const EGG_MOODS = ["a-celebrar", "apaixonada", "a-piscar-o-olho", "fixe", "a-dormir", "surpreendida", "zangada", "triste", "a-pensar", "feliz"];

const inputBase = "w-full min-h-[48px] pl-3.5 bg-white/[0.03] border rounded-[10px] text-white/90 placeholder:text-white/25 focus:outline-none transition-colors disabled:opacity-50 text-ellipsis";
const inputOk = "border-white/[0.08] focus:border-[rgba(245,158,11,0.6)] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)]";
const inputBad = "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.15)]";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [unexpected, setUnexpected] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [egg, setEgg] = useState({ n: 0, mood: null });
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("message") === "check-email") setCheckEmail(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    setUnexpected(false);
    try {
      const { error } = await signIn(email, password);
      if (error) { setLoginError(error.message || t("Tente novamente")); return; }
      router.push("/restaurants");
    } catch (err) {
      setUnexpected(true);
    } finally { setIsLoading(false); }
  };

  const mascot = egg.mood || (unexpected ? "surpreendida" : loginError ? "triste" : (isLoading || checkEmail) ? "a-pensar" : "feliz");
  const bad = !!loginError;
  const banner = "px-3.5 py-2.5 rounded-[10px] text-[13px] mb-4 border";

  return (
    <main className="min-h-[100dvh] bg-[var(--background)] grid place-items-center px-4 pt-4 pb-10" style={{ backgroundImage: "radial-gradient(600px 300px at 50% 0, rgba(245,158,11,.08), transparent)" }}>
      <div className="w-full max-w-[400px]">
        <div className="text-center">
          <button
            type="button" aria-label="Tovi" key={egg.n}
            onClick={() => setEgg(({ n, mood }) => ({ n: n + 1, mood: EGG_MOODS[(EGG_MOODS.indexOf(mood) + 1) % EGG_MOODS.length] }))}
            className={`block mx-auto mb-3 ${egg.n ? "tovi-egg" : ""}`}
          >
            <img src={`/mascot/tovi-${mascot}.svg`} alt="" className="block w-[72px] h-[72px] sm:w-[84px] sm:h-[84px]" />
          </button>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] text-white mb-1.5">{t("Bem-vindo de volta")}</h1>
          <p className="text-sm text-white/45 mb-5">{t("Continua a organizar as tuas experiências gastronómicas")}.</p>
        </div>

        <div className="p-5 sm:p-7 border border-white/[0.08] rounded-2xl bg-white/[0.02]">
          {checkEmail && (
            <div role="status" className={`${banner} border-[var(--primary)]/30 bg-[var(--primary)]/[0.08] text-amber-300`}>
              {t("Verifique o seu email e clique no link de confirmação antes de fazer login.")}
            </div>
          )}
          {loginError && (
            <div role="alert" className={`${banner} border-red-400/30 bg-red-400/[0.08] text-red-400`}>
              {t("Erro ao fazer login: {error}", { error: loginError })}
            </div>
          )}
          {unexpected && (
            <div role="alert" className={`${banner} border-red-400/30 bg-red-400/[0.08] text-red-400`}>
              {t("Erro inesperado. Tente novamente.")}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-[13px] text-white/45 mb-1.5">{t("Email")}</label>
              <input
                id="email" name="email" type="email" autoComplete="email" required autoFocus disabled={isLoading}
                aria-invalid={bad} className={`${inputBase} pr-3.5 ${bad ? inputBad : inputOk}`}
                placeholder={t("nome@exemplo.pt")}
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
              {bad && <p className="text-[13px] text-red-400 mt-1.5">{t("Verifique o email.")}</p>}
            </div>

            <div className="mt-3.5">
              <div className="flex justify-between items-baseline">
                <label htmlFor="password" className="block text-[13px] text-white/45 mb-1.5">{t("Password")}</label>
                <Link href="/auth/reset-password" className="text-[13px] text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                  {t("Esqueceu a password?")}
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={isLoading}
                  aria-invalid={bad} className={`${inputBase} pr-[52px] ${bad ? inputBad : inputOk}`}
                  placeholder={t("Password")}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLock(!!e.getModifierState?.("CapsLock"))}
                  onBlur={() => setCapsLock(false)}
                />
                <button
                  type="button" aria-label={showPassword ? t("Ocultar password") : t("Mostrar password")} aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-0 top-0 h-12 min-w-[48px] flex items-center justify-center transition-colors ${showPassword ? "text-[var(--primary)]" : "text-white/45 hover:text-[var(--primary)]"}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-[22px] h-[22px]" aria-hidden="true">
                    <path d="M3 15a9 9 0 0 1 18 0Z" fill={showPassword ? "currentColor" : "none"} fillOpacity={showPassword ? 0.18 : 0} />
                    <path d="M2 18h20" />
                    {showPassword ? <path d="M8 8l8 8" /> : <circle cx="12" cy="9.5" r="1.4" fill="currentColor" stroke="none" />}
                  </svg>
                </button>
              </div>
              {bad && <p className="text-[13px] text-red-400 mt-1.5">{t("Email ou password incorretos.")}</p>}
              {capsLock && <p className="text-xs text-amber-300 mt-1.5">{t("Caps Lock ligado")}</p>}
            </div>

            <button
              type="submit" disabled={isLoading}
              className="mt-4 w-full min-h-[48px] rounded-[10px] bg-[var(--primary)] text-[#111] font-semibold hover:bg-[var(--primary-hover)] active:scale-[0.98] transition disabled:opacity-60 flex items-center justify-center"
            >
              {isLoading ? <ToviSpinner className="w-5 h-5" /> : t("Entrar")}
            </button>
          </form>

          <p className="text-center text-sm text-white/45 mt-3">
            {t("Não tem conta?")}{" "}
            <Link href="/auth/signup" className="inline-flex items-center min-h-[44px] text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors">
              {t("Crie uma gratuita")}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SigninPage() {
  const { t } = useLanguage();
  usePageTitle(t("Entrar - FoodLister"));
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center">
        <ToviLoader size="sm" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
