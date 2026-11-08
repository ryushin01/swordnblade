'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { MAX_QUANTITY, useCartStore } from '@/entities/cart';
import { Link, useRouter } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Button, selectClassName } from '@/shared/ui';

import type { Sword } from '@snb/domain';

export function AddToCart({ sword }: { sword: Sword }) {
  const t = useTranslations('AddToCart');
  const add = useCartStore((state) => state.add);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const selectId = useId();
  const max = Math.min(sword.stock, MAX_QUANTITY);

  if (sword.stock <= 0) {
    return <p className="text-ink-muted">{t('soldOut')}</p>;
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <label htmlFor={selectId} className="text-sm">
          {t('quantity')}
        </label>
        <select
          id={selectId}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className={cn(selectClassName, 'min-w-24')}
        >
          {Array.from({ length: max }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {t('unit', { count: value })}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="button"
        size="lg"
        className="h-11 flex-1 rounded-sm small-caps text-base"
        onClick={() => {
          add(sword.id, quantity);
          toast.success(t('added', { name: sword.name, count: quantity }), {
            action: { label: t('viewCart'), onClick: () => router.push('/cart') },
          });
        }}
      >
        {t('add')}
      </Button>
      <Link href="/cart" className="sr-only focus:not-sr-only focus:underline">
        {t('goToCart')}
      </Link>
    </div>
  );
}
