'use client';

import Link from 'next/link';

import { filterSwords, type SwordSort, SwordTile, useSwords } from '@/entities/sword';
import { Button } from '@/shared/ui';

import type { Sword, SwordCategory } from '@snb/domain';

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
  const { data, isPending, isError, refetch } = useSwords(category, initialSwords);

  if (isError) {
    return (
      <div role="alert" className="grid justify-items-center gap-4 px-4 py-24 text-center">
        <p>도검 목록을 불러오지 못했습니다.</p>
        <Button variant="outline" className="rounded-sm" onClick={() => void refetch()}>
          다시 불러오기
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div aria-busy="true" aria-live="polite" className={`${GRID} border-l border-t border-line`}>
        <p className="sr-only">도검 목록을 불러오는 중입니다.</p>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={`${CELL} aspect-square animate-pulse bg-wall-sunk/40`} />
        ))}
      </div>
    );
  }

  const swords = filterSwords(data, { q, sort });
  const resetHref = category ? `/?category=${category}` : '/';

  return (
    <>
      <p role="status" className="mx-auto max-w-[90rem] px-4 pb-3 text-sm text-ink-muted sm:px-8">
        {q ? `‘${q}’ 검색 결과 ${swords.length}점` : `${swords.length}점`}
        {q ? (
          <>
            {' · '}
            <Link href={resetHref} className="underline underline-offset-4">
              검색어 지우기
            </Link>
          </>
        ) : null}
      </p>
      {swords.length === 0 ? (
        <p className="px-4 py-24 text-center">
          {q ? `‘${q}’에 맞는 도검이 없습니다. 다른 이름으로 찾아보세요.` : '이 분류에는 아직 도검이 없습니다.'}
        </p>
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
