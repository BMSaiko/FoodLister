/**
 * Seeded random utilities — T76.
 * Deterministic PRNG seeded from user id + local YMD + seconds-of-day, so
 * every user gets fresh ordering each second (extra randomness). Pass
 * null/undefined userId for an anon seed.
 */
export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — tiny fast deterministic PRNG returning floats in [0,1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable seed string for today, scoped to a user (or anon). */
function userDaySeed(userId: string | null | undefined): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const seconds = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  return `${userId ?? 'anon'}:${ymd}:${seconds}`;
}

/** Fisher-Yates shuffle, seeded by user + day-of-seconds (T76). Deterministic per second. */
export function shuffleArray<T>(arr: T[], userId: string | null | undefined = null): T[] {
  const a = [...arr];
  const rand = mulberry32(hashString(userDaySeed(userId)));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick a single deterministic "random" item (user + day-of-seconds seed). */
export function pickSeeded<T>(arr: T[], userId: string | null | undefined = null): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  const rand = mulberry32(hashString(userDaySeed(userId)));
  return arr[Math.floor(rand() * arr.length)];
}
