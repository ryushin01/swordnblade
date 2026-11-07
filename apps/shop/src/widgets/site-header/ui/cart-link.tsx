'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

import { selectItemCount, useCartHydrated, useCartStore } from '@/entities/cart';

export function CartLink() {
  const hydrated = useCartHydrated();
  const count = useCartStore(selectItemCount);
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/cart"
      className="inline-flex min-h-11 items-center gap-2 px-2 text-sm small-caps text-ink hover:text-accent"
    >
      <ShoppingBag aria-hidden="true" className="size-4" strokeWidth={1.4} />
      장바구니
      <span className="tabular-nums" aria-live="polite">
        <span aria-hidden="true">({shown})</span>
        <span className="sr-only">{shown}점</span>
      </span>
    </Link>
  );
}
