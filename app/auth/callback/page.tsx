"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getClient } from "@/libs/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function AuthCallbackPage() {
  usePageTitle("Confirmar conta - FoodLister");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const finish = async () => {
      // PKCE flow: exchange the ?code= from the email confirmation link,
      // then land on the existing success page ("Email Verificado!" + Fazer Login).
      if (code) {
        await getClient().auth.exchangeCodeForSession(code);
      }
      router.replace("/auth/verify/success");
    };
    finish();
  }, [searchParams, router]);

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] flex items-center justify-center p-4">
      <p className="text-white/50 text-sm">A confirmar a sua conta...</p>
    </div>
  );
}
