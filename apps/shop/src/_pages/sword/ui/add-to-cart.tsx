'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { MAX_QUANTITY, useCartStore } from '@/entities/cart';
import { Button } from '@/shared/ui';

import type { Sword } from '@snb/domain';

export function AddToCart({ sword }: { sword: Sword }) {
  const add = useCartStore((state) => state.add);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const selectId = useId();
  const max = Math.min(sword.stock, MAX_QUANTITY);

  if (sword.stock <= 0) {
    return <p className="text-ink-muted">품절되었습니다. 다음 제작을 기다려 주세요.</p>;
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1.5">
        <label htmlFor={selectId} className="text-sm">
          수량
        </label>
        <select
          id={selectId}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="h-11 min-w-20 rounded-sm border border-input bg-wall-raised px-3"
        >
          {Array.from({ length: max }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {value}점
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
          toast.success(`${sword.name} ${quantity}점을 장바구니에 담았습니다.`, {
            action: { label: '장바구니 보기', onClick: () => router.push('/cart') },
          });
        }}
      >
        장바구니에 담기
      </Button>
      <Link href="/cart" className="sr-only focus:not-sr-only focus:underline">
        장바구니로 가기
      </Link>
    </div>
  );
}
