import { CheckoutView } from './checkout-view';

export function CheckoutPage() {
  return (
    <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-12 sm:px-8">
      <h1 className="text-carved text-3xl">주문서</h1>
      <CheckoutView />
    </div>
  );
}
