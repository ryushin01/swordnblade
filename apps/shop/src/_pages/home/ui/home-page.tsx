import { getTranslations, setRequestLocale } from 'next-intl/server';

import { categoryLabel, type Locale, SWORD_CATEGORIES, type SwordCategory } from '@snb/domain';
import { SEED_SWORDS } from '@snb/mocks';

import { filterSwords, localizeForLocale, paginate, toPage, toSwordKind, toSwordSort } from '@/entities/sword';
import { firstParam } from '@/shared/lib';

import { CategoryNav } from './category-nav';
import { SearchForm } from './search-form';
import { SwordWall } from './sword-wall';

type Params = Promise<{ locale: string }>;
type Param = string | string[];
type SearchParams = Promise<{ category?: Param; q?: Param; sort?: Param; kind?: Param; page?: Param }>;

export async function HomePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const raw = await searchParams;
  const query = {
    category: firstParam(raw.category),
    q: firstParam(raw.q),
    sort: firstParam(raw.sort),
    kind: firstParam(raw.kind),
    page: firstParam(raw.page),
  };
  const category = SWORD_CATEGORIES.includes(query.category as SwordCategory)
    ? (query.category as SwordCategory)
    : undefined;
  const q = (query.q ?? '').trim().slice(0, 50);
  const sort = toSwordSort(query.sort);
  const kind = toSwordKind(query.kind);
  const page = toPage(query.page);
  // 서버에서는 시드로 지금 쪽만 먼저 그려 첫 화면과 검색 엔진에 보여 줍니다. 브라우저에서 Mock API 값으로 바뀝니다.
  // 208점 전체를 HTML에 실으면 수백 KB가 되므로 지금 쪽의 칸에 필요한 값만 넘깁니다.
  const shown = paginate(
    filterSwords(
      SEED_SWORDS.filter((sword) => !category || sword.category === category).map((sword) =>
        localizeForLocale(sword, locale as Locale),
      ),
      { q, sort, kind },
    ),
    page,
  );
  const initialView = {
    ...shown,
    items: shown.items.map(({ id, slug, name, nameEn, nameOriginal, price, stock, art }) => ({
      id,
      slug,
      name,
      nameEn,
      nameOriginal,
      price,
      stock,
      art,
    })),
  };

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
      <CategoryNav current={category} />
      <SearchForm category={category} q={q} sort={sort} kind={kind} />
      <SwordWall
        category={category}
        q={q}
        sort={sort}
        kind={kind}
        page={page}
        initialView={initialView}
        labelledBy="wall-title"
      />
    </>
  );
}
