import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

/**
 * Web Push send leg (T84) — complementary a subscribe (usePushNotifications).
 * Best-effort: sem subscription / sem VAPID keys -> no-op silencioso.
 * A notif in-app NUNCA depende deste send (fire-and-forget no caller).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ?? '';
const vapidSubject = process.env.VAPID_SUBJECT ?? 'mailto:foodlister@example.com';

const serviceClient = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// pontyail: inicializa VAPID uma vez; se faltarem chaves, send torna-se no-op.
const pushConfigured = !!(vapidPublicKey && vapidPrivateKey);
if (pushConfigured) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export interface WebPushPayload {
  title: string;
  message: string;
  link?: string | null;
  type: string;
}

/**
 * Envia uma push nativa ao browser do user, se tiver subscription gravada.
 * Nunca lança erros fora — falhas de expiração/limites sao silenciosas.
 */
export async function sendWebPush(userId: string, payload: WebPushPayload): Promise<void> {
  if (!pushConfigured || !serviceClient) return;

  const { data } = await serviceClient
    .from('notification_preferences')
    .select('push_subscription')
    .eq('user_id', userId)
    .maybeSingle();

  const payloadText = JSON.stringify({
    title: payload.title,
    message: payload.message,
    url: payload.link ?? '/',
    type: payload.type,
  });

  // ponytail: uma subscription (coluna JSONB única) por user; multi-device fica p/ depois.
  const sub = data?.push_subscription as { endpoint: string; keys?: { p256dh: string; auth: string } } | null | undefined;
  if (!sub?.endpoint) return;

  try {
    await webpush.sendNotification(sub as Parameters<typeof webpush.sendNotification>[0], payloadText);
  } catch (err) {
    // ponytail: subscription expirada/removida ou push indisponivel -> ignora, in-app mandou.
    console.warn('[WebPush] send failed (non-fatal):', err instanceof Error ? err.message : err);
  }
}
