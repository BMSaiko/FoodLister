import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/ui/navigation/Navbar';
import { Container } from '@/components/ui/Container';
import ReleaseCard from '@/components/releases/ReleaseCard';
import MarkReleaseSeen from '@/components/releases/MarkReleaseSeen';
import { getPublicServerClient } from '@/libs/supabase/server';
import { getRelease } from '@/libs/releases/server';
import type { ReleaseNote } from '@/libs/releases/types';

export const revalidate = 300;

const VERSION = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;

type Params = { params: Promise<{ version: string }> };

async function load(version: string): Promise<ReleaseNote | null> {
  if (!VERSION.test(version)) return null;
  const client = await getPublicServerClient();
  if (!client) return null;
  return getRelease(client, version);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { version } = await params;
  return { title: `Versão ${version} - Novidades - FoodLister` };
}

export default async function NovidadeDetailPage({ params }: Params) {
  const { version } = await params;
  const note = await load(version);
  if (!note) notFound();
  return (
    <>
      <Navbar />
      <Container>
        <main className="mx-auto max-w-2xl py-8">
          <Link href="/novidades" className="mb-4 inline-flex min-h-[44px] items-center text-sm text-[var(--gray-500)] hover:underline">
            ← Todas as novidades
          </Link>
          <MarkReleaseSeen version={note.version} />
          <ReleaseCard note={note} detail />
        </main>
      </Container>
    </>
  );
}
