/**
 * User-friendly error messages for FoodLister
 * Converts technical errors to messages users can understand
 */

/**
 * Get a user-friendly error message based on the error type
 */
export function getUserFriendlyError(error: unknown, context?: string): string {
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
    const err = error as Record<string, unknown>;
    if (err.error) {
      return getMessageFromApiError(err.error as string, context);
    }
    if (err.message) {
      return getMessageFromError(new Error(err.message as string), context);
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

/**
 * Enhanced error messages for common scenarios
 */
export const ENHANCED_ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Não foi possível conectar. Verifique sua internet e tente novamente.',
  TIMEOUT_ERROR: 'A operação expirou. Tente novamente.',
  
  // Authentication errors
  AUTH_REQUIRED: 'Faça login para acessar este recurso.',
  SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  EMAIL_IN_USE: 'Este email já está em uso. Tente fazer login.',
  EMAIL_NOT_CONFIRMED: 'Confirme seu email antes de continuar.',
  
  // Authorization errors
  UNAUTHORIZED: 'Você não tem permissão para realizar esta ação.',
  LIST_NOT_OWNER: 'Você só pode modificar suas próprias listas.',
  RESTAURANT_NOT_OWNER: 'Você só pode modificar restaurantes que criou.',
  
  // Not found errors
  LIST_NOT_FOUND: 'Lista não encontrada. Pode ter sido removida.',
  RESTAURANT_NOT_FOUND: 'Restaurante não encontrado. Pode ter sido removido.',
  REVIEW_NOT_FOUND: 'Avaliação não encontrada.',
  USER_NOT_FOUND: 'Usuário não encontrado.',
  
  // Validation errors
  REQUIRED_FIELDS: 'Preencha todos os campos obrigatórios.',
  INVALID_EMAIL: 'Digite um email válido.',
  INVALID_RATING: 'A nota deve ser entre 1 e 5.',
  INVALID_AMOUNT: 'O valor gasto deve ser maior que zero.',
  DUPLICATE_REVIEW: 'Você já avaliou este restaurante.',
  
  // Feature-specific errors
  LIST_CREATE_ERROR: 'Erro ao criar lista. Tente novamente.',
  LIST_UPDATE_ERROR: 'Erro ao atualizar lista. Tente novamente.',
  LIST_DELETE_ERROR: 'Erro ao remover lista. Tente novamente.',
  RESTAURANT_CREATE_ERROR: 'Erro ao adicionar restaurante. Tente novamente.',
  RESTAURANT_UPDATE_ERROR: 'Erro ao atualizar restaurante. Tente novamente.',
  REVIEW_CREATE_ERROR: 'Erro ao enviar avaliação. Tente novamente.',
  IMAGE_UPLOAD_ERROR: 'Erro ao enviar imagem. Tente outra imagem.',
  IMAGE_SIZE_ERROR: 'A imagem é muito grande. Use uma imagem menor que 5MB.',
  
  // Generic fallback
  UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.',
} as const;

export type EnhancedErrorMessageKey = keyof typeof ENHANCED_ERROR_MESSAGES;

/**
 * Get enhanced error message by key
 */
export function getEnhancedErrorMessage(key: EnhancedErrorMessageKey): string {
  return ENHANCED_ERROR_MESSAGES[key] || ENHANCED_ERROR_MESSAGES.UNKNOWN_ERROR;
}