import { useCallback } from 'react';
import { toast } from 'react-toastify';

interface ShareOptions {
  title?: string;
  text?: string;
  url: string;
}

interface UseShareReturn {
  share: (options: ShareOptions) => Promise<void>;
  isSupported: boolean;
}

/**
 * Hook reutilizável para partilha de conteúdo.
 * Usa Web Share API quando disponível, com fallback para clipboard copy.
 */
export function useShare(): UseShareReturn {
  const isSupported = useCallback(() => {
    return typeof navigator !== 'undefined' && !!navigator.share;
  }, []);

  const share = useCallback(async ({ title, text, url }: ShareOptions) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

    if (isSupported()) {
      try {
        await navigator.share({
          title: title || 'FoodLister',
          text: text || 'Vê isto no FoodLister!',
          url: fullUrl,
        });
        toast.success('Partilhado com sucesso!');
      } catch (error: any) {
        // User cancelled share or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to clipboard
          await copyToClipboard(fullUrl, text);
        }
      }
    } else {
      // Fallback to clipboard
      await copyToClipboard(fullUrl, text);
    }
  }, [isSupported]);

  return { share, isSupported: isSupported() };
}

/**
 * Função auxiliar para copiar para clipboard
 */
async function copyToClipboard(url: string, text?: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url);
    toast.success(`Link copiado para a área de transferência!${text ? ` - ${text}` : ''}`);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      toast.success('Link copiado para a área de transferência!');
    } catch (err) {
      toast.error('Erro ao copiar o link');
    }
    document.body.removeChild(textArea);
  }
}

export default useShare;