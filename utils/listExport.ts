/**
 * List Export Utilities
 * Functions to export food lists in various formats (JSON, CSV, PDF-like HTML)
 */

/**
 * Sanitizes a filename by removing special characters
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9àáâäãåèéêëìíîïòóôöõùúûüñçÀÁÂÄÃÅÈÉÊËÌÍÎÏÒÓÔÖÕÙÚÛÜÑÇ\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
}

/**
 * Triggers a download for a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a list and its restaurants as a JSON file
 */
export function exportListAsJSON(list: any, restaurants: any[]): void {
  const exportData = {
    listName: list.name || 'untitled-list',
    description: list.description || '',
    exportedAt: new Date().toISOString(),
    totalRestaurants: restaurants.length,
    restaurants: restaurants.map((r) => ({
      name: r.name,
      location: r.location || '',
      rating: r.rating || null,
      pricePerPerson: r.price_per_person || null,
      visited: r.visited,
      cuisineTypes: r.cuisine_types?.map((ct: any) => ct.name || ct) || [],
      features: r.features?.map((f: any) => f.name || f) || [],
      dietaryOptions: r.dietary_options?.map((d: any) => d.name || d) || [],
    })),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, `${sanitizeFilename(list.name || 'untitled-list')}.json`);
}

/**
 * Exports a list and its restaurants as a CSV file
 */
export function exportListAsCSV(list: any, restaurants: any[]): void {
  const headers = ['Nome', 'Localização', 'Rating', 'Preço/Pessoa', 'Faixa de Preço', 'Tipos de Cozinha', 'Visitado'];
  
  const rows = restaurants.map((restaurant) => {
    const priceLevel = restaurant.price_per_person
      ? restaurant.price_per_person < 15
        ? '€'
        : restaurant.price_per_person < 30
        ? '€€'
        : restaurant.price_per_person < 50
        ? '€€€'
        : '€€€€'
      : 'N/A';

    return [
      `"${(restaurant.name || '').replace(/"/g, '""')}"`,
      `"${(restaurant.location || '').replace(/"/g, '""')}"`,
      restaurant.rating || 'N/A',
      restaurant.price_per_person || 'N/A',
      priceLevel,
      `"${(restaurant.cuisine_types?.map((ct: any) => ct.name || ct).join(', ') || '').replace(/"/g, '""')}"`,
      restaurant.visited ? 'Sim' : 'Não',
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${sanitizeFilename(list.name || 'untitled-list')}.csv`);
}

/**
 * Exports a list and its restaurants as an HTML file (PDF-like formatted document)
 */
export function exportListAsPDF(list: any, restaurants: any[]): void {
  const restaurantRows = restaurants
    .map((r, index) => {
      const priceLevel = r.price_per_person
        ? r.price_per_person < 15
          ? '€'
          : r.price_per_person < 30
          ? '€€'
          : r.price_per_person < 50
          ? '€€€'
          : '€€€€'
        : 'N/A';

      const cuisineTypes = r.cuisine_types?.map((ct: any) => ct.name || ct).join(', ') || 'N/A';

      return `
        <tr class="${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
          <td class="border px-4 py-2">${index + 1}</td>
          <td class="border px-4 py-2 font-semibold">${r.name || 'N/A'}</td>
          <td class="border px-4 py-2">${r.location || 'N/A'}</td>
          <td class="border px-4 py-2 text-center">${r.rating ? `${r.rating}/5` : 'N/A'}</td>
          <td class="border px-4 py-2 text-center">${priceLevel}</td>
          <td class="border px-4 py-2">${cuisineTypes}</td>
          <td class="border px-4 py-2 text-center">${r.visited ? '✅ Sim' : '⬜ Não'}</td>
        </tr>
      `;
    })
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${list.name || 'Lista'} - FoodLister</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #f59e0b; }
    .header h1 { color: #f59e0b; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 8px 0 0; }
    .stats { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f9fafb; padding: 15px; border-radius: 8px; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #f59e0b; }
    .stat-label { font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f59e0b; color: white; padding: 12px 8px; text-align: left; font-size: 14px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #999; font-size: 12px; }
    @media print { body { padding: 0; } .container { max-width: 100%; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ ${list.name || 'Lista de Restaurantes'}</h1>
      <p>${list.description || 'Exportado do FoodLister'}</p>
      <p style="font-size: 12px; color: #999;">Exportado em ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}</p>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${restaurants.length}</div>
        <div class="stat-label">Restaurantes</div>
      </div>
      <div class="stat">
        <div class="stat-value">${restaurants.filter((r: any) => r.visited).length}</div>
        <div class="stat-label">Visitados</div>
      </div>
      <div class="stat">
        <div class="stat-value">${restaurants.filter((r: any) => r.rating).length > 0 ? (restaurants.filter((r: any) => r.rating).reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / restaurants.filter((r: any) => r.rating).length).toFixed(1) : 'N/A'}</div>
        <div class="stat-label">Rating Médio</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Nome</th>
          <th>Localização</th>
          <th>Rating</th>
          <th>Preço</th>
          <th>Cozinha</th>
          <th>Visitado</th>
        </tr>
      </thead>
      <tbody>
        ${restaurantRows}
      </tbody>
    </table>

    <div class="footer">
      <p>FoodLister - Organiza os teus restaurantes favoritos</p>
    </div>
  </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  downloadBlob(blob, `${sanitizeFilename(list.name || 'untitled-list')}.html`);
}