/** Compara versões semver numericamente (0.10.0 > 0.9.0); partes em falta valem 0. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** Mais recente primeiro: `released_at` desc e, no empate (mesmo dia), versão desc. */
export function compareReleasesDesc(
  a: { version: string; released_at: string },
  b: { version: string; released_at: string },
): number {
  if (a.released_at !== b.released_at) return a.released_at < b.released_at ? 1 : -1;
  return compareVersions(b.version, a.version);
}
