'use client';

import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';

import { useWishlistHydrated, useWishlistStore } from '@/entities/wishlist';
import { cn } from '@/shared/lib';

/** 찜하기 켜고 끄기. 글자는 그대로 두고 aria-pressed와 하트 채움으로 상태를 알립니다(색만으로 구분하지 않음). */
export function WishlistButton({ swordId, className }: { swordId: string; className?: string }) {
  const t = useTranslations('Wishlist');
  const hydrated = useWishlistHydrated();
  const pressed = useWishlistStore((state) => state.ids.includes(swordId));
  const toggle = useWishlistStore((state) => state.toggle);
  const on = hydrated && pressed;
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => toggle(swordId)}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-sm border border-line px-4 text-sm hover:bg-wall-raised',
        className,
      )}
    >
      <Heart aria-hidden="true" className="size-4" strokeWidth={1.5} fill={on ? 'currentColor' : 'none'} />
      {t('button')}
    </button>
  );
}
