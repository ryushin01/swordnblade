import { useLocale } from 'next-intl';

import { formatKRW, type Locale } from '@snb/domain';

/** 금액이 바뀌면 화면낭독기에 합계만 짧게 알려 줍니다. */
export function LiveTotal({ total, label }: { total: number; label: string }) {
  const locale = useLocale() as Locale;
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {label} {formatKRW(total, locale)}
    </p>
  );
}
