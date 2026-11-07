import { formatKRW } from '@snb/domain';

/** 금액이 바뀌면 화면낭독기에 합계만 짧게 알려 줍니다. */
export function LiveTotal({ total, label = '결제 예정 금액' }: { total: number; label?: string }) {
  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {label} {formatKRW(total)}
    </p>
  );
}
