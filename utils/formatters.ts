export function formatDate(dateString: string): string {
  const date = new Date(dateString);
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

  // For card previews, limit to reasonable length
  const words = firstParagraph.split(' ');
  if (words.length <= 20) return firstParagraph;

  return words.slice(0, 20).join(' ') + '...';
}
