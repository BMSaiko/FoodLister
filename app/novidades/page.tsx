import type { Metadata } from 'next';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import ReleaseFeed from '@/components/releases/ReleaseFeed';
import { getPublicServerClient } from '@/libs/supabase/server';
import { cacheOrSet } from '@/libs/cache';
import { DEFAULT_LIMIT, listReleases, type ReleasePage } from '@/libs/releases/server';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Novidades - FoodLister',
  description: 'O que mudou no FoodLister, versão a versão.',
};

async function load(): Promise<ReleasePage> {
  const empty: ReleasePage = { releases: [], page: 1, hasMore: false };
  try {
    const client = await getPublicServerClient();
    if (!client) return empty;
    return await cacheOrSet(`releases:1:${DEFAULT_LIMIT}`, () => listReleases(client, 1, DEFAULT_LIMIT), 300);
  } catch (error) {
    console.error('Error loading releases:', error);
    return empty;
  }
}

export default async function NovidadesPage() {
  const { releases, hasMore } = await load();
  return (
    <>
      <Navbar />
      <Container>
        <main className="mx-auto max-w-2xl py-8">
          <div className="mb-8 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot/tovi-feliz.svg" alt="" aria-hidden="true" width={72} height={72} />
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">Novidades</h1>
              <p className="text-[var(--gray-500)]">O que mudou no FoodLister, versão a versão.</p>
            </div>
          </div>
          <ReleaseFeed releases={releases} hasMore={hasMore} />
        </main>
      </Container>
    </>
  );
}
