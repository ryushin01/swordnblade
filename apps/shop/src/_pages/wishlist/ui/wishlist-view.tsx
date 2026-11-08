'use client';

import { useLocale, useTranslations } from 'next-intl';

import { localizeForLocale, SwordTile, useSwords } from '@/entities/sword';
import { useWishlistHydrated, useWishlistStore } from '@/entities/wishlist';
import { Link } from '@/shared/i18n';
import { Button } from '@/shared/ui';

import type { Locale } from '@snb/domain';

/** 찜한 도검. 칸은 링크라서 찜 해제 버튼은 칸 바깥(아래)에 둡니다. */
export function WishlistView() {
  const t = useTranslations('Wishlist');
  const locale = useLocale() as Locale;
  const hydrated = useWishlistHydrated();
  const ids = useWishlistStore((state) => state.ids);
  const toggle = useWishlistStore((state) => state.toggle);
  const { data, isError, refetch } = useSwords();

  if (isError && !data) {
    return (
      <div role="alert" className="grid justify-items-center gap-4 py-16 text-center">
        <p>{t('loadError')}</p>
        <Button variant="outline" className="rounded-sm" onClick={() => void refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  if (!hydrated || !data) {
    return (
      <p role="status" className="py-16 text-center text-ink-muted">
        {t('loading')}
      </p>
    );
  }

  // 찜한 순서대로 보여 주고, 어드민에서 지운 도검은 뺍니다.
  const swords = ids.flatMap((id) => {
    const sword = data.find((item) => item.id === id);
    return sword ? [localizeForLocale(sword, locale)] : [];
  });

  if (swords.length === 0) {
    return (
      <div className="grid justify-items-center gap-4 py-16 text-center">
        <p>{t('empty')}</p>
        <Link href="/" className="inline-flex min-h-11 items-center underline underline-offset-4">
          {t('browse')}
        </Link>
      </div>
    );
  }

  return (
    <>
      <p role="status" className="px-4 pb-3 text-sm text-ink-muted sm:px-8">
        {t('count', { count: swords.length })}
      </p>
      <ul
        aria-labelledby="wishlist-title"
        className="grid grid-cols-2 border-l border-t border-line md:grid-cols-3 xl:grid-cols-4"
      >
        {swords.map((sword) => (
          <li key={sword.id} className="grid border-b border-r border-line">
            <SwordTile sword={sword} />
            <button
              type="button"
              onClick={() => toggle(sword.id)}
              className="min-h-11 border-t border-line px-2 text-sm hover:bg-wall-raised"
            >
              {t('remove', { name: sword.name })}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
