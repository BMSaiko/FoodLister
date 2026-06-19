/**
 * Password validation utility functions
 */

/**
 * Validates password strength requirements
 * @param {string} password - The password to validate
 * @returns {Object} - Validation result with isValid and requirements status
 */
export function validatePassword(password) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const isValid = Object.values(requirements).every(req => req);

  return {
    isValid,
    requirements,
    message: getPasswordValidationMessage(requirements)
  };
}

/**
 * Generates validation message based on requirements status
 * @param {Object} requirements - The requirements status object
 * @returns {string} - User-friendly validation message
 */
export function getPasswordValidationMessage(requirements) {
  const messages = [];

  if (!requirements.minLength) {
    messages.push('Pelo menos 8 caracteres');
  }
  if (!requirements.hasUppercase) {
    messages.push('Pelo menos uma letra maiúscula (A-Z)');
  }
  if (!requirements.hasLowercase) {
    messages.push('Pelo menos uma letra minúscula (a-z)');
  }
  if (!requirements.hasNumber) {
    messages.push('Pelo menos um número (0-9)');
  }
  if (!requirements.hasSpecialChar) {
    messages.push('Pelo menos um caractere especial (!@#$%^&*)');
  }

  return messages.length > 0 ? messages.join(', ') : '';
}

/**
 * Gets password strength level
 * @param {string} password - The password to check
 * @returns {string} - Strength level: 'weak', 'medium', 'strong'
 */
export function getPasswordStrength(password) {
  if (!password) return 'weak';

  const { requirements } = validatePassword(password);
  const metRequirements = Object.values(requirements).filter(Boolean).length;

  if (metRequirements < 3) return 'weak';
  if (metRequirements < 5) return 'medium';
  return 'strong';
}
