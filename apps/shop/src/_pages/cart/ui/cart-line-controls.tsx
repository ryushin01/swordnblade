'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';

import { MAX_QUANTITY, useCartStore } from '@/entities/cart';

export function QuantitySelect({
  swordId,
  name,
  quantity,
  stock,
}: {
  swordId: string;
  name: string;
  quantity: number;
  stock: number;
}) {
  const t = useTranslations('Cart');
  const id = useId();
  const setQuantity = useCartStore((state) => state.setQuantity);
  const max = Math.max(1, Math.min(stock, MAX_QUANTITY));
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {t('quantityOf', { name })}
      </label>
      <select
        id={id}
        value={quantity}
        onChange={(event) => setQuantity(swordId, Number(event.target.value))}
        className="h-11 rounded-sm border border-input bg-wall-raised px-2"
      >
        {Array.from({ length: Math.max(max, quantity) }, (_, index) => index + 1).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </>
  );
}

export function RemoveLineButton({ swordId, name }: { swordId: string; name: string }) {
  const t = useTranslations('Cart');
  const remove = useCartStore((state) => state.remove);
  return (
    <button
      type="button"
      onClick={() => remove(swordId)}
      className="min-h-11 px-2 text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
    >
      <span>{t('remove')}</span>
      <span className="sr-only">{t('removeOf', { name })}</span>
    </button>
  );
}
