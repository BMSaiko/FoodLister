// app/embed/lists/[slug]/page.tsx
// T26: página embed minimalista (sem navbar/auth) para iframe. Server-rendered,
// lê só campos públicos de listas is_public. Iframe-friendly, CSS isolado.
import { getPublicServerClient } from '@/libs/supabase/server';
import { isUuid } from '@/libs/slug';
import Link from 'next/link';

const R_COLS = 'id, slug, name, description, price_per_person, rating, location, source_url, opentable_url, yelp_url, images';

export const dynamic = 'force-dynamic';

export default async function EmbedListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = isUuid(slug) ? 'id' : 'slug';
  let name = '';
  let description = '';
  let creatorName = '';
  let restaurants: any[] = [];

  const client = await getPublicServerClient();
  if (client) {
    const { data: list } = await client
      .from('lists')
      .select('id, slug, name, description, creator_name, is_public')
      .eq(key, slug)
      .single();
    if (list && list.is_public) {
      name = list.name || '';
      description = list.description || '';
      creatorName = list.creator_name || '';
      const { data: lr } = await client
        .from('list_restaurants')
        .select('restaurant_id, position')
        .eq('list_id', list.id)
        .order('position', { ascending: true }) as {
        data: { restaurant_id: string; position: number }[] | null;
      };
      if (lr && lr.length) {
        const ids = lr.map((r) => r.restaurant_id);
        const { data: rd } = await client
          .from('restaurants')
          .select(R_COLS)
          .in('id', ids);
        if (rd) {
          const order = lr.reduce<Record<string, number>>((acc, x) => {
            acc[x.restaurant_id] = x.position;
            return acc;
          }, {});
          restaurants = [...(rd)]
            .sort((a, b) => (order[a.id] ?? 0) - (order[b.id] ?? 0));
        }
      }
    }
  }

  return (
    <html lang="pt">
      <head>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="embed-body">
        <style>{`
          .embed-body{background:transparent;margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#e7e7ec;padding:8px;}
          .embed-title{font-size:15px;font-weight:600;color:#fbbf24;margin:0 0 2px;}
          .embed-desc{font-size:13px;color:#ffffff99;margin:0 0 4px;}
          .embed-meta{font-size:12px;color:#ffffff80;}
          .embed-name{font-size:14px;font-weight:600;margin:0;color:#fff;}
          .embed-card{background:#ffffff0d;border:1px solid #ffffff14;border-radius:16px;padding:12px 16px;margin-bottom:8px;}
          .embed-links{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;}
          .embed-links a{font-size:11px;color:#fbbf24;text-decoration:none;border:1px solid #fbbf2440;padding:2px 10px;border-radius:999px;}
          .embed-cta{display:block;margin-top:10px;font-size:12px;color:#ffffff66;text-decoration:none;}
          .embed-empty{padding:24px;text-align:center;color:#ffffff66;font-size:14px;}
        `}</style>

        {!name && !restaurants.length ? (
          <div className="embed-empty">
            <p>Lista não encontrada ou é privada.</p>
          </div>
        ) : (
          <>
            <h1 className="embed-title">{name || 'Lista'}</h1>
            {description && <p className="embed-desc">{description}</p>}
            {creatorName && <p className="embed-meta">por {creatorName}</p>}
            <div style={{ marginTop: 12 }}>
              {restaurants.map((r) => (
                <div key={r.id} className="embed-card">
                  <p className="embed-name">{r.name}</p>
                  {r.description && <p className="embed-desc">{r.description}</p>}
                  <p className="embed-meta">
                    {r.rating ? `★ ${Number(r.rating).toFixed(1)}` : ''}
                    {r.location ? ` · ${r.location}` : ''}
                    {r.price_per_person ? ` · €${r.price_per_person}` : ''}
                  </p>
                  {(r.opentable_url || r.yelp_url || r.source_url) && (
                    <div className="embed-links">
                      {r.opentable_url && <a href={r.opentable_url} target="_blank" rel="noopener noreferrer">OpenTable</a>}
                      {r.yelp_url && <a href={r.yelp_url} target="_blank" rel="noopener noreferrer">Yelp</a>}
                      {r.source_url && <a href={r.source_url} target="_blank" rel="noopener noreferrer">Site</a>}
                    </div>
                  )}
                </div>
              ))}
              <Link className="embed-cta" target="_blank" href={`/lists/${slug}`}>Ver tudo no FoodLister</Link>
            </div>
          </>
        )}
      </body>
    </html>
  );
}