import { getTranslations, setRequestLocale } from 'next-intl/server';

import { OrderReceipt } from './order-receipt';

import type { Metadata } from 'next';

type Params = Promise<{ locale: string; id: string }>;

export async function generateOrderMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  // 주문 확인은 사람마다 다른 화면이라 검색에 올리지 않습니다.
  return { title: t('order'), robots: { index: false } };
}

export async function OrderCompletePage({ params }: { params: Params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <div className="px-4 py-12 sm:px-8">
      <OrderReceipt id={decodeURIComponent(id)} />
    </div>
  );
}
