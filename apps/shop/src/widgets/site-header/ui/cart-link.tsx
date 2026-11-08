'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';

import { selectItemCount, useCartHydrated, useCartStore } from '@/entities/cart';
import { Link } from '@/shared/i18n';

export function CartLink() {
  const t = useTranslations('Header');
  const hydrated = useCartHydrated();
  const count = useCartStore(selectItemCount);
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/cart"
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-1 text-sm small-caps text-ink hover:text-accent sm:gap-2 sm:px-2"
    >
      <ShoppingBag aria-hidden="true" className="size-4" strokeWidth={1.4} />
      {/* 좁은 화면에서는 글자를 숨기고 아이콘과 개수만 보입니다. 이름은 화면낭독기에 그대로 읽힙니다. */}
      <span className="sr-only sm:not-sr-only">{t('cart')}</span>
      <span className="tabular-nums" aria-live="polite">
        <span aria-hidden="true">({shown})</span>
        <span className="sr-only">{t('cartCount', { count: shown })}</span>
      </span>
    </Link>
  );
}
