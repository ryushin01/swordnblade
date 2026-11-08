'use client';

import { useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { type CountryCode, countryName, type CustomsConfig, type Locale } from '@snb/domain';

import { useCartStore } from '@/entities/cart';
import { cn } from '@/shared/lib';
import { selectClassName } from '@/shared/ui';

/** 배송 국가를 고르면 장바구니 전체의 관세 계산 기준이 바뀝니다. */
export function DestinationSelect({ config, className }: { config: CustomsConfig; className?: string }) {
  const t = useTranslations('Destination');
  const locale = useLocale() as Locale;
  const id = useId();
  const destination = useCartStore((state) => state.destination);
  const setDestination = useCartStore((state) => state.setDestination);

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={id} className="text-sm">
        {t('label')}
      </label>
      <select
        id={id}
        value={destination}
        onChange={(event) => setDestination(event.target.value as CountryCode)}
        aria-describedby={`${id}-hint`}
        className={selectClassName}
      >
        {config.countries.map((country) => (
          <option key={country.code} value={country.code}>
            {countryName(country.code, locale)}
          </option>
        ))}
      </select>
      <p id={`${id}-hint`} className="text-sm text-ink-muted">
        {t('hint')}
      </p>
    </div>
  );
}
