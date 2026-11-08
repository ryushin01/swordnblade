'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { SwordRelief } from '@snb/sword-art';

import { cn } from '@/shared/lib';

import type { Locale, Sword } from '@snb/domain';

type GalleryItem =
  | { kind: 'relief'; focus: 'full' | 'hilt' | 'tip'; label: string }
  | { kind: 'photo'; url: string; alt: string; label: string };

/**
 * 상품 이미지 갤러리: 부조 그림(전체·손잡이·칼끝 확대) 뒤에 어드민에서 올린 사진을 이어 붙입니다.
 * 이전·다음 버튼과 썸네일 버튼으로 넘기고, 위치를 화면낭독기에 알립니다. 자동으로 넘기지 않습니다.
 */
export function SwordGallery({ sword, reliefLabel }: { sword: Sword; reliefLabel: string }) {
  const t = useTranslations('Gallery');
  const locale = useLocale() as Locale;
  const [index, setIndex] = useState(0);

  const items: GalleryItem[] = [
    { kind: 'relief', focus: 'full', label: t('full') },
    { kind: 'relief', focus: 'hilt', label: t('hilt') },
    { kind: 'relief', focus: 'tip', label: t('tip') },
    ...(sword.images ?? []).map((image, n) => ({
      kind: 'photo' as const,
      url: image.url,
      alt: (locale === 'en' && image.altEn) || image.alt,
      label: t('photo', { n: n + 1 }),
    })),
  ];
  const current = items[Math.min(index, items.length - 1)]!;
  const go = (next: number) => setIndex((next + items.length) % items.length);

  return (
    <section
      aria-labelledby="gallery-title"
      className="relative grid gap-3 lg:h-full lg:grid-rows-[minmax(0,1fr)_auto]"
    >
      <h2 id="gallery-title" className="sr-only">
        {t('title')}
      </h2>
      <div className="relative min-h-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,var(--glow)_0%,transparent_75%)]"
        />
        {current.kind === 'relief' ? (
          <SwordRelief
            art={sword.art}
            focus={current.focus}
            pigment={0.86}
            depth={1.1}
            label={`${reliefLabel} (${current.label})`}
            className="relative mx-auto aspect-square h-full max-h-[calc(100dvh-12rem)] w-full max-w-full object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- Mock API가 브라우저에서 돌려주는 사진이라 next/image 최적화를 쓸 수 없습니다.
          <img
            src={current.url}
            alt={current.alt}
            className="relative mx-auto aspect-square h-full max-h-[calc(100dvh-12rem)] w-full max-w-full object-contain"
          />
        )}
      </div>

      <div className="flex items-center justify-center gap-3 px-4">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label={t('prev')}
          className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink hover:bg-wall-raised"
        >
          <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.5} />
        </button>
        <ul className="flex flex-wrap justify-center gap-2">
          {items.map((item, n) => (
            <li key={item.kind === 'photo' ? item.url : item.focus}>
              <button
                type="button"
                onClick={() => setIndex(n)}
                aria-label={t('thumb', { n: n + 1, label: item.label })}
                aria-current={n === index ? 'true' : undefined}
                className={cn(
                  'block size-14 overflow-hidden rounded-sm border bg-wall-raised/60',
                  n === index ? 'border-2 border-ink' : 'border-line hover:border-ink-muted',
                )}
              >
                {item.kind === 'relief' ? (
                  <SwordRelief art={sword.art} focus={item.focus} pigment={0.8} className="size-full" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- 위와 같은 이유
                  <img src={item.url} alt="" className="size-full object-cover" />
                )}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label={t('next')}
          className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink hover:bg-wall-raised"
        >
          <ChevronRight aria-hidden="true" className="size-5" strokeWidth={1.5} />
        </button>
      </div>
      <p aria-live="polite" className="text-center text-sm text-ink-muted tabular-nums">
        {t('position', { current: index + 1, total: items.length, label: current.label })}
      </p>
    </section>
  );
}
