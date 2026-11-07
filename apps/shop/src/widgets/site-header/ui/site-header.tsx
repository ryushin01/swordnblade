import { Suspense } from 'react';

import { Link } from '@/shared/i18n';
import { Wordmark } from '@/shared/ui';

import { CartLink } from './cart-link';
import { CategoryNav } from './category-nav';
import { HeaderNav } from './header-nav';
import { LocaleSwitch } from './locale-switch';

export function SiteHeader() {
  return (
    <header className="relative z-10 border-b border-line">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 sm:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center">
          <Wordmark />
        </Link>
        <div className="order-3 w-full sm:order-2 sm:w-auto">
          <Suspense fallback={<CategoryNav />}>
            <HeaderNav />
          </Suspense>
        </div>
        <div className="order-2 flex items-center gap-2 sm:order-3">
          <Suspense fallback={null}>
            <LocaleSwitch />
          </Suspense>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
