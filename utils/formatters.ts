// utils/formatters.ts
// Funções de formatação para valores comuns do aplicativo

/**
 * Formata um preço para exibição com símbolo de Euro
 * @param price - Preço a ser formatado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada com preço
 */
export const formatPrice = (price: number, decimals: number = 2): string => {
    return `€${price.toFixed(decimals)}`;
  };
  
  /**
   * Categoriza o preço de um restaurante
   * @param price - Preço a categorizar
   * @returns Objeto com rótulo e nível de preço
   */
  export const categorizePriceLevel = (price: number): { label: string; level: number } => {
    if (price <= 20) return { label: 'Econômico', level: 1 };
    if (price <= 40) return { label: 'Moderado', level: 2 };
    if (price <= 70) return { label: 'Elevado', level: 3 };
    return { label: 'Luxo', level: 4 };
  };
  
  /**
   * Retorna classe CSS com base na avaliação
   * @param rating - Avaliação a ser categorizada
   * @returns String com classes CSS para estilização
   */
  export const getRatingClass = (rating: number): string => {
    if (rating >= 4.5) return 'bg-green-100 text-green-700';
    if (rating >= 3.5) return 'bg-amber-100 text-amber-700';
    if (rating >= 2.5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };
  
  /**
   * Formata uma data do tipo ISO para exibição local
   * @param dateString - String de data ISO
   * @returns Data formatada para exibição local
   */
  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  /**
   * Trunca texto para determinado tamanho, adicionando elipses se necessário
   * @param text - Texto a ser truncado
   * @param maxLength - Tamanho máximo do texto (padrão: 100)
   * @returns Texto truncado
   */
  export const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };