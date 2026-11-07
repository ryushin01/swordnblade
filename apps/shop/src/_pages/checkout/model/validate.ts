export interface CheckoutValues {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  paymentMethod: '' | 'card' | 'transfer';
  permitConfirmed: boolean;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

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
  if (!values.name.trim()) errors.name = '받는 분 이름을 입력해 주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = '이메일을 example@domain.com 형식으로 입력해 주세요.';
  if (values.phone.replace(/\D/g, '').length < 7) errors.phone = '연락처를 숫자 7자리 이상으로 입력해 주세요.';
  if (!values.postalCode.trim()) errors.postalCode = '우편번호를 입력해 주세요.';
  if (!values.address.trim()) errors.address = '주소를 입력해 주세요.';
  if (!values.paymentMethod) errors.paymentMethod = '결제 수단을 선택해 주세요.';
  if (needsPermit && !values.permitConfirmed) errors.permitConfirmed = '도검 소지·수입 허가 안내를 확인하고 체크해 주세요.';
  return errors;
}
