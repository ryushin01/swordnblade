import { useLocale, useTranslations } from 'next-intl';

import { categoryLabel, type Locale, SWORD_CATEGORIES, type SwordCategory } from '@snb/domain';

import { Link } from '@/shared/i18n';
import { cn } from '@/shared/lib';

/** 분류 링크(전체와 다섯 지역). 지금 보고 있는 분류는 aria-current로 알립니다. */
export function CategoryNav({ current }: { current?: SwordCategory }) {
  const t = useTranslations('Home');
  const locale = useLocale() as Locale;
  const items: Array<SwordCategory | undefined> = [undefined, ...SWORD_CATEGORIES];
  return (
    <nav aria-label={t('categoryNav')} className="mx-auto max-w-[90rem] px-4 pb-4 sm:px-8">
      <ul className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
        {items.map((value) => {
          const active = value === current;
          return (
            <li key={value ?? 'all'}>
              <Link
                href={value ? { pathname: '/', query: { category: value } } : '/'}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center px-2 text-sm small-caps text-ink-muted transition-colors hover:text-ink sm:px-3',
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
