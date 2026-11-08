'use client';

import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';

import { useWishlistHydrated, useWishlistStore } from '@/entities/wishlist';
import { Link } from '@/shared/i18n';

/** 찜 목록 링크. 아이콘만 보이고 이름과 개수는 화면낭독기에 읽힙니다. */
export function WishlistLink() {
  const t = useTranslations('Header');
  const hydrated = useWishlistHydrated();
  const count = useWishlistStore((state) => state.ids.length);
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/wishlist"
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 px-1 text-sm text-ink hover:text-accent"
    >
      <Heart aria-hidden="true" className="size-4" strokeWidth={1.4} />
      <span className="sr-only">{t('wishlist')}</span>
      <span className="tabular-nums">
        <span aria-hidden="true">{shown}</span>
        <span className="sr-only">{t('wishlistCount', { count: shown })}</span>
      </span>
    </Link>
  );
}
