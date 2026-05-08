/**
 * User-friendly error messages for FoodLister
 * Converts technical errors to messages users can understand
 */

/**
 * Get a user-friendly error message based on the error type
 */
export function getUserFriendlyError(error: any, context?: string): string {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }

  // If it's an Error object
  if (error instanceof Error) {
    return getMessageFromError(error, context);
  }

  // If it's an API error response
  if (error && typeof error === 'object') {
    if (error.error) {
      return getMessageFromApiError(error.error, context);
    }
    if (error.message) {
      return getMessageFromError(new Error(error.message), context);
    }
  }

  // Default error message
  return getDefaultErrorMessage(context);
}

/**
 * Extract message from Error object
 */
function getMessageFromError(error: Error, context?: string): string {
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('failed to fetch') || message.includes('network') || message.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('abort')) {
    return 'A operação demorou muito. Tente novamente.';
  }

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401') || message.includes('auth')) {
    return getAuthErrorMessage(error, context);
  }

  // Not found errors
  if (message.includes('not found') || message.includes('404')) {
    return getNotFoundMessage(context);
  }

  // Validation errors
  if (message.includes('required') || message.includes('invalid') || message.includes('400')) {
    return getValidationErrorMessage(context);
  }

  // Server errors
  if (message.includes('500') || message.includes('internal server')) {
    return 'Erro interno do servidor. Tente novamente mais tarde.';
  }

  // Rate limiting
  if (message.includes('429') || message.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }

  return error.message || getDefaultErrorMessage(context);
}

/**
 * Get message from API error string
 */
function getMessageFromApiError(errorStr: string, context?: string): string {
  const lowerError = errorStr.toLowerCase();

  if (lowerError.includes('unauthorized') || lowerError.includes('authentication')) {
    return getAuthErrorMessage(new Error(errorStr), context);
  }

  if (lowerError.includes('not found')) {
    return getNotFoundMessage(context);
  }

  if (lowerError.includes('failed to fetch') || lowerError.includes('connection')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }

  return errorStr;
}

/**
 * Get authentication error message
 */
function getAuthErrorMessage(error: Error, context?: string): string {
  const message = error.message.toLowerCase();

  if (message.includes('invalid credentials') || message.includes('wrong password')) {
    return 'Email ou senha incorretos. Tente novamente.';
  }

  if (message.includes('email not confirmed')) {
    return 'Confirme seu email antes de fazer login.';
  }

  if (message.includes('user not found')) {
    return 'Usuário não encontrado. Verifique seu email.';
  }

  if (message.includes('session')) {
    return 'Sua sessão expirou. Faça login novamente.';
  }

  return 'Erro de autenticação. Faça login novamente.';
}

/**
 * Get not found message based on context
 */
function getNotFoundMessage(context?: string): string {
  if (context === 'restaurant') {
    return 'Restaurante não encontrado. Pode ter sido removido.';
  }
  if (context === 'list') {
    return 'Lista não encontrada. Pode ter sido removida ou você não tem permissão para acessá-la.';
  }
  if (context === 'review') {
    return 'Avaliação não encontrada.';
  }
  if (context === 'user') {
    return 'Usuário não encontrado.';
  }
  return 'Recurso não encontrado.';
}

/**
 * Get validation error message
 */
function getValidationErrorMessage(context?: string): string {
  if (context === 'restaurant') {
    return 'Preencha todos os campos obrigatórios do restaurante.';
  }
  if (context === 'list') {
    return 'Preencha o nome da lista para continuar.';
  }
  if (context === 'review') {
    return 'Forneça uma avaliação válida com nota de 1 a 5.';
  }
  return 'Verifique os dados informados e tente novamente.';
}

/**
 * Get default error message based on context
 */
function getDefaultErrorMessage(context?: string): string {
  if (context === 'create') {
    return 'Erro ao criar. Tente novamente.';
  }
  if (context === 'update') {
    return 'Erro ao atualizar. Tente novamente.';
  }
  if (context === 'delete') {
    return 'Erro ao remover. Tente novamente.';
  }
  if (context === 'fetch') {
    return 'Erro ao carregar dados. Tente novamente.';
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Get success message
 */
export function getSuccessMessage(action: 'create' | 'update' | 'delete', item: string): string {
  const actions = {
    create: 'criado',
    update: 'atualizado',
    delete: 'removido',
  };
  return `${item} ${actions[action]} com sucesso!`;
}