'use client';

import type { SwordCategory } from '@snb/domain';
import { SwordTile, useSwords } from '@/entities/sword';
import { Button } from '@/shared/ui';

const GRID = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
const CELL = 'border-b border-r border-line';

/** 석고 벽처럼 정사각 칸을 이어 붙인 상품 목록 */
export function SwordWall({ category, labelledBy }: { category?: SwordCategory; labelledBy: string }) {
  const { data, isPending, isError, refetch } = useSwords(category);

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

  if (data.length === 0) {
    return <p className="px-4 py-24 text-center">이 분류에는 아직 도검이 없습니다.</p>;
  }

  return (
    <ul aria-labelledby={labelledBy} className={`${GRID} border-l border-t border-line`}>
      {data.map((sword) => (
        <li key={sword.id} className={CELL}>
          <SwordTile sword={sword} />
        </li>
      ))}
    </ul>
  );
}
