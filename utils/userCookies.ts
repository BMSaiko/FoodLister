// utils/userCookies.ts

// Constante para o nome do cookie
const USER_NAME_COOKIE = 'foodlister_username';

/**
 * Salva o nome do usuário em um cookie
 * @param name Nome do usuário a ser salvo
 * @param days Número de dias para expiração (padrão: 90 dias)
 */
export const saveUserName = (name: string, days = 90) => {
  try {
    // Definir data de expiração
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    
    // Formatar cookie com data de expiração
    const cookieValue = encodeURIComponent(name) + '; expires=' + expirationDate.toUTCString() + '; path=/';
    
    // Salvar cookie
    document.cookie = USER_NAME_COOKIE + '=' + cookieValue;
    
    // Também salvar no localStorage como fallback
    localStorage.setItem(USER_NAME_COOKIE, name);
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar cookie de nome de usuário:', error);
    return false;
  }
};

/**
 * Obtém o nome do usuário do cookie ou localStorage
 * @returns Nome do usuário ou null se não encontrado
 */
export const getUserName = (): string | null => {
  try {
    // Tentar obter do cookie
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(USER_NAME_COOKIE + '=')) {
        const value = cookie.substring((USER_NAME_COOKIE + '=').length);
        return decodeURIComponent(value);
      }
    }
    
    // Se não encontrar no cookie, tentar localStorage
    const localValue = localStorage.getItem(USER_NAME_COOKIE);
    if (localValue) {
      return localValue;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao ler cookie de nome de usuário:', error);
    return null;
  }
};

/**
 * Verifica se o nome do usuário já está definido
 * @returns true se o nome do usuário estiver definido, false caso contrário
 */
export const hasUserName = (): boolean => {
  return getUserName() !== null;
};