"use client";

export const dynamic = "force-dynamic";

import React, { useState, Suspense } from "react";
import FadeLink from "@/components/auth/FadeLink";
import { useRouter } from "next/navigation";
import { useLanguage, useAuth } from "@/contexts";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useRandomToviMood } from "@/hooks/useRandomToviMood";
import ToviLoader from "@/components/loading/ToviLoader";
import ToviSpinner from "@/components/loading/ToviSpinner";

const EGG_MOODS = ["a-celebrar", "apaixonada", "a-piscar-o-olho", "fixe", "a-dormir", "surpreendida", "zangada", "triste", "a-pensar", "feliz"];
const MIN_LEN = 6;
const STRONG_LEN = 12;
const FIELD =
  "w-full min-h-[48px] pl-3.5 pr-[52px] bg-white/50 border border-black/30 hover:border-black/60 hover:bg-white/60 rounded-[10px] text-[#111] placeholder:text-black/55 focus:outline-none focus:bg-white/75 focus:border-[#111] focus:ring-[3px] focus:ring-black/20 transition-colors disabled:opacity-50 text-ellipsis aria-[invalid=true]:border-red-900";

const strength = (v) => (!v ? 0 : v.length < MIN_LEN ? 1 : v.length >= STRONG_LEN ? 3 : 2);

function EyeButton({ shown, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={shown}
      onClick={onClick}
      className="absolute right-0 top-[25.5px] h-12 min-w-[48px] flex items-center justify-center text-[#111]/70 hover:text-black transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-[22px] h-[22px]" aria-hidden="true">
        <path d="M3 15a9 9 0 0 1 18 0Z" fill={shown ? "currentColor" : "none"} fillOpacity={shown ? 0.18 : 0} />
        <path d="M2 18h20" />
        {shown ? <path d="M8 8l8 8" /> : <circle cx="12" cy="9.5" r="1.4" fill="currentColor" stroke="none" />}
      </svg>
    </button>
  );
}

function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwBad, setPwBad] = useState(false);
  const [cfBad, setCfBad] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [egg, setEgg] = useState({ n: 0, mood: null });
  const idleMood = useRandomToviMood();
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const level = strength(password);
  const mood = egg.mood || (serverError ? "triste" : cfBad ? "surpreendida" : isLoading || pwBad ? "a-pensar" : idleMood);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    const short = password.length < MIN_LEN;
    const diff = password !== confirmPassword;
    setPwBad(short);
    setCfBad(diff);
    if (short || diff) return;
    setIsLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) { setServerError(t("Erro ao criar conta: {error}", { error: error.message || t("Tente novamente") })); return; }
      router.push("/auth/signin?message=check-email");
    } catch (err) {
      setServerError(t("Erro inesperado. Tente novamente."));
    } finally { setIsLoading(false); }
  };

  return (
    <main className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center px-4 pt-4 pb-8 [background-image:radial-gradient(600px_300px_at_50%_0,rgba(245,158,11,.08),transparent)]">
      <div className="w-full max-w-[400px]">
        <div className="text-center">
          <button
            type="button" aria-label="Tovi" key={egg.n}
            onClick={() => setEgg(({ n, mood }) => ({ n: n + 1, mood: EGG_MOODS[(EGG_MOODS.indexOf(mood) + 1) % EGG_MOODS.length] }))}
            className={`block mx-auto mb-3 transition-transform duration-200 hover:scale-110 hover:-rotate-3 active:scale-95 ${egg.n ? "tovi-egg" : ""}`}
          >
            <img src={`/mascot/tovi-${mood}.svg`} alt="" className="block w-[72px] h-[72px] md:w-[84px] md:h-[84px]" />
          </button>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-white mb-1.5">{t("Criar Conta")}</h1>
          <p className="text-white/45 text-sm mb-5">{t("Junta-te à comunidade FoodLister")}</p>
        </div>

        <div className="p-5 md:p-7 rounded-2xl bg-[var(--primary)] border border-[var(--primary)] text-[#111] transition-shadow hover:shadow-[0_8px_40px_rgba(245,158,11,.18)]">
          {serverError && (
            <div role="alert" className="mb-4 px-3.5 py-2.5 rounded-[10px] border border-[#7f1d1d]/40 bg-[#7f1d1d]/10 text-[#7f1d1d] text-[13px]">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <label htmlFor="email" className="block text-[13px] font-medium mb-1.5">{t("Email")}</label>
              <input
                id="email" name="email" type="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck={false}
                enterKeyHint="next" autoComplete="email" required autoFocus disabled={isLoading}
                className={FIELD} placeholder={t("nome@exemplo.pt")}
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative mt-3.5">
              <label htmlFor="password" className="block text-[13px] font-medium mb-1.5">{t("Password")}</label>
              <input
                id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                enterKeyHint="next" required disabled={isLoading}
                aria-invalid={pwBad} aria-describedby={pwBad ? "err-pw" : undefined}
                className={FIELD} placeholder={t("Mínimo 6 caracteres")}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (pwBad && e.target.value.length >= MIN_LEN) setPwBad(false); }}
                onBlur={() => { if (password) setPwBad(password.length < MIN_LEN); }}
              />
              <EyeButton shown={showPassword} onClick={() => setShowPassword(!showPassword)} label={showPassword ? t("Ocultar password") : t("Mostrar password")} />
              {pwBad && <p id="err-pw" role="alert" className="text-[13px] text-[#7f1d1d] mt-1.5">{t("A password deve ter pelo menos 6 caracteres")}</p>}
              <div className="flex gap-1 mt-2" aria-hidden="true" data-level={level}>
                {[1, 2, 3].map((i) => (
                  <i key={i} className={`flex-1 h-[3px] rounded-sm transition-colors ${level >= i ? "bg-[#111]" : "bg-black/20"}`} />
                ))}
              </div>
            </div>

            <div className="relative mt-3.5">
              <label htmlFor="confirmPassword" className="block text-[13px] font-medium mb-1.5">{t("Confirmar password")}</label>
              <input
                id="confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password"
                enterKeyHint="done" required disabled={isLoading}
                aria-invalid={cfBad} aria-describedby={cfBad ? "err-cf" : undefined}
                className={FIELD} placeholder={t("Repita a password")}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (cfBad && e.target.value === password) setCfBad(false); }}
                onBlur={() => { if (confirmPassword) setCfBad(confirmPassword !== password); }}
              />
              <EyeButton shown={showConfirm} onClick={() => setShowConfirm(!showConfirm)} label={showConfirm ? t("Ocultar confirmação") : t("Mostrar confirmação")} />
              {cfBad && <p id="err-cf" role="alert" className="text-[13px] text-[#7f1d1d] mt-1.5">{t("As senhas não coincidem")}</p>}
            </div>

            <button
              type="submit" disabled={isLoading}
              className="mt-6 w-full min-h-[48px] rounded-[10px] bg-[#111] text-[var(--primary)] font-semibold hover:bg-black active:scale-[.98] transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? <ToviSpinner className="w-5 h-5" /> : t("Criar Conta")}
            </button>
          </form>

          <p className="text-center text-sm mt-3">
            {t("Já tem conta?")}{" "}
            <FadeLink href="/auth/signin" className="inline-flex items-center min-h-[44px] underline underline-offset-[3px] font-medium hover:underline-offset-[5px] transition-all">
              {t("Faça login")}
            </FadeLink>
          </p>
        </div>
      </div>
    </main>
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
