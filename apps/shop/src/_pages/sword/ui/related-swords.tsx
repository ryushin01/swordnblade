'use client';

import { useLocale, useTranslations } from 'next-intl';

import { localizeForLocale, relatedSwords, SwordTile, useSwords } from '@/entities/sword';

import type { Locale, Sword } from '@snb/domain';

/** 상세 아래의 추천 도검. 불러오기 전이나 실패했을 때는 아무것도 보여 주지 않습니다(부가 정보). */
export function RelatedSwords({ sword }: { sword: Sword }) {
  const t = useTranslations('Related');
  const locale = useLocale() as Locale;
  const { data } = useSwords(sword.category);
  const swords = data ? relatedSwords(sword, data) : [];
  if (swords.length === 0) return null;
  return (
    <section aria-labelledby="related-title" className="mx-auto max-w-[90rem] py-12">
      <h2 id="related-title" className="text-carved pb-6 text-center text-2xl">
        {t('title')}
      </h2>
      <ul aria-labelledby="related-title" className="grid grid-cols-2 border-l border-t border-line xl:grid-cols-4">
        {swords.map((item) => (
          <li key={item.id} className="border-b border-r border-line">
            <SwordTile sword={localizeForLocale(item, locale)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
