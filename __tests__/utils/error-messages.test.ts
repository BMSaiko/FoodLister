import {
  getUserFriendlyError,
  getSuccessMessage,
  getEnhancedErrorMessage,
  ENHANCED_ERROR_MESSAGES,
} from '@/utils/error-messages';

describe('getUserFriendlyError', () => {
  it('returns string error as-is', () => {
    expect(getUserFriendlyError('Some error')).toBe('Some error');
  });

  it('handles network errors', () => {
    expect(getUserFriendlyError(new Error('Failed to fetch'))).toContain('conexão');
    expect(getUserFriendlyError(new Error('Network error'))).toContain('conexão');
  });

  it('handles timeout errors', () => {
    expect(getUserFriendlyError(new Error('Request timeout'))).toContain('demorou');
  });

  it('handles auth errors', () => {
    expect(getUserFriendlyError(new Error('Unauthorized'))).toContain('autenticação');
    expect(getUserFriendlyError(new Error('401'))).toContain('autenticação');
  });

  it('handles not found errors', () => {
    expect(getUserFriendlyError(new Error('Not found'))).toContain('não encontrado');
    expect(getUserFriendlyError(new Error('404'))).toContain('não encontrado');
  });

  it('handles validation errors', () => {
    expect(getUserFriendlyError(new Error('Invalid input'))).toContain('dados');
    expect(getUserFriendlyError(new Error('Required field'))).toContain('dados');
  });

  it('handles server errors', () => {
    expect(getUserFriendlyError(new Error('500 Internal Server Error'))).toContain('servidor');
  });

  it('handles rate limiting', () => {
    expect(getUserFriendlyError(new Error('429 Too Many Requests'))).toContain('Muitas tentativas');
  });

  it('handles API error objects', () => {
    expect(getUserFriendlyError({ error: 'Something failed' })).toBe('Something failed');
  });

  it('handles API error objects with message', () => {
    const result = getUserFriendlyError({ message: 'Network error' });
    expect(result).toContain('conexão');
  });

  it('returns default for unknown errors', () => {
    expect(getUserFriendlyError({})).toContain('inesperado');
  });

  it('returns context-specific default messages for empty errors', () => {
    expect(getUserFriendlyError(new Error(''), 'create')).toContain('criar');
    expect(getUserFriendlyError(new Error(''), 'update')).toContain('atualizar');
    expect(getUserFriendlyError(new Error(''), 'delete')).toContain('remover');
    expect(getUserFriendlyError(new Error(''), 'fetch')).toContain('carregar');
  });

  it('returns error message for unrecognized errors', () => {
    expect(getUserFriendlyError(new Error('unknown'))).toBe('unknown');
  });
});

describe('getSuccessMessage', () => {
  it('returns create message', () => {
    expect(getSuccessMessage('create', 'Restaurante')).toBe('Restaurante criado com sucesso!');
  });

  it('returns update message', () => {
    expect(getSuccessMessage('update', 'Lista')).toBe('Lista atualizado com sucesso!');
  });

  it('returns delete message', () => {
    expect(getSuccessMessage('delete', 'Avaliação')).toBe('Avaliação removido com sucesso!');
  });
});

describe('getEnhancedErrorMessage', () => {
  it('returns message for known keys', () => {
    expect(getEnhancedErrorMessage('NETWORK_ERROR')).toBe(ENHANCED_ERROR_MESSAGES.NETWORK_ERROR);
    expect(getEnhancedErrorMessage('AUTH_REQUIRED')).toBe(ENHANCED_ERROR_MESSAGES.AUTH_REQUIRED);
    expect(getEnhancedErrorMessage('INVALID_CREDENTIALS')).toBe(ENHANCED_ERROR_MESSAGES.INVALID_CREDENTIALS);
  });

  it('returns unknown error for invalid key', () => {
    expect(getEnhancedErrorMessage('INVALID_KEY' as any)).toBe(ENHANCED_ERROR_MESSAGES.UNKNOWN_ERROR);
  });
});

describe('ENHANCED_ERROR_MESSAGES', () => {
  it('has all expected keys', () => {
    const expectedKeys = [
      'NETWORK_ERROR', 'TIMEOUT_ERROR', 'AUTH_REQUIRED', 'SESSION_EXPIRED',
      'INVALID_CREDENTIALS', 'EMAIL_IN_USE', 'EMAIL_NOT_CONFIRMED',
      'UNAUTHORIZED', 'LIST_NOT_OWNER', 'RESTAURANT_NOT_OWNER',
      'LIST_NOT_FOUND', 'RESTAURANT_NOT_FOUND', 'REVIEW_NOT_FOUND', 'USER_NOT_FOUND',
      'REQUIRED_FIELDS', 'INVALID_EMAIL', 'INVALID_RATING', 'INVALID_AMOUNT',
      'DUPLICATE_REVIEW', 'LIST_CREATE_ERROR', 'LIST_UPDATE_ERROR', 'LIST_DELETE_ERROR',
      'RESTAURANT_CREATE_ERROR', 'RESTAURANT_UPDATE_ERROR', 'REVIEW_CREATE_ERROR',
      'IMAGE_UPLOAD_ERROR', 'IMAGE_SIZE_ERROR', 'UNKNOWN_ERROR',
    ];
    for (const key of expectedKeys) {
      expect(ENHANCED_ERROR_MESSAGES[key as keyof typeof ENHANCED_ERROR_MESSAGES]).toBeDefined();
    }
  });
});
