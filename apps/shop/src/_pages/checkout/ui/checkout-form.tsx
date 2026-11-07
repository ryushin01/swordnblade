'use client';

import { type FormEvent, useRef, useState } from 'react';

import { useCreateOrder } from '@/entities/order';
import { ApiRequestError } from '@/shared/api';
import { cn } from '@/shared/lib';
import { Button, TextField } from '@/shared/ui';

import { type CheckoutErrors, type CheckoutValues, FIELD_ORDER, validateCheckout } from '../model/validate';

import type { CountryCode, Order } from '@snb/domain';

const FIELD_LABEL: Record<keyof CheckoutValues, string> = {
  name: '받는 분',
  email: '이메일',
  phone: '연락처',
  postalCode: '우편번호',
  address: '주소',
  paymentMethod: '결제 수단',
  permitConfirmed: '허가 안내 확인',
};

const fieldId = (field: keyof CheckoutValues) => `checkout-${field}`;

interface CheckoutFormProps {
  destination: CountryCode;
  lines: Array<{ swordId: string; quantity: number }>;
  needsPermit: boolean;
  permitNote: string;
  onPlaced: (order: Order) => void;
}

const INITIAL: CheckoutValues = {
  name: '',
  email: '',
  phone: '',
  postalCode: '',
  address: '',
  paymentMethod: '',
  permitConfirmed: false,
};

export function CheckoutForm({ destination, lines, needsPermit, permitNote, onPlaced }: CheckoutFormProps) {
  const [values, setValues] = useState<CheckoutValues>(INITIAL);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const submittingRef = useRef(false);
  const createOrder = useCreateOrder();

  const update = <K extends keyof CheckoutValues>(key: K, value: CheckoutValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const showErrors = (next: CheckoutErrors, nextMessage: string) => {
    setErrors(next);
    setMessage(nextMessage);
    // 다음 렌더 뒤에 오류 요약으로 초점을 옮깁니다.
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 결제 요청 중에는 다시 보내지 않습니다. isPending은 다음 렌더에야 바뀌므로
    // 빠른 연속 클릭은 ref로 막습니다.
    if (submittingRef.current || createOrder.isPending) return;

    const nextErrors = validateCheckout(values, needsPermit);
    if (Object.keys(nextErrors).length > 0) {
      showErrors(nextErrors, '입력 내용을 확인해 주세요.');
      return;
    }

    submittingRef.current = true;
    setErrors({});
    setMessage(null);
    createOrder.mutate(
      {
        destination,
        lines,
        paymentMethod: values.paymentMethod as Order['paymentMethod'],
        permitConfirmed: values.permitConfirmed,
        customer: {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          postalCode: values.postalCode.trim(),
          address: values.address.trim(),
        },
      },
      {
        // 성공하면 화면을 떠나므로 잠금을 풀지 않습니다. 실패했을 때만 다시 보낼 수 있습니다.
        onSuccess: onPlaced,
        onError: (error) => {
          submittingRef.current = false;
          if (error instanceof ApiRequestError) {
            showErrors(error.fields as CheckoutErrors, error.message);
          } else {
            showErrors({}, '결제를 처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요.');
          }
        },
      },
    );
  };

  const errorList = FIELD_ORDER.filter((field) => errors[field]);
  const paymentErrorId = errors.paymentMethod ? `${fieldId('paymentMethod')}-error` : undefined;
  const permitErrorId = errors.permitConfirmed ? `${fieldId('permitConfirmed')}-error` : undefined;

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-8" aria-busy={createOrder.isPending}>
      {message ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-sm border-2 border-danger bg-wall-raised p-4 text-danger"
          aria-labelledby="checkout-error-title"
        >
          <h2 id="checkout-error-title" className="text-base">
            {message}
          </h2>
          {errorList.length > 0 ? (
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm">
              {errorList.map((field) => (
                <li key={field}>
                  <a href={`#${fieldId(field)}`} className="inline-block min-h-6 py-0.5 underline underline-offset-4">
                    {FIELD_LABEL[field]}: {errors[field]}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-lg text-carved">받는 분 정보</legend>
        <TextField
          id={fieldId('name')}
          label="받는 분"
          name="name"
          autoComplete="name"
          required
          value={values.name}
          error={errors.name}
          onChange={(event) => update('name', event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id={fieldId('email')}
            label="이메일"
            name="email"
            type="email"
            autoComplete="email"
            required
            hint="주문 확인 메일을 보내 드립니다."
            value={values.email}
            error={errors.email}
            onChange={(event) => update('email', event.target.value)}
          />
          <TextField
            id={fieldId('phone')}
            label="연락처"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            hint="예: 010-1234-5678"
            value={values.phone}
            error={errors.phone}
            onChange={(event) => update('phone', event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <TextField
            id={fieldId('postalCode')}
            label="우편번호"
            name="postalCode"
            autoComplete="postal-code"
            required
            value={values.postalCode}
            error={errors.postalCode}
            onChange={(event) => update('postalCode', event.target.value)}
          />
          <TextField
            id={fieldId('address')}
            label="주소"
            name="address"
            autoComplete="street-address"
            required
            value={values.address}
            error={errors.address}
            onChange={(event) => update('address', event.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-2" aria-describedby={paymentErrorId}>
        <legend className="mb-2 text-lg text-carved">
          결제 수단 <span className="text-base text-danger">(필수)</span>
        </legend>
        {(
          [
            ['card', '신용카드 (모의 결제)'],
            ['transfer', '계좌이체 (모의 결제)'],
          ] as const
        ).map(([value, label], index) => (
          <label key={value} className="flex min-h-11 items-center gap-3">
            <input
              type="radio"
              name="paymentMethod"
              value={value}
              id={index === 0 ? fieldId('paymentMethod') : undefined}
              checked={values.paymentMethod === value}
              onChange={() => update('paymentMethod', value)}
              className="size-5 accent-[var(--ink)]"
            />
            {label}
          </label>
        ))}
        {errors.paymentMethod ? (
          <p id={paymentErrorId} className="text-sm text-danger">
            {errors.paymentMethod}
          </p>
        ) : null}
        <p className="text-sm text-ink-muted">실제 결제는 일어나지 않습니다.</p>
      </fieldset>

      {needsPermit ? (
        <fieldset className="grid gap-3 rounded-sm border border-line bg-wall-raised/60 p-4">
          <legend className="px-1 text-lg text-carved">도검 허가 안내</legend>
          <p id="permit-note" className="text-sm leading-relaxed">
            {permitNote}
          </p>
          <label className="flex min-h-11 items-start gap-3">
            <input
              type="checkbox"
              id={fieldId('permitConfirmed')}
              checked={values.permitConfirmed}
              onChange={(event) => update('permitConfirmed', event.target.checked)}
              aria-invalid={errors.permitConfirmed ? true : undefined}
              aria-describedby={['permit-note', permitErrorId].filter(Boolean).join(' ')}
              className="mt-1 size-5 shrink-0 accent-[var(--ink)]"
            />
            <span>
              위 안내를 읽었으며, 필요한 소지·수입 허가를 받았거나 받을 예정입니다.{' '}
              <span className="text-danger">(필수)</span>
            </span>
          </label>
          {errors.permitConfirmed ? (
            <p id={permitErrorId} className="text-sm text-danger">
              {errors.permitConfirmed}
            </p>
          ) : null}
        </fieldset>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={createOrder.isPending}
        className={cn('h-12 rounded-sm text-base small-caps', createOrder.isPending && 'cursor-progress')}
      >
        {createOrder.isPending ? '결제 처리 중…' : '결제하기'}
      </Button>
    </form>
  );
}
