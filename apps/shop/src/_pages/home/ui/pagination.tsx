import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Link } from '@/shared/i18n';
import { cn } from '@/shared/lib';

type Query = Record<string, string>;

const ITEM = 'inline-flex size-11 items-center justify-center rounded-sm text-sm tabular-nums';

/**
 * 목록 쪽 이동. 링크라 자바스크립트 없이도 동작하고 쪽 번호가 주소(?page=)에 남습니다.
 * 지금 쪽은 aria-current="page", 첫·마지막 쪽에서는 이전·다음을 링크 대신 비활성 글자로 둡니다.
 */
export function Pagination({ page, pages, query }: { page: number; pages: number; query: Query }) {
  const t = useTranslations('Home');
  if (pages <= 1) return null;
  const href = (target: number) => ({
    pathname: '/' as const,
    query: target > 1 ? { ...query, page: String(target) } : query,
  });

  return (
    <nav aria-label={t('pagination')} className="mx-auto max-w-[90rem] px-4 py-8 sm:px-8">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} aria-label={t('prevPage')} className={cn(ITEM, 'hover:bg-wall-raised')}>
              <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </Link>
          ) : (
            <span aria-hidden="true" className={cn(ITEM, 'text-ink-muted/40')}>
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </span>
          )}
        </li>
        {Array.from({ length: pages }, (_, index) => index + 1).map((target) => (
          <li key={target}>
            <Link
              href={href(target)}
              aria-current={target === page ? 'page' : undefined}
              className={cn(
                ITEM,
                target === page ? 'border-2 border-ink' : 'border border-transparent hover:bg-wall-raised',
              )}
            >
              {/* 이름은 '1쪽'(영어 'Page 1')으로 읽히고, 보이는 숫자가 이름 안에 그대로 들어갑니다. */}
              {t('pagePrefix') ? <span className="sr-only">{t('pagePrefix')}</span> : null}
              {target}
              {t('pageSuffix') ? <span className="sr-only">{t('pageSuffix')}</span> : null}
            </Link>
          </li>
        ))}
        <li>
          {page < pages ? (
            <Link href={href(page + 1)} aria-label={t('nextPage')} className={cn(ITEM, 'hover:bg-wall-raised')}>
              <ChevronRight aria-hidden="true" className="size-5" strokeWidth={1.5} />
            </Link>
          ) : (
            <span aria-hidden="true" className={cn(ITEM, 'text-ink-muted/40')}>
              <ChevronRight className="size-5" strokeWidth={1.5} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
