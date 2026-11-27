import Image from 'next/image';
import { isOptimizable } from '@/libs/imageHosts';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** `sizes` do `next/image` (obrigatório para escolher a largura certa) */
  sizes: string;
  /** só a imagem LCP */
  priority?: boolean;
}

/**
 * Preenche o contentor pai (que deve ser `relative` e ter dimensões, sem layout shift).
 * Usa `next/image` quando o domínio está em `remotePatterns`; senão cai para `<img>` (fallback preservado).
 */
export default function SmartImage({ src, alt, className = '', sizes, priority = false }: SmartImageProps) {
  if (isOptimizable(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} className={`absolute inset-0 h-full w-full ${className}`} />
  );
}
