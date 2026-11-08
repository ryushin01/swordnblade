'use client';

import { useTranslations } from 'next-intl';
import { UserRound } from 'lucide-react';

import { useMe } from '@/entities/session';
import { Link } from '@/shared/i18n';

/** 로그인했으면 내 계정, 아니면 로그인. 좁은 화면에서는 아이콘만 보이고 이름은 화면낭독기에 읽힙니다. */
export function AccountLink() {
  const t = useTranslations('Header');
  const me = useMe();
  const signedIn = Boolean(me.data);
  return (
    <Link
      href={signedIn ? '/account' : '/login'}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-1 text-sm small-caps text-ink hover:text-accent sm:gap-2 sm:px-2"
    >
      <UserRound aria-hidden="true" className="size-4" strokeWidth={1.4} />
      <span className="sr-only sm:not-sr-only">{signedIn ? t('account') : t('login')}</span>
    </Link>
  );
}
