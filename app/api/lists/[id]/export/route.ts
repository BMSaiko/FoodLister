import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9àáâäãåèéêëìíîïòóôöõùúûüñçÀÁÂÄÃÅÈÉÊËÌÍÎÏÒÓÔÖÕÙÚÛÜÑÇ\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
}

function generateCSV(restaurants: any[]): string {
  const headers = ['Nome', 'Localização', 'Rating', 'Preço/Pessoa', 'Faixa de Preço', 'Tipos de Cozinha', 'Visitado'];
  const rows = restaurants.map((r) => {
    const priceLevel = r.price_per_person
      ? r.price_per_person < 15 ? '€' : r.price_per_person < 30 ? '€€' : r.price_per_person < 50 ? '€€€' : '€€€€'
      : 'N/A';
    return [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.location || '').replace(/"/g, '""')}"`,
      r.rating || 'N/A',
      r.price_per_person || 'N/A',
      priceLevel,
      `"${(r.cuisine_types?.map((ct: any) => ct.name || ct).join(', ') || '').replace(/"/g, '""')}"`,
      r.visited ? 'Sim' : 'Não',
    ].join(',');
  });
  return '\uFEFF' + [headers.join(','), ...rows].join('\n');
}

function generateHTML(list: any, restaurants: any[]): string {
  const restaurantRows = restaurants
    .map((r: any, index: number) => {
      const priceLevel = r.price_per_person
        ? r.price_per_person < 15 ? '€' : r.price_per_person < 30 ? '€€' : r.price_per_person < 50 ? '€€€' : '€€€€'
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
        </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>${list.name || 'Lista'} - FoodLister</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; color: #333; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #f59e0b; }
    .header h1 { color: #f59e0b; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 8px 0 0; }
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
    <table>
      <thead>
        <tr><th>#</th><th>Nome</th><th>Localização</th><th>Rating</th><th>Preço</th><th>Cozinha</th><th>Visitado</th></tr>
      </thead>
      <tbody>${restaurantRows}</tbody>
    </table>
    <div class="footer"><p>FoodLister - Organiza os teus restaurantes favoritos</p></div>
  </div>
</body>
</html>`;
}

function generateJSON(list: any, restaurants: any[]): object {
  return {
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
    })),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get('format') || 'json';

  if (!['json', 'csv', 'html'].includes(format)) {
    return NextResponse.json(
      { error: 'Invalid format. Use json, csv, or html.' },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  );

  // Fetch the list
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('*')
    .eq('id', id)
    .single();

  if (listError || !list) {
    return NextResponse.json({ error: 'List not found' }, { status: 404 });
  }

  // Check access: public lists are accessible to everyone
  if (!list.is_public) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = session.user.id;
    const isOwner = list.creator_id === userId;

    if (!isOwner) {
      const { data: collab } = await supabase
        .from('list_collaborators')
        .select('id')
        .eq('list_id', id)
        .eq('user_id', userId)
        .single();

      if (!collab) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }
  }

  // Fetch restaurants in the list (limit to 100)
  const { data: listRestaurants } = await supabase
    .from('list_restaurants')
    .select('restaurant_id')
    .eq('list_id', id)
    .limit(100);

  const restaurantIds = (listRestaurants || []).map((lr: any) => lr.restaurant_id);

  let restaurants: any[] = [];
  if (restaurantIds.length > 0) {
    const { data: restData } = await supabase
      .from('restaurants')
      .select('*, cuisine_types(name)')
      .in('id', restaurantIds);
    restaurants = restData || [];
  }

  const safeName = sanitizeFilename(list.name || 'untitled-list');

  if (format === 'json') {
    return NextResponse.json(generateJSON(list, restaurants));
  }

  if (format === 'csv') {
    return new NextResponse(generateCSV(restaurants), {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': `attachment; filename="${safeName}.csv"`,
      },
    });
  }

  // html
  return new NextResponse(generateHTML(list, restaurants), {
    headers: {
      'Content-Type': 'text/html;charset=utf-8;',
      'Content-Disposition': `attachment; filename="${safeName}.html"`,
    },
  });
}
