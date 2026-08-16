// libs/slug.ts — resolução de URLs amigáveis (T64).
// ponytail: só o mínimo — detetar se o param é UUID (mantém links antigos) vs slug.
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}
