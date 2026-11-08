import { getTranslations, setRequestLocale } from 'next-intl/server';

import { type AppLocale, languageAlternates } from '@/shared/i18n';

import { AccountView } from './account-view';

import type { Metadata } from 'next';

type Params = Promise<{ locale: string }>;

export async function generateAccountMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    title: t('account'),
    alternates: languageAlternates('/account', locale as AppLocale),
    robots: { index: false },
  };
}

export async function AccountPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Account');
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-8 px-4 py-12">
      <h1 className="text-carved text-center text-3xl">{t('title')}</h1>
      <AccountView />
    </div>
  );
}
