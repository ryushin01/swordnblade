import { getTranslations, setRequestLocale } from 'next-intl/server';

import { type Locale } from '@snb/domain';
import { SEED_SWORDS } from '@snb/mocks';

import { localizeForLocale } from '@/entities/sword';
import { type AppLocale, languageAlternates } from '@/shared/i18n';
import { firstParam } from '@/shared/lib';

import { CompareView, type SwordOption } from './compare-view';

import type { Metadata } from 'next';

type Params = Promise<{ locale: string }>;
type Param = string | string[];
type SearchParams = Promise<{ a?: Param; b?: Param; c?: Param }>;

export async function generateCompareMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return { title: t('compare'), alternates: languageAlternates('/compare', locale as AppLocale) };
}

export async function ComparePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Compare');
  const { a, b, c } = await searchParams;
  const slugs = [...new Set([a, b, c].map(firstParam).filter((slug): slug is string => Boolean(slug)))];
  const localized = SEED_SWORDS.map((sword) => localizeForLocale(sword, locale as Locale));
  // 첫 화면에는 고르기 칸에 필요한 값과 고른 도검만 실어 보냅니다. 브라우저에서 Mock API 값으로 바뀝니다.
  const options: SwordOption[] = localized.map(({ slug, name, category }) => ({ slug, name, category }));
  const initialSwords = localized.filter((sword) => slugs.includes(sword.slug));
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 sm:px-8">
      <div className="grid justify-items-center gap-3 text-center">
        <h1 className="text-carved text-3xl">{t('title')}</h1>
        <p className="text-ink-muted">{t('intro')}</p>
      </div>
      <CompareView slugs={slugs} options={options} initialSwords={initialSwords} />
    </div>
  );
}
