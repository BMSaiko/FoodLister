/**
 * Política de Cache-Control por rota de API.
 * `private, no-store` por defeito; `public` só para dados de referência sem sessão.
 * Respeita o Cache-Control que a rota já definiu.
 */

export type CachePolicy =
  | { kind: 'private' }
  | { kind: 'public'; sMaxAge: number; staleWhileRevalidate: number };

export const privateNoStore: CachePolicy = { kind: 'private' };

export function publicCache(sMaxAge = 300, staleWhileRevalidate = 600): CachePolicy {
  return { kind: 'public', sMaxAge, staleWhileRevalidate };
}

export function cacheControlValue(policy: CachePolicy): string {
  return policy.kind === 'private'
    ? 'private, no-store'
    : `public, s-maxage=${policy.sMaxAge}, stale-while-revalidate=${policy.staleWhileRevalidate}`;
}

type HeadersLike = { has?: (k: string) => boolean; set?: (k: string, v: string) => void };

/** Define o Cache-Control na resposta se a rota ainda não o definiu. */
export function applyCachePolicy<T>(response: T, policy: CachePolicy): T {
  const res = response as { headers?: HeadersLike; status?: number } | null | undefined;
  const headers = res?.headers;
  if (headers && typeof headers.set === 'function' && !headers.has?.('Cache-Control')) {
    // Erros nunca ficam em cache público.
    const efetiva = policy.kind === 'public' && (res?.status ?? 200) >= 400 ? privateNoStore : policy;
    headers.set('Cache-Control', cacheControlValue(efetiva));
  }
  return response;
}

/** Envolve um handler de rota; só mexe na resposta, nunca nos argumentos. */
export function withCachePolicy<A extends unknown[], R>(
  policy: CachePolicy,
  handler: (...args: A) => Promise<R> | R
): (...args: A) => Promise<R> {
  return async (...args: A) => applyCachePolicy(await handler(...args), policy);
}
