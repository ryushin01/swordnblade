import { getTranslations, setRequestLocale } from 'next-intl/server';

import { categoryLabel, type Locale, type SwordCategory } from '@snb/domain';
import { SEED_SWORDS } from '@snb/mocks';

import { toSwordSort } from '@/entities/sword';

import { SearchForm } from './search-form';
import { SwordWall } from './sword-wall';

const CATEGORIES: SwordCategory[] = ['east', 'west', 'legend'];

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ category?: string; q?: string; sort?: string }>;

export async function HomePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const query = await searchParams;
  const category = CATEGORIES.includes(query.category as SwordCategory) ? (query.category as SwordCategory) : undefined;
  const q = (query.q ?? '').trim().slice(0, 50);
  const sort = toSwordSort(query.sort);
  // 서버에서는 시드로 먼저 그려 첫 화면과 검색 엔진에 목록을 보여 줍니다. 브라우저에서 Mock API 값으로 바뀝니다.
  const initialSwords = SEED_SWORDS.filter((sword) => !category || sword.category === category);

  return (
    <>
      <div className="mx-auto grid max-w-[90rem] justify-items-center gap-3 px-4 pb-8 pt-12 text-center sm:px-8 sm:pt-16">
        <p lang="en" className="small-caps text-sm text-accent">
          {category ? categoryLabel(category, 'en') : t('eyebrow')}
        </p>
        <h1 id="wall-title" className="text-carved text-3xl sm:text-4xl">
          {category ? categoryLabel(category, locale as Locale) : t('title')}
        </h1>
        <p className="max-w-xl text-ink-muted">{t('intro')}</p>
      </div>
      <SearchForm category={category} q={q} sort={sort} />
      <SwordWall category={category} q={q} sort={sort} initialSwords={initialSwords} labelledBy="wall-title" />
    </>
  );
}
