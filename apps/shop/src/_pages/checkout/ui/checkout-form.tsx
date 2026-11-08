'use client';

import { type FormEvent, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useCreateOrder } from '@/entities/order';
import { useMe } from '@/entities/session';
import { ApiRequestError } from '@/shared/api';
import { cn } from '@/shared/lib';
import { Button, ErrorSummary, TextField, useErrorFocus } from '@/shared/ui';

import { type CheckoutErrors, type CheckoutValues, FIELD_ORDER, validateCheckout } from '../model/validate';

import type { CountryCode, Order } from '@snb/domain';

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
  const t = useTranslations('Checkout');
  const common = useTranslations('Common');
  const errorText = (field: keyof CheckoutValues) => (errors[field] ? t(`errors.${field}`) : undefined);
  const [values, setValues] = useState<CheckoutValues>(INITIAL);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const { ref: summaryRef, moveFocus } = useErrorFocus();
  const submittingRef = useRef(false);
  const createOrder = useCreateOrder();
  const me = useMe();
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);

  // 로그인한 회원이면 비어 있는 이름·이메일을 회원 정보로 한 번 채웁니다(렌더 중 상태 맞추기).
  if (me.data && prefilledFor !== me.data.id) {
    const user = me.data;
    setPrefilledFor(user.id);
    setValues((current) => ({
      ...current,
      name: current.name || user.name,
      email: current.email || user.email,
    }));
  }

  const update = <K extends keyof CheckoutValues>(key: K, value: CheckoutValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const showErrors = (next: CheckoutErrors, nextMessage: string) => {
    setErrors(next);
    setMessage(nextMessage);
    moveFocus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 결제 요청 중에는 다시 보내지 않습니다. isPending은 다음 렌더에야 바뀌므로
    // 빠른 연속 클릭은 ref로 막습니다.
    if (submittingRef.current || createOrder.isPending) return;

    const nextErrors = validateCheckout(values, needsPermit);
    if (Object.keys(nextErrors).length > 0) {
      showErrors(nextErrors, t('checkError'));
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
          if (error instanceof ApiRequestError && Object.keys(error.fields).length > 0) {
            // 서버가 알려 준 칸만 표시하고, 안내 문구는 화면 언어로 씁니다.
            const fields = FIELD_ORDER.filter((field) => field in error.fields);
            showErrors(Object.fromEntries(fields.map((field) => [field, true])), t('checkError'));
          } else {
            showErrors({}, t('genericError'));
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
        <ErrorSummary
          id="checkout-error-title"
          summaryRef={summaryRef}
          message={message}
          items={errorList.map((field) => ({
            fieldId: fieldId(field),
            text: `${t(`fields.${field}`)}: ${errorText(field)}`,
          }))}
        />
      ) : null}

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-lg text-carved">{t('recipient')}</legend>
        <TextField
          id={fieldId('name')}
          label={t('fields.name')}
          name="name"
          autoComplete="name"
          required
          value={values.name}
          error={errorText('name')}
          onChange={(event) => update('name', event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id={fieldId('email')}
            label={t('fields.email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            hint={t('emailHint')}
            value={values.email}
            error={errorText('email')}
            onChange={(event) => update('email', event.target.value)}
          />
          <TextField
            id={fieldId('phone')}
            label={t('fields.phone')}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            hint={t('phoneHint')}
            value={values.phone}
            error={errorText('phone')}
            onChange={(event) => update('phone', event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <TextField
            id={fieldId('postalCode')}
            label={t('fields.postalCode')}
            name="postalCode"
            autoComplete="postal-code"
            required
            value={values.postalCode}
            error={errorText('postalCode')}
            onChange={(event) => update('postalCode', event.target.value)}
          />
          <TextField
            id={fieldId('address')}
            label={t('fields.address')}
            name="address"
            autoComplete="street-address"
            required
            value={values.address}
            error={errorText('address')}
            onChange={(event) => update('address', event.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-2" aria-describedby={paymentErrorId}>
        <legend className="mb-2 text-lg text-carved">
          {t('payment')} <span className="text-base text-danger">{common('required')}</span>
        </legend>
        {(
          [
            ['card', t('card')],
            ['transfer', t('transfer')],
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
            {errorText('paymentMethod')}
          </p>
        ) : null}
        <p className="text-sm text-ink-muted">{t('mockNote')}</p>
      </fieldset>

      {needsPermit ? (
        <fieldset className="grid gap-3 rounded-sm border border-line bg-wall-raised/60 p-4">
          <legend className="px-1 text-lg text-carved">{t('permitLegend')}</legend>
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
              {t('permitConfirm')} <span className="text-danger">{common('required')}</span>
            </span>
          </label>
          {errors.permitConfirmed ? (
            <p id={permitErrorId} className="text-sm text-danger">
              {errorText('permitConfirmed')}
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
        {createOrder.isPending ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
