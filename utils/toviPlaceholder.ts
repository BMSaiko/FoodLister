export const TOVI_POSES = [
  "a-celebrar",
  "a-dormir",
  "a-pensar",
  "a-piscar-o-olho",
  "apaixonada",
  "feliz",
  "fixe",
  "surpreendida",
  "triste",
  "zangada",
] as const;

export function hashString(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return hash | 0;
}

/** Pose do Tovi estável por chave (nome): o mesmo nome dá sempre a mesma pose. */
export function toviSrc(key: string): string {
  return `/mascot/tovi-${TOVI_POSES[Math.abs(hashString(key)) % TOVI_POSES.length]}.svg`;
}
