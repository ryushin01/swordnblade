import { Suspense } from 'react';

import { Link } from '@/shared/i18n';
import { Wordmark } from '@/shared/ui';

import { AccountLink } from './account-link';
import { CartLink } from './cart-link';
import { LocaleLinks, LocaleSwitch } from './locale-switch';
import { WishlistLink } from './wishlist-link';
import { WishlistSync } from './wishlist-sync';

export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-line">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2 sm:gap-x-6 sm:px-8 sm:py-3">
        <Link href="/" className="inline-flex min-h-11 items-center">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* 서버 HTML에도 같은 모양의 링크를 그려 두어, hydrate 뒤에 머리글 폭이 바뀌지 않게 합니다. */}
          <Suspense fallback={<LocaleLinks />}>
            <LocaleSwitch />
          </Suspense>
          <AccountLink />
          <WishlistLink />
          <WishlistSync />
          <CartLink />
        </div>
      </div>
    </header>
  );
}
