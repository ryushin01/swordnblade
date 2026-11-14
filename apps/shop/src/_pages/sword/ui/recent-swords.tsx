'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { localizeForLocale, relatedSwords, SwordTile, useSwords } from '@/entities/sword';
import { useStoreHydrated } from '@/shared/lib/use-store-hydrated';

import { useRecentStore } from '../model/recent-store';

import type { Locale, Sword } from '@snb/domain';

/**
 * 지금 보는 도검을 기록하고, 그 전에 본 도검을 보여 줍니다. 처음 온 사람에게는 아무것도 보이지 않습니다.
 * `relatedTo`: 위의 '함께 볼 도검'과 같은 도검은 화면 전환의 출발점으로 쓰지 않으려고 받습니다.
 */
export function RecentSwords({ swordId, relatedTo }: { swordId: string; relatedTo: Sword }) {
  const t = useTranslations('Recent');
  const locale = useLocale() as Locale;
  const hydrated = useStoreHydrated(useRecentStore);
  const ids = useRecentStore((state) => state.ids);
  const record = useRecentStore((state) => state.record);
  const { data } = useSwords();
  // RelatedSwords와 같은 질의라 다시 받지 않습니다(TanStack Query 캐시).
  const { data: sameCategory } = useSwords(relatedTo.category);
  const relatedIds = new Set((sameCategory ? relatedSwords(relatedTo, sameCategory) : []).map((item) => item.id));

  useEffect(() => {
    if (hydrated) record(swordId);
  }, [hydrated, record, swordId]);

  const swords = hydrated
    ? ids
        .filter((id) => id !== swordId)
        .flatMap((id) => data?.find((sword) => sword.id === id) ?? [])
        .slice(0, 4)
    : [];
  if (swords.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className="mx-auto max-w-[90rem] pb-12">
      <h2 id="recent-title" className="text-carved pb-6 text-center text-2xl">
        {t('title')}
      </h2>
      <ul aria-labelledby="recent-title" className="grid grid-cols-2 border-l border-t border-line xl:grid-cols-4">
        {swords.map((sword) => (
          <li key={sword.id} className="border-b border-r border-line">
            {/* 함께 볼 도검에도 있는 도검은 화면 전환의 출발점으로 쓰지 않습니다. SSGOI는 같은 키의 첫 요소(위쪽 카드)에서 출발합니다. */}
            <SwordTile sword={localizeForLocale(sword, locale)} heroSource={!relatedIds.has(sword.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
