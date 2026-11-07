import type { Metadata } from 'next';
import { SEED_SWORDS } from '@snb/mocks';
import { SwordDetail } from './sword-detail';

type Params = Promise<{ slug: string }>;

export async function generateSwordMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const sword = SEED_SWORDS.find((item) => item.slug === slug);
  return sword ? { title: sword.name, description: sword.summary } : { title: '도검' };
}

export async function SwordPage({ params }: { params: Params }) {
  const { slug } = await params;
  return <SwordDetail slug={slug} />;
}
