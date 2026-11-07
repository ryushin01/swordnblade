import type { ElementType, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

/** 양옆에 선과 점을 둔 작은 제목: ── • 공방에서 • ── */
export function OrnamentHeading({
  as: Tag = 'h2',
  children,
  className,
  id,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <Tag id={id} className={cn('flex items-center gap-3 text-sm text-accent small-caps', className)}>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      <span aria-hidden="true" className="size-1 rounded-full bg-accent" />
      <span className="whitespace-nowrap">{children}</span>
      <span aria-hidden="true" className="size-1 rounded-full bg-accent" />
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </Tag>
  );
}
