import { useLocale, useTranslations } from 'next-intl';

import { formatKRW, type Locale, type Sword } from '@snb/domain';
import { SwordRelief } from '@snb/sword-art';

import { Link } from '@/shared/i18n';
import { cn } from '@/shared/lib';

/**
 * 석고 벽의 한 칸. 부조는 장식이고, 이름과 가격 글자가 링크 이름이 됩니다.
 * 마우스를 올리거나 초점을 받으면 따뜻한 빛이 번집니다. sword는 화면 언어로 바꾼 값을 받습니다.
 */
export function SwordTile({ sword, className }: { sword: Sword; className?: string }) {
  const t = useTranslations('Tile');
  const locale = useLocale() as Locale;
  const soldOut = sword.stock <= 0;
  return (
    <Link
      href={`/swords/${sword.slug}`}
      className={cn(
        'group relative flex aspect-square flex-col items-center overflow-hidden px-3 pb-3 pt-2 outline-offset-[-6px] sm:px-4 sm:pb-5',
        'before:pointer-events-none before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500',
        'before:bg-[radial-gradient(closest-side,var(--glow)_0%,transparent_100%)]',
        'hover:before:opacity-100 focus-visible:before:opacity-100',
        className,
      )}
    >
      <SwordRelief
        art={sword.art}
        frame="catalog"
        pigment={0.72}
        className="relative min-h-0 w-full flex-1 transition-transform duration-700 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
      />
      <span className="relative grid justify-items-center gap-0.5 text-center">
        <span className="text-carved text-sm sm:text-base">{sword.name}</span>
        {locale === 'ko' ? (
          <span lang="en" className="small-caps hidden text-xs text-ink-muted sm:block">
            {sword.nameEn}
          </span>
        ) : (
          <span className="small-caps hidden text-xs text-ink-muted sm:block">{sword.nameOriginal}</span>
        )}
        <span className="text-sm tabular-nums text-ink">{soldOut ? t('soldOut') : formatKRW(sword.price, locale)}</span>
      </span>
    </Link>
  );
}
