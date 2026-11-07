export interface CheckoutValues {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  paymentMethod: '' | 'card' | 'transfer';
  permitConfirmed: boolean;
}

/** 칸마다 오류가 있으면 true. 안내 문구는 화면이 언어에 맞게 고릅니다(messages의 Checkout.errors). */
export type CheckoutErrors = Partial<Record<keyof CheckoutValues, true>>;

/** 화면에 보여 줄 순서. 오류 요약도 이 순서를 따릅니다. */
export const FIELD_ORDER: Array<keyof CheckoutValues> = [
  'name',
  'email',
  'phone',
  'postalCode',
  'address',
  'paymentMethod',
  'permitConfirmed',
];

export function validateCheckout(values: CheckoutValues, needsPermit: boolean): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!values.name.trim()) errors.name = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = true;
  if (values.phone.replace(/\D/g, '').length < 7) errors.phone = true;
  if (!values.postalCode.trim()) errors.postalCode = true;
  if (!values.address.trim()) errors.address = true;
  if (!values.paymentMethod) errors.paymentMethod = true;
  if (needsPermit && !values.permitConfirmed) errors.permitConfirmed = true;
  return errors;
}
