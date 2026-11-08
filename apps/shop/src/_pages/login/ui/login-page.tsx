import { getTranslations, setRequestLocale } from 'next-intl/server';

import { type AppLocale, languageAlternates } from '@/shared/i18n';
import { firstParam, safeNextPath } from '@/shared/lib';

import { LoginForm } from './login-form';

import type { Metadata } from 'next';

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ next?: string | string[] }>;

export async function generateLoginMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return { title: t('login'), alternates: languageAlternates('/login', locale as AppLocale), robots: { index: false } };
}

export async function LoginPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Auth');
  const { next } = await searchParams;
  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-4 py-12">
      <h1 className="text-carved text-center text-3xl">{t('loginTitle')}</h1>
      <p className="text-center text-ink-muted">{t('loginIntro')}</p>
      <LoginForm next={safeNextPath(firstParam(next))} />
    </div>
  );
}
