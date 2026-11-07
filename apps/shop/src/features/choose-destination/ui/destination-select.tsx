'use client';

import { useId } from 'react';

import { useCartStore } from '@/entities/cart';
import { cn } from '@/shared/lib';

import type { CountryCode, CustomsConfig } from '@snb/domain';

/** 배송 국가를 고르면 장바구니 전체의 관세 계산 기준이 바뀝니다. */
export function DestinationSelect({ config, className }: { config: CustomsConfig; className?: string }) {
  const id = useId();
  const destination = useCartStore((state) => state.destination);
  const setDestination = useCartStore((state) => state.setDestination);

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-sm">
        배송 국가
      </label>
      <select
        id={id}
        value={destination}
        onChange={(event) => setDestination(event.target.value as CountryCode)}
        aria-describedby={`${id}-hint`}
        className="h-11 rounded-sm border border-input bg-wall-raised px-3"
      >
        {config.countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      <p id={`${id}-hint`} className="text-sm text-ink-muted">
        국가를 바꾸면 관세와 부가세 예상액이 바로 다시 계산됩니다.
      </p>
    </div>
  );
}
