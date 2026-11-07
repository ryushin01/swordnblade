import { getTranslations, setRequestLocale } from 'next-intl/server';

import { type Locale } from '@snb/domain';
import { SEED_SWORDS } from '@snb/mocks';

import { localizeForLocale } from '@/entities/sword';
import { type AppLocale, languageAlternates } from '@/shared/i18n';

import { SwordDetail } from './sword-detail';

import type { Metadata } from 'next';

type Params = Promise<{ locale: string; slug: string }>;

export async function generateSwordMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const seed = SEED_SWORDS.find((item) => item.slug === slug);
  const alternates = languageAlternates(`/swords/${slug}`, locale as AppLocale);
  if (!seed) {
    const t = await getTranslations({ locale, namespace: 'Meta' });
    return { title: t('sword'), alternates };
  }
  const sword = localizeForLocale(seed, locale as Locale);
  return { title: sword.name, description: sword.summary, alternates };
}

/** 시드에 있는 도검은 빌드할 때 언어마다 미리 그립니다. 어드민에서 새로 만든 도검은 브라우저에서 불러옵니다. */
export function generateSwordStaticParams() {
  return SEED_SWORDS.map((sword) => ({ slug: sword.slug }));
}

export async function SwordPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  // 서버에서는 시드로 먼저 그리고, 브라우저에서 Mock API 값(어드민에서 바꾼 값 포함)으로 바꿉니다.
  const initialSword = SEED_SWORDS.find((sword) => sword.slug === slug);
  return <SwordDetail slug={slug} initialSword={initialSword} />;
}
