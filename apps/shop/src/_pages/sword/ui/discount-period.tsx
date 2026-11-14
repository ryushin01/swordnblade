'use client';

import { useLocale, useTranslations } from 'next-intl';

import { discountStatus, type Sword } from '@snb/domain';

import { useNow } from '@/shared/lib/use-now';

/**
 * 할인 기간 안내. 할인 중이면 끝나는 날, 시작 전이면 시작하는 날을 알립니다. 끝났거나 기한이 없으면 그리지 않습니다.
 * 상세 화면에서만 쓰므로 이 페이지 슬라이스에 둡니다(공개 API로 내보내면 그 슬라이스를 쓰는 모든 화면 묶음에 들어감).
 */
export function DiscountPeriod({ sword, className }: { sword: Pick<Sword, 'discount'>; className?: string }) {
  const t = useTranslations('Price');
  const locale = useLocale();
  const now = useNow();
  const { discount } = sword;
  if (!discount) return null;
  // 할인 날짜는 한국 시간(KST) 기준 날짜입니다.
  const day = (date: string) =>
    new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', { dateStyle: 'long', timeZone: 'Asia/Seoul' }).format(
      new Date(`${date}T00:00:00+09:00`),
    );
  const status = discountStatus(discount, now);
  if (status === 'scheduled' && discount.startsAt) {
    return <p className={className}>{t('upcoming', { date: day(discount.startsAt), rate: discount.rate })}</p>;
  }
  if (status === 'active' && discount.endsAt) {
    return <p className={className}>{t('until', { date: day(discount.endsAt) })}</p>;
  }
  return null;
}
