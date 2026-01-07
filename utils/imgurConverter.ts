/**
 * Conversor de URLs do Imgur para formato de imagem direta
 * Suporta vários formatos de URL do Imgur
 */

export function convertImgurUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;

  // Se já for uma URL direta de imagem, retorna como está
  if (url.includes('imgur.com') && url.includes('.')) {
    // Formatos suportados:
    // https://imgur.com/a/ABC123#ID - álbum com ID específico
    // https://imgur.com/ABC123 - imagem única
    // https://i.imgur.com/ABC123.jpg - já é URL direta

    // Se já é URL direta (i.imgur.com), retorna
    if (url.includes('i.imgur.com')) {
      return url;
    }

    // Extrai o ID da imagem
    let imageId = '';

    // Tenta capturar ID do formato de álbum com hash: imgur.com/a/ABC123#ID
    if (url.includes('/a/') && url.includes('#')) {
      const hashPart = url.split('#')[1];
      if (hashPart) {
        imageId = hashPart;
      }
    }

    // Se não encontrou ID no hash, tenta capturar do padrão normal
    if (!imageId) {
      // Extrai o ID do path (último segmento após /)
      const matches = url.match(/imgur\.com\/(?:a\/)?([a-zA-Z0-9]+)/);
      if (matches && matches[1]) {
        imageId = matches[1];
      }
    }

    if (imageId) {
      // Usa a URL direta do Imgur com largura e altura para melhor performance
      // Format: https://i.imgur.com/{ID}l.jpg (l = large size)
      return `https://i.imgur.com/${imageId}l.jpg`;
    }
  }

  return url;
}

/**
 * Valida se é uma URL do Imgur válida
 */
export function isValidImgurUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('imgur.com');
}

/**
 * Extrai o ID da imagem de uma URL do Imgur
 */
export function extractImgurImageId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  // Tenta capturar do formato de álbum com hash
  if (url.includes('#')) {
    const hashPart = url.split('#')[1];
    if (hashPart && /^[a-zA-Z0-9]+$/.test(hashPart)) {
      return hashPart;
    }
  }

  // Tenta capturar do padrão normal
  const matches = url.match(/imgur\.com\/(?:a\/)?([a-zA-Z0-9]+)/);
  if (matches && matches[1]) {
    return matches[1];
  }

  return null;
}
