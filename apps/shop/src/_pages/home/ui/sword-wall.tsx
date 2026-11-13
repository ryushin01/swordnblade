'use client';

import { useLocale, useTranslations } from 'next-intl';

import {
  filterSwords,
  localizeForLocale,
  paginate,
  type SwordSort,
  SwordTile,
  type SwordTileData,
  useSwords,
} from '@/entities/sword';
import { Link } from '@/shared/i18n';
import { useNow } from '@/shared/lib/use-now';
import { Button } from '@/shared/ui';

import { Pagination } from './pagination';

import type { Locale, SwordCategory, SwordKind } from '@snb/domain';

const GRID = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
const CELL = 'border-b border-r border-line';

/** 벽에 보여 줄 한 쪽 */
export interface WallView {
  items: SwordTileData[];
  total: number;
  page: number;
  pages: number;
  from: number;
  to: number;
}

/** 석고 벽처럼 정사각 칸을 이어 붙인 상품 목록 */
interface SwordWallProps {
  category?: SwordCategory;
  q: string;
  sort: SwordSort;
  kind?: SwordKind;
  /** 할인 중인 도검만 */
  sale: boolean;
  /** 1부터 시작하는 쪽 번호 */
  page: number;
  /** 서버가 시드로 먼저 그린 지금 쪽. Mock API 값이 오면 바뀝니다. */
  initialView?: WallView;
  labelledBy: string;
}

export function SwordWall({ category, q, sort, kind, sale, page, initialView, labelledBy }: SwordWallProps) {
  const t = useTranslations('Home');
  const compare = useTranslations('Compare');
  const locale = useLocale() as Locale;
  const { data, isError, refetch } = useSwords(category);
  const now = useNow();
  const shown: WallView | undefined = data
    ? paginate(
        filterSwords(
          data.map((sword) => localizeForLocale(sword, locale)),
          { q, sort, kind, sale, now },
        ),
        page,
      )
    : initialView;

  if (isError && !shown) {
    return (
      <div role="alert" className="grid justify-items-center gap-4 px-4 py-24 text-center">
        <p>{t('loadError')}</p>
        <Button variant="outline" className="rounded-sm" onClick={() => void refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (!shown) {
    return (
      <div aria-busy="true" aria-live="polite" className={`${GRID} border-l border-t border-line`}>
        <p className="sr-only">{t('loading')}</p>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={`${CELL} aspect-square animate-pulse bg-wall-sunk/40`} />
        ))}
      </div>
    );
  }

  // 쪽 링크와 검색어 지우기에 지금 조건을 그대로 넘깁니다(기본값은 주소에 남기지 않음).
  const withoutQuery: Record<string, string> = {
    ...(category ? { category } : {}),
    ...(kind ? { kind } : {}),
    ...(sale ? { sale: '1' } : {}),
    ...(sort !== 'recommended' ? { sort } : {}),
  };
  const query = q ? { ...withoutQuery, q } : withoutQuery;
  const resetHref = { pathname: '/' as const, query: withoutQuery };
  const counts = { q, count: shown.total, from: shown.from, to: shown.to };
  const status =
    shown.pages > 1 ? t(q ? 'resultPageStatus' : 'pageStatus', counts) : t(q ? 'resultCount' : 'count', counts);

  return (
    <>
      {/* 최신 값을 못 받아 서버가 그린 목록을 보여 주는 중이면 알리고 다시 받을 수 있게 합니다. */}
      {isError && !data ? (
        <div role="alert" className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-3 px-4 pb-3 text-sm sm:px-8">
          <p>{t('loadError')}</p>
          <Button variant="outline" className="min-h-11 rounded-sm" onClick={() => void refetch()}>
            {t('retry')}
          </Button>
        </div>
      ) : null}
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-x-4 px-4 pb-3 text-sm text-ink-muted sm:px-8">
        <p role="status">
          {status}
          {q ? (
            <>
              {' · '}
              <Link href={resetHref} className="underline underline-offset-4">
                {t('clearQuery')}
              </Link>
            </>
          ) : null}
        </p>
        <span className="flex flex-wrap gap-x-4">
          <Link href="/timeline" className="inline-flex min-h-11 items-center underline underline-offset-4">
            {compare('timelineLink')}
          </Link>
          <Link href="/compare" className="inline-flex min-h-11 items-center underline underline-offset-4">
            {compare('navLink')}
          </Link>
        </span>
      </div>
      {shown.total === 0 ? (
        <p className="px-4 py-24 text-center">
          {q ? t('emptyQuery', { q }) : sale ? t('emptySale') : t('emptyCategory')}
        </p>
      ) : (
        <ul aria-labelledby={labelledBy} className={`${GRID} border-l border-t border-line`}>
          {shown.items.map((sword) => (
            <li key={sword.id} className={CELL}>
              <SwordTile sword={sword} />
            </li>
          ))}
        </ul>
      )}
      <Pagination page={shown.page} pages={shown.pages} query={query} />
    </>
  );
}
