// Domínios permitidos em `next.config.mjs` (images.remotePatterns). Manter em sincronia (há teste).
export const OPTIMIZABLE_HOSTS: readonly string[] = [
  'images.unsplash.com',
  'source.unsplash.com',
  'i.imgur.com',
  'res.cloudinary.com',
  'images.pexels.com',
  'picsum.photos',
  'upload.wikimedia.org',
  'cdn.discordapp.com',
  'lh5.googleusercontent.com',
  'lh3.googleusercontent.com',
  'imgur.com',
  'kgzeoyubgchhvfmtyqsk.supabase.co',
  'tile.openstreetmap.org',
];

/** true se `next/image` pode otimizar o `src` (caminho local ou domínio em remotePatterns). SVG fica de fora. */
export function isOptimizable(src: unknown): src is string {
  if (typeof src !== 'string' || !src) return false;
  if (src.startsWith('data:') || src.startsWith('blob:') || /\.svg(\?|$)/i.test(src)) return false;
  if (src.startsWith('/') && !src.startsWith('//')) return true;
  try {
    const u = new URL(src);
    return u.protocol === 'https:' && OPTIMIZABLE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}
