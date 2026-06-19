interface List {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  creator_name?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ExportData {
  list: List;
  restaurants: Array<{
    id: string;
    name: string;
    location?: string;
    rating?: number;
  }>;
}

/**
 * Export list as CSV
 */
export function exportAsCSV(data: ExportData): void {
  const headers = ['Nome', 'Localização', 'Rating'];
  const rows = data.restaurants.map(r => [
    r.name,
    r.location || '',
    r.rating?.toString() || '',
  ]);

  const csvContent = [
    `# ${data.list.name}`,
    `# ${data.list.description || ''}`,
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  downloadFile(csvContent, `${data.list.name}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export list as JSON
 */
export function exportAsJSON(data: ExportData): void {
  const jsonContent = JSON.stringify({
    list: {
      name: data.list.name,
      description: data.list.description,
      exported_at: new Date().toISOString(),
    },
    restaurants: data.restaurants,
  }, null, 2);

  downloadFile(jsonContent, `${data.list.name}.json`, 'application/json');
}

/**
 * Export list as formatted text
 */
export function exportAsText(data: ExportData): void {
  const content = [
    `=== ${data.list.name} ===`,
    data.list.description || '',
    '',
    `Exportado em: ${new Date().toLocaleDateString('pt-PT')}`,
    `Total: ${data.restaurants.length} restaurante(s)`,
    '',
    '---',
    '',
    ...data.restaurants.map((r, i) => {
      const parts = [`${i + 1}. ${r.name}`];
      if (r.location) parts.push(`   📍 ${r.location}`);
      if (r.rating) parts.push(`   ⭐ ${r.rating.toFixed(1)}`);
      return parts.join('\n');
    }),
  ].join('\n');

  downloadFile(content, `${data.list.name}.txt`, 'text/plain;charset=utf-8;');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
