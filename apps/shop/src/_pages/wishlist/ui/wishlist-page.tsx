import { getTranslations, setRequestLocale } from 'next-intl/server';

import { type AppLocale, languageAlternates } from '@/shared/i18n';

import { WishlistView } from './wishlist-view';

import type { Metadata } from 'next';

type Params = Promise<{ locale: string }>;

export async function generateWishlistMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    title: t('wishlist'),
    alternates: languageAlternates('/wishlist', locale as AppLocale),
    robots: { index: false },
  };
}

export async function WishlistPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Wishlist');
  return (
    <div className="mx-auto max-w-[90rem] pb-12 pt-12">
      <h1 id="wishlist-title" className="text-carved pb-6 text-center text-3xl">
        {t('title')}
      </h1>
      <WishlistView />
    </div>
  );
}
