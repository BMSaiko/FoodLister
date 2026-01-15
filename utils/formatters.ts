export function formatDate(dateString: string): string {
  if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
    return 'Data inválida';
  }

  const trimmedDateString = dateString.trim();
  const date = new Date(trimmedDateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }

  return date.toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function categorizePriceLevel(price: number) {
  if (price <= 10) return { label: 'Econômico', level: 1 };
  if (price <= 20) return { label: 'Moderado', level: 2 };
  if (price <= 50) return { label: 'Elevado', level: 3 };
  return { label: 'Luxo', level: 4 };
}

export function getRatingClass(rating: number): string {
  if (rating >= 4.5) return 'bg-green-100 text-green-700';
  if (rating >= 3.5) return 'bg-amber-100 text-amber-700';
  if (rating >= 2.5) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export function formatPrice(price: number): string {
  return `€${price.toFixed(2)}`;
}

/**
 * Formats a restaurant description by detecting paragraphs
 * Splits text by any newlines (\n) to create paragraphs
 * @param description - The plain text description
 * @returns Array of paragraph strings or null if empty
 */
export function formatDescription(description: string): string[] | null {
  if (!description || typeof description !== 'string') return null;

  // Split by any newlines to detect paragraphs
  // Handle both \r\n and \n line endings
  const paragraphs = description.split(/\r?\n/).filter(p => p.trim().length > 0);

  if (paragraphs.length === 0) return null;

  // Trim each paragraph
  return paragraphs.map(p => p.trim());
}

/**
 * Creates a preview of description for cards (first paragraph only)
 * @param description - The plain text description
 * @returns First paragraph of the description, truncated if too long
 */
export function getDescriptionPreview(description: string): string {
  if (!description || typeof description !== 'string') return '';

  const firstParagraph = description.split(/\r?\n/)[0]?.trim();
  if (!firstParagraph) return '';

  // Normalize whitespace: replace multiple whitespace characters with single space
  const normalizedText = firstParagraph.replace(/\s+/g, ' ');

  // Split by single space and filter out empty strings
  const words = normalizedText.split(' ').filter(word => word.length > 0);

  // For card previews, limit to reasonable length
  if (words.length <= 20) return normalizedText;

  return words.slice(0, 20).join(' ') + '...';
}

/**
 * Validates a phone number for security and format compliance
 * - Must be in E.164 format (starting with + followed by country code)
 * - Only allows digits, spaces, hyphens, parentheses, and +
 * - Must be between 7-15 digits (excluding formatting characters)
 * - Must not contain malicious characters or scripts
 * @param phone - The phone number string to validate
 * @returns true if valid, false otherwise
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;

  // Remove all formatting characters to count digits
  const digitsOnly = phone.replace(/[\s\-\(\)\+]/g, '');

  // Must contain only valid characters: digits, spaces, hyphens, parentheses, +
  if (!/^[+\-\(\)\s\d]+$/.test(phone)) return false;

  // Must have at least 7 digits and at most 15 digits (E.164 standard)
  if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;

  // Must start with + for international format (E.164)
  if (!phone.startsWith('+')) return false;

  // Check for potential XSS or injection attempts
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /alert\(/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(phone)) return false;
  }

  return true;
}

/**
 * Normalizes a phone number to E.164 format
 * - Removes all formatting characters except digits and +
 * - Ensures it starts with +
 * - Validates the result
 * @param phone - The phone number string to normalize
 * @returns normalized phone number or null if invalid
 */
export function normalizePhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== 'string') return null;

  // Basic validation: must contain only valid characters
  if (!/^[+\-\(\)\s\d]+$/.test(phone)) return null;

  // Must start with + for international format
  if (!phone.startsWith('+')) return null;

  // Remove all characters except digits and +
  const normalized = phone.replace(/[^\d\+]/g, '');

  // Ensure it starts with +
  const withPlus = normalized.startsWith('+') ? normalized : '+' + normalized;

  // Validate the normalized number
  if (!validatePhoneNumber(withPlus)) return null;

  return withPlus;
}

/**
 * Validates an email address
 * - Basic format validation using regex
 * - Checks for common email patterns
 * - Prevents basic XSS attempts
 * @param email - The email string to validate
 * @returns true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  const trimmed = email.trim();
  if (trimmed.length === 0) return false;

  // Basic email regex - more permissive but secure
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return false;

  // Check length limits
  if (trimmed.length > 254) return false;

  // Check for suspicious patterns (basic XSS prevention)
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) return false;
  }

  return true;
}

/**
 * Validates and filters an array of email addresses
 * - Removes empty strings
 * - Validates each email
 * - Returns only valid emails
 * @param emails - Array of email strings
 * @returns Array of validated emails
 */
export function validateEmails(emails: string[]): string[] {
  if (!Array.isArray(emails)) return [];

  return emails
    .filter(email => email && typeof email === 'string' && email.trim().length > 0)
    .map(email => email.trim())
    .filter(email => validateEmail(email));
}

/**
 * Filters and validates an array of phone numbers
 * - Removes empty strings
 * - Validates each phone number
 * - Normalizes valid phone numbers
 * - Returns only valid, normalized phone numbers
 * @param phones - Array of phone number strings
 * @returns Array of validated and normalized phone numbers
 */
export function validateAndNormalizePhoneNumbers(phones: string[]): string[] {
  if (!Array.isArray(phones)) return [];

  return phones
    .filter(phone => phone && typeof phone === 'string' && phone.trim().length > 0)
    .map(phone => normalizePhoneNumber(phone.trim()))
    .filter((phone): phone is string => phone !== null);
}
