import { BladeMark } from '@snb/sword-art';

import { cn } from '@/shared/lib/utils';

/** 칼날 엠블럼 + SWORD & BLADE 글자. 링크 안에 넣으면 글자가 링크 이름이 됩니다. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BladeMark className="size-7 shrink-0 text-ink [--mark-groove:var(--wall)]" />
      <span className="text-carved small-caps text-lg leading-none whitespace-nowrap">
        Sword <span className="text-accent">&amp;</span> Blade
      </span>
    </span>
  );
}
