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
      className="inline-flex min-h-11 items-center gap-2 px-2 text-sm small-caps text-ink hover:text-accent"
    >
      <ShoppingBag aria-hidden="true" className="size-4" strokeWidth={1.4} />
      {t('cart')}
      <span className="tabular-nums" aria-live="polite">
        <span aria-hidden="true">({shown})</span>
        <span className="sr-only">{t('cartCount', { count: shown })}</span>
      </span>
    </Link>
  );
}
