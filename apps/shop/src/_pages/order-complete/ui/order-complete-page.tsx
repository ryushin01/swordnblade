import { OrderReceipt } from './order-receipt';

export async function OrderCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="px-4 py-12 sm:px-8">
      <OrderReceipt id={decodeURIComponent(id)} />
    </div>
  );
}
