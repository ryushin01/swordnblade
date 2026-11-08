'use client';

import { useState } from 'react';

import { cn } from '@/shared/lib/utils';

/**
 * 원형 프로필 사진. 사진이 없거나 못 불러오면 이름 첫 글자를 보여 줍니다.
 * 옆에 이름이 함께 나오므로 장식으로 숨깁니다.
 */
export function Avatar({ src, name, className }: { src?: string; name: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPhoto = src && failedSrc !== src;
  const base = cn('inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full', className);
  if (showPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Mock API가 브라우저에서 돌려주는 사진이라 next/image 최적화를 쓸 수 없습니다.
      <img src={src} alt="" onError={() => setFailedSrc(src)} className={cn(base, 'object-cover')} />
    );
  }
  return (
    <span aria-hidden="true" className={cn(base, 'border border-line bg-wall-raised text-lg text-ink')}>
      {[...name.trim()][0] ?? ''}
    </span>
  );
}
