import { useLocale, useTranslations } from 'next-intl';

import { categoryLabel, type Locale, type SwordCategory } from '@snb/domain';

import { Link } from '@/shared/i18n';
import { cn } from '@/shared/lib';

const CATEGORIES: Array<SwordCategory | undefined> = [undefined, 'east', 'west', 'legend'];

/** 분류 링크. 지금 보고 있는 분류는 aria-current로 알립니다. */
export function CategoryNav({ current, className }: { current?: SwordCategory; className?: string }) {
  const t = useTranslations('Header');
  const locale = useLocale() as Locale;
  return (
    <nav aria-label={t('categoryNav')} className={className}>
      <ul className="flex flex-wrap items-center gap-x-0.5 gap-y-1 sm:gap-x-1">
        {CATEGORIES.map((value) => {
          const active = value === current;
          return (
            <li key={value ?? 'all'}>
              <Link
                href={value ? { pathname: '/', query: { category: value } } : '/'}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center px-1.5 text-sm small-caps text-ink-muted transition-colors hover:text-ink sm:px-3',
                  active && 'text-ink underline decoration-accent decoration-1 underline-offset-8',
                )}
              >
                {value ? categoryLabel(value, locale) : t('all')}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
