'use client';

import { useLocale, useTranslations } from 'next-intl';

import { filterSwords, localizeForLocale, type SwordSort, SwordTile, useSwords } from '@/entities/sword';
import { Link } from '@/shared/i18n';
import { Button } from '@/shared/ui';

import type { Locale, Sword, SwordCategory } from '@snb/domain';

const GRID = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
const CELL = 'border-b border-r border-line';

/** 석고 벽처럼 정사각 칸을 이어 붙인 상품 목록 */
interface SwordWallProps {
  category?: SwordCategory;
  q: string;
  sort: SwordSort;
  /** 서버가 시드로 먼저 그린 목록 */
  initialSwords?: Sword[];
  labelledBy: string;
}

export function SwordWall({ category, q, sort, initialSwords, labelledBy }: SwordWallProps) {
  const t = useTranslations('Home');
  const locale = useLocale() as Locale;
  const { data, isPending, isError, refetch } = useSwords(category, initialSwords);

  if (isError) {
    return (
      <div role="alert" className="grid justify-items-center gap-4 px-4 py-24 text-center">
        <p>{t('loadError')}</p>
        <Button variant="outline" className="rounded-sm" onClick={() => void refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div aria-busy="true" aria-live="polite" className={`${GRID} border-l border-t border-line`}>
        <p className="sr-only">{t('loading')}</p>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={`${CELL} aspect-square animate-pulse bg-wall-sunk/40`} />
        ))}
      </div>
    );
  }

  const swords = filterSwords(
    data.map((sword) => localizeForLocale(sword, locale)),
    { q, sort },
  );
  const resetHref = category ? { pathname: '/', query: { category } } : '/';

  return (
    <>
      <p role="status" className="mx-auto max-w-[90rem] px-4 pb-3 text-sm text-ink-muted sm:px-8">
        {q ? t('resultCount', { q, count: swords.length }) : t('count', { count: swords.length })}
        {q ? (
          <>
            {' · '}
            <Link href={resetHref} className="underline underline-offset-4">
              {t('clearQuery')}
            </Link>
          </>
        ) : null}
      </p>
      {swords.length === 0 ? (
        <p className="px-4 py-24 text-center">{q ? t('emptyQuery', { q }) : t('emptyCategory')}</p>
      ) : (
        <ul aria-labelledby={labelledBy} className={`${GRID} border-l border-t border-line`}>
          {swords.map((sword) => (
            <li key={sword.id} className={CELL}>
              <SwordTile sword={sword} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
