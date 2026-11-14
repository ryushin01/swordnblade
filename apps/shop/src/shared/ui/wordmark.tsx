import Image from 'next/image';

import { cn } from '@/shared/lib/utils';

/** 교차한 두 검 아이콘 + SWORD & BLADE 글자. 링크 안에 넣으면 글자가 링크 이름이 되고 아이콘은 꾸밈입니다. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 sm:gap-2.5', className)}>
      <Image src="/brand/logo.png" alt="" width={28} height={28} className="size-6 shrink-0 sm:size-7" />
      <span className="text-carved small-caps text-base leading-none whitespace-nowrap sm:text-lg">
        Sword <span className="text-accent">&amp;</span> Blade
      </span>
    </span>
  );
}
