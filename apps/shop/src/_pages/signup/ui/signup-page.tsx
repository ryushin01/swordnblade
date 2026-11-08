import { getTranslations, setRequestLocale } from 'next-intl/server';

import { type AppLocale, languageAlternates } from '@/shared/i18n';
import { firstParam, safeNextPath } from '@/shared/lib';

import { SignupForm } from './signup-form';

import type { Metadata } from 'next';

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ next?: string | string[] }>;

export async function generateSignupMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    title: t('signup'),
    alternates: languageAlternates('/signup', locale as AppLocale),
    robots: { index: false },
  };
}

export async function SignupPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Auth');
  const { next } = await searchParams;
  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-4 py-12">
      <h1 className="text-carved text-center text-3xl">{t('signupTitle')}</h1>
      <p className="text-center text-ink-muted">{t('signupIntro')}</p>
      <SignupForm next={safeNextPath(firstParam(next))} />
    </div>
  );
}
