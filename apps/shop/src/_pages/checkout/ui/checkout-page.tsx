import { getTranslations, setRequestLocale } from 'next-intl/server';

import { type AppLocale, languageAlternates } from '@/shared/i18n';

import { CheckoutView } from './checkout-view';

import type { Metadata } from 'next';

type Params = Promise<{ locale: string }>;

export async function generateCheckoutMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    title: t('checkout'),
    alternates: languageAlternates('/checkout', locale as AppLocale),
    robots: { index: false },
  };
}

export async function CheckoutPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Checkout');
  return (
    <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-12 sm:px-8">
      <h1 className="text-carved text-3xl">{t('title')}</h1>
      <CheckoutView />
    </div>
  );
}
