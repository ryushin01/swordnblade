'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COUNTRY_NAME, estimateCustoms, findCountryRule, formatKRW, requiresPossessionPermit, type Order } from '@snb/domain';
import { useCartHydrated, useCartStore } from '@/entities/cart';
import { CustomsBreakdown, useCustomsConfig } from '@/entities/tariff';
import { useSwords } from '@/entities/sword';
import { CheckoutForm } from './checkout-form';
import { OrnamentHeading } from '@/shared/ui';

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const lines = useCartStore((state) => state.lines);
  const destination = useCartStore((state) => state.destination);
  const clear = useCartStore((state) => state.clear);
  const swords = useSwords();
  const config = useCustomsConfig();
  const [placedId, setPlacedId] = useState<string | null>(null);

  if (placedId) {
    return (
      <p aria-live="polite" className="py-24 text-center">
        주문 {placedId}을 접수했습니다. 주문 확인 화면으로 이동합니다.
      </p>
    );
  }

  if (!hydrated || swords.isPending || config.isPending) {
    return (
      <p aria-busy="true" className="py-24 text-center">
        주문서를 준비하는 중입니다.
      </p>
    );
  }
  if (swords.isError || config.isError) {
    return (
      <p role="alert" className="py-24 text-center">
        주문 정보를 불러오지 못했습니다. 새로고침해 주세요.
      </p>
    );
  }

  const items = lines.flatMap((line) => {
    const sword = swords.data.find((item) => item.id === line.swordId);
    return sword ? [{ line, sword }] : [];
  });

  if (items.length === 0) {
    return (
      <div className="grid justify-items-center gap-4 py-24 text-center">
        <p className="text-lg">주문할 도검이 없습니다.</p>
        <Link href="/" className="underline underline-offset-4">
          도검 둘러보기
        </Link>
      </div>
    );
  }

  const estimate = estimateCustoms(
    items.map(({ line, sword }) => ({ origin: sword.origin, unitPrice: sword.price, quantity: line.quantity })),
    destination,
    config.data,
  );
  const rule = findCountryRule(config.data, destination);
  const needsPermit = items.some(({ sword }) => requiresPossessionPermit(sword.specs));

  const handlePlaced = (order: Order) => {
    setPlacedId(order.id);
    clear();
    router.replace(`/orders/${order.id}`);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <section aria-labelledby="checkout-form-title" className="grid content-start gap-6">
        <h2 id="checkout-form-title" className="sr-only">
          주문서
        </h2>
        <p>
          배송 국가: <strong className="font-semibold">{COUNTRY_NAME[destination]}</strong>{' '}
          <Link href="/cart" className="text-sm underline underline-offset-4">
            장바구니에서 바꾸기
          </Link>
        </p>
        <CheckoutForm
          destination={destination}
          lines={items.map(({ line }) => ({ swordId: line.swordId, quantity: line.quantity }))}
          needsPermit={needsPermit}
          permitNote={rule.permitNote}
          onPlaced={handlePlaced}
        />
      </section>
      <aside aria-labelledby="checkout-summary-title" className="grid content-start gap-5">
        <OrnamentHeading id="checkout-summary-title">주문 요약</OrnamentHeading>
        <ul className="grid gap-2">
          {items.map(({ line, sword }) => (
            <li key={sword.id} className="flex justify-between gap-4">
              <span>
                {sword.name} × {line.quantity}
              </span>
              <span className="tabular-nums">{formatKRW(sword.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <CustomsBreakdown estimate={estimate} config={config.data} />
      </aside>
    </div>
  );
}
