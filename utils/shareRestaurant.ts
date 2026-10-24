import { logError, logInfo, logWarn } from '@/utils/logger';

export type ShareResult =
  | { status: 'shared' }
  | { status: 'copied' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

const PRIVATE_HOST = /^(127\.0\.0\.1|192\.168\.|10\.|172\.)/;

/** Valida um URL externo: só http(s), sem IPs privados, máx. 2048 caracteres. */
export function sanitizeUrl(urlString: string): string | null {
  if (!urlString || typeof urlString !== 'string') {
    logWarn('sanitizeUrl: entrada inválida', { type: typeof urlString });
    return null;
  }

  try {
    const sanitized = urlString.trim().replace(/[<>'"&]/g, '');
    if (sanitized !== urlString.trim()) {
      logWarn('sanitizeUrl: caracteres perigosos removidos', { original: urlString.substring(0, 100) });
    }

    const url = new URL(sanitized);
    if (!['http:', 'https:'].includes(url.protocol)) {
      logWarn('sanitizeUrl: protocolo inválido', { protocol: url.protocol });
      return null;
    }
    if (url.href.length > 2048) {
      logWarn('sanitizeUrl: URL demasiado longo', { length: url.href.length });
      return null;
    }
    if (PRIVATE_HOST.test(url.hostname.toLowerCase())) {
      logWarn('sanitizeUrl: IP privado bloqueado', { hostname: url.hostname });
      return null;
    }
    return url.href;
  } catch (error) {
    logWarn('sanitizeUrl: falha a interpretar o URL', {
      error: error instanceof Error ? error.message : 'Unknown error',
      originalUrl: urlString.substring(0, 100),
    });
    return null;
  }
}

/** Partilha o restaurante via Web Share, com clipboard como alternativa. */
export async function shareRestaurant(name: string, shareUrl: string): Promise<ShareResult> {
  if (!shareUrl || shareUrl.trim() === '') {
    return { status: 'error', message: 'Não foi possível compartilhar: URL não disponível' };
  }
  const url = sanitizeUrl(shareUrl);
  if (!url) {
    return { status: 'error', message: 'Não foi possível compartilhar: URL inválida' };
  }

  const shareData = {
    title: name || 'Restaurante',
    text: `Confira este restaurante: ${name || ''}`,
    url,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      logInfo('Restaurant shared successfully using Web Share API');
      return { status: 'shared' };
    }
    if (!navigator.clipboard) {
      return { status: 'error', message: 'Compartilhamento não suportado neste navegador. Copie o link manualmente.' };
    }
    await navigator.clipboard.writeText(url);
    return { status: 'copied' };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') return { status: 'cancelled' };
      logError('Failed to share restaurant', error, { shareData });
      if (error.name === 'NotAllowedError') {
        return { status: 'error', message: 'Compartilhamento não permitido. Verifique as permissões do navegador.' };
      }
      if (error.name === 'InvalidStateError') {
        return { status: 'error', message: 'Uma operação de compartilhamento já está em andamento. Aguarde e tente novamente.' };
      }
      return { status: 'error', message: 'Erro ao compartilhar. Tente novamente.' };
    }
    logError('Failed to share restaurant', error, { shareData });
    return { status: 'error', message: 'Erro desconhecido ao compartilhar.' };
  }
}
