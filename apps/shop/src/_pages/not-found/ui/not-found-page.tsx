import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n';

export function NotFoundPage() {
  const t = useTranslations('NotFound');
  const common = useTranslations('Common');
  return (
    <div className="grid justify-items-center gap-4 px-4 py-32 text-center">
      <p className="small-caps text-sm text-accent">404</p>
      <h1 className="text-carved text-3xl">{t('title')}</h1>
      <Link href="/" className="underline underline-offset-4">
        {common('backToWall')}
      </Link>
    </div>
  );
}

/** 없는 주소도 언어별 레이아웃 안의 404 화면을 보여 주도록 넘깁니다. */
export function CatchAllPage(): never {
  notFound();
}
