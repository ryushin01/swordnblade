'use client';

import { useLocale, useTranslations } from 'next-intl';

import {
  categoryLabel,
  countryName,
  estimateCustoms,
  formatKRW,
  formatLength,
  formatWeight,
  type Locale,
  requiresPossessionPermit,
  type Sword,
} from '@snb/domain';

import { useCartStore } from '@/entities/cart';
import { localizeForLocale, useSword } from '@/entities/sword';
import { CustomsBreakdown, useCustomsConfig } from '@/entities/tariff';
import { DestinationSelect } from '@/features/choose-destination';
import { ApiRequestError } from '@/shared/api';
import { Link } from '@/shared/i18n';
import { LiveTotal, OrnamentHeading } from '@/shared/ui';

import { AddToCart } from './add-to-cart';
import { RecentSwords } from './recent-swords';
import { RelatedSwords } from './related-swords';
import { Reviews } from './reviews';
import { SwordGallery } from './sword-gallery';
import { WishlistButton } from './wishlist-button';

export function SwordDetail({ slug, initialSword }: { slug: string; initialSword?: Sword }) {
  const t = useTranslations('Sword');
  const common = useTranslations('Common');
  const { data: sword, isPending, error } = useSword(slug, initialSword);

  if (error) {
    const notFound = error instanceof ApiRequestError && error.status === 404;
    return (
      <div className="grid justify-items-center gap-4 px-4 py-32 text-center">
        <h1 className="text-2xl text-carved">{notFound ? t('notFound') : t('loadError')}</h1>
        <Link href="/" className="underline underline-offset-4">
          {common('backToWall')}
        </Link>
      </div>
    );
  }

  if (isPending) {
    return (
      <div aria-busy="true" className="grid min-h-[70vh] place-items-center">
        <p>{t('loading')}</p>
      </div>
    );
  }

  return <SwordDetailView sword={sword} />;
}

function SwordDetailView({ sword: source }: { sword: Sword }) {
  const t = useTranslations('Sword');
  const locale = useLocale() as Locale;
  // 이름·설명·이야기를 화면 언어로 바꿉니다. 한국어 이름은 영어 화면의 부제로 씁니다.
  const compare = useTranslations('Compare');
  const sword = localizeForLocale(source, locale);
  const permit = requiresPossessionPermit(sword.specs);

  return (
    <>
      <article className="relief-scroll mx-auto grid max-w-[90rem] lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-8">
        <div className="relative py-4 lg:sticky lg:top-0 lg:h-[calc(100dvh-4.5rem)]">
          <SwordGallery sword={sword} reliefLabel={t('reliefLabel', { name: sword.name, summary: sword.summary })} />
        </div>

        <div className="grid content-start gap-8 px-4 pb-16 pt-6 sm:px-8 lg:px-0 lg:pr-8 lg:pt-12">
          <header className="grid justify-items-center gap-2 text-center">
            <OrnamentHeading as="p" className="w-full">
              {categoryLabel(sword.category, locale)}
            </OrnamentHeading>
            <h1 className="font-sword text-4xl text-carved">{sword.name}</h1>
            <p className="small-caps text-ink-muted">
              {locale === 'ko' ? <span lang="en">{sword.nameEn}</span> : <span lang="ko">{source.name}</span>} ·{' '}
              <span>{sword.nameOriginal}</span>
            </p>
            <p className="text-sm small-caps text-ink-muted">
              {t('origin', { era: sword.era, country: countryName(sword.origin, locale) })}
            </p>
          </header>

          <div className="grid gap-4 text-lg leading-relaxed">
            <p>{sword.summary}</p>
            <p className="text-base text-ink-muted">{sword.description}</p>
          </div>

          <section aria-labelledby="specs-title" className="grid gap-4">
            <OrnamentHeading id="specs-title">{t('specsTitle')}</OrnamentHeading>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              <dt className="text-ink-muted">{t('bladeLength')}</dt>
              <dd>{formatLength(sword.specs.bladeLength, locale)}</dd>
              <dt className="text-ink-muted">{t('totalLength')}</dt>
              <dd>{formatLength(sword.specs.totalLength, locale)}</dd>
              <dt className="text-ink-muted">{t('weight')}</dt>
              <dd>{formatWeight(sword.specs.weight, locale)}</dd>
              <dt className="text-ink-muted">{t('material')}</dt>
              <dd>{sword.specs.material}</dd>
              <dt className="text-ink-muted">{t('edge')}</dt>
              <dd>{sword.specs.edge === 'sharp' ? t('edgeSharp') : t('edgeBlunt')}</dd>
            </dl>
            <p className="rounded-sm border border-line bg-wall-raised/60 p-3 text-sm">
              {permit ? (
                <>
                  <strong className="font-semibold text-accent">{t('permitTitle')}</strong> · {t('permitBody')}
                </>
              ) : (
                <>
                  <strong className="font-semibold text-accent">{t('bluntTitle')}</strong> · {t('bluntBody')}
                </>
              )}
            </p>
          </section>

          <section aria-labelledby="buy-title" className="grid gap-4">
            <OrnamentHeading id="buy-title">{t('buyTitle')}</OrnamentHeading>
            <p className="flex items-baseline justify-between">
              <span className="text-3xl tabular-nums">{formatKRW(sword.price, locale)}</span>
              <span className="text-sm text-ink-muted">
                {sword.stock > 0 ? t('stockLeft', { count: sword.stock }) : t('soldOut')}
              </span>
            </p>
            <AddToCart sword={sword} />
            <p className="flex flex-wrap items-center gap-3">
              <WishlistButton swordId={sword.id} />
              <Link
                href={{ pathname: '/compare', query: { a: sword.slug } }}
                className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
              >
                {compare('link')}
              </Link>
            </p>
          </section>

          <ItemCustoms sword={sword} />

          {sword.stories.length > 0 ? (
            <section aria-labelledby="story-title" className="grid gap-4">
              <OrnamentHeading id="story-title">{t('storiesTitle')}</OrnamentHeading>
              <ol className="grid gap-5 border-l border-line pl-5">
                {sword.stories.map((story) => (
                  <li key={story.when + story.text} className="relative grid gap-1">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[1.6rem] top-2 size-2 rounded-full bg-line ring-4 ring-wall"
                    />
                    <span className="text-sm small-caps text-accent">{story.when}</span>
                    <p className="leading-relaxed">{story.text}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      </article>
      <Reviews slug={source.slug} swordId={source.id} />
      <RelatedSwords sword={sword} />
      <RecentSwords swordId={source.id} />
    </>
  );
}

/** 이 상품 1점을 고른 국가로 보낼 때의 관세 예상 */
function ItemCustoms({ sword }: { sword: Sword }) {
  const t = useTranslations('Sword');
  const customs = useTranslations('Customs');
  const { data: config } = useCustomsConfig();
  const destination = useCartStore((state) => state.destination);

  return (
    <section aria-labelledby="customs-title" className="grid gap-4">
      <OrnamentHeading id="customs-title">{t('customsTitle')}</OrnamentHeading>
      {config ? (
        <>
          <DestinationSelect config={config} />
          <LiveTotal
            label={customs('total')}
            total={
              estimateCustoms([{ origin: sword.origin, unitPrice: sword.price, quantity: 1 }], destination, config)
                .totals.total
            }
          />
          <CustomsBreakdown
            estimate={estimateCustoms(
              [{ origin: sword.origin, unitPrice: sword.price, quantity: 1 }],
              destination,
              config,
            )}
            config={config}
          />
        </>
      ) : (
        <p className="text-ink-muted">{t('customsLoading')}</p>
      )}
    </section>
  );
}
