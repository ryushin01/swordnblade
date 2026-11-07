import { SEED_SWORDS } from '@snb/mocks';

import { SwordDetail } from './sword-detail';

import type { Metadata } from 'next';

type Params = Promise<{ slug: string }>;

export async function generateSwordMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const sword = SEED_SWORDS.find((item) => item.slug === slug);
  return sword ? { title: sword.name, description: sword.summary } : { title: '도검' };
}

/** 시드에 있는 도검은 빌드할 때 미리 그립니다. 어드민에서 새로 만든 도검은 브라우저에서 불러옵니다. */
export function generateSwordStaticParams() {
  return SEED_SWORDS.map((sword) => ({ slug: sword.slug }));
}

export async function SwordPage({ params }: { params: Params }) {
  const { slug } = await params;
  // 서버에서는 시드로 먼저 그리고, 브라우저에서 Mock API 값(어드민에서 바꾼 값 포함)으로 바꿉니다.
  const initialSword = SEED_SWORDS.find((sword) => sword.slug === slug);
  return <SwordDetail slug={slug} initialSword={initialSword} />;
}
