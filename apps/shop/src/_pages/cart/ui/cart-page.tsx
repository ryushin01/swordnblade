import { CartView } from './cart-view';

export function CartPage() {
  return (
    <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-12 sm:px-8">
      <h1 className="text-carved text-3xl">장바구니</h1>
      <CartView />
    </div>
  );
}
