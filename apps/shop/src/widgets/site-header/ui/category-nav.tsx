import Link from 'next/link';

import { CATEGORY_LABEL, type SwordCategory } from '@snb/domain';

import { cn } from '@/shared/lib';

const ITEMS: Array<{ value?: SwordCategory; label: string }> = [
  { label: '전체' },
  { value: 'east', label: CATEGORY_LABEL.east },
  { value: 'west', label: CATEGORY_LABEL.west },
  { value: 'legend', label: CATEGORY_LABEL.legend },
];

/** 분류 링크. 지금 보고 있는 분류는 aria-current로 알립니다. */
export function CategoryNav({ current, className }: { current?: SwordCategory; className?: string }) {
  return (
    <nav aria-label="도검 분류" className={className}>
      <ul className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {ITEMS.map((item) => {
          const active = item.value === current;
          return (
            <li key={item.label}>
              <Link
                href={item.value ? `/?category=${item.value}` : '/'}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center px-3 text-sm small-caps text-ink-muted transition-colors hover:text-ink',
                  active && 'text-ink underline decoration-accent decoration-1 underline-offset-8',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
