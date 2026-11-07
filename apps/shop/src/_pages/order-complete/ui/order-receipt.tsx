'use client';

import Link from 'next/link';
import { COUNTRY_NAME, formatKRW, ORDER_STATUS_LABEL } from '@snb/domain';
import { useOrder } from '@/entities/order';
import { OrnamentHeading } from '@/shared/ui';

export function OrderReceipt({ id }: { id: string }) {
  const { data: order, isPending, isError } = useOrder(id);

  if (isPending) {
    return (
      <p aria-busy="true" className="py-24 text-center">
        주문을 확인하는 중입니다.
      </p>
    );
  }
  if (isError) {
    return (
      <div className="grid justify-items-center gap-4 py-24 text-center">
        <h1 className="text-2xl text-carved">주문을 찾을 수 없습니다</h1>
        <Link href="/" className="underline underline-offset-4">
          도검 벽으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-8">
      <header className="grid justify-items-center gap-3 text-center">
        <OrnamentHeading as="p" className="w-full">
          주문 접수
        </OrnamentHeading>
        <h1 className="text-3xl text-carved">주문이 벽에 새겨졌습니다</h1>
        <p className="text-ink-muted">
          주문번호 <strong className="font-semibold tabular-nums text-ink">{order.id}</strong> · {ORDER_STATUS_LABEL[order.status]}
        </p>
        {order.status === 'permit-review' ? (
          <p className="text-sm text-ink-muted">진검이 포함되어 허가 서류를 확인한 뒤 출고합니다. 안내 메일을 보내 드립니다.</p>
        ) : null}
      </header>

      <section aria-labelledby="receipt-lines" className="grid gap-3">
        <OrnamentHeading id="receipt-lines">주문 내역</OrnamentHeading>
        <ul className="grid gap-2">
          {order.lines.map((line) => (
            <li key={line.swordId} className="flex justify-between gap-4">
              <span>
                {line.name} × {line.quantity} <span className="text-sm text-ink-muted">({COUNTRY_NAME[line.origin]} 출고)</span>
              </span>
              <span className="tabular-nums">{formatKRW(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-t border-line pt-3">
          <dt className="text-ink-muted">배송비</dt>
          <dd className="text-right tabular-nums">{formatKRW(order.amounts.shipping)}</dd>
          <dt className="text-ink-muted">관세</dt>
          <dd className="text-right tabular-nums">{formatKRW(order.amounts.duty)}</dd>
          <dt className="text-ink-muted">부가세</dt>
          <dd className="text-right tabular-nums">{formatKRW(order.amounts.vat)}</dd>
          <dt className="text-lg">결제 금액</dt>
          <dd className="text-right text-lg tabular-nums">{formatKRW(order.amounts.total)}</dd>
        </dl>
      </section>

      <section aria-labelledby="receipt-shipping" className="grid gap-3">
        <OrnamentHeading id="receipt-shipping">배송지</OrnamentHeading>
        <p>
          {order.customer.name} · {COUNTRY_NAME[order.destination]}
          <br />({order.customer.postalCode}) {order.customer.address}
        </p>
      </section>

      <Link href="/" className="justify-self-center underline underline-offset-4">
        도검 벽으로 돌아가기
      </Link>
    </div>
  );
}
