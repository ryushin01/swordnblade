'use client';

import Link from 'next/link';

import {
  CATEGORY_LABEL,
  COUNTRY_NAME,
  estimateCustoms,
  formatKRW,
  formatLength,
  formatWeight,
  requiresPossessionPermit,
  type Sword,
} from '@snb/domain';
import { SwordRelief } from '@snb/sword-art';

import { useCartStore } from '@/entities/cart';
import { useSword } from '@/entities/sword';
import { CustomsBreakdown, useCustomsConfig } from '@/entities/tariff';
import { DestinationSelect } from '@/features/choose-destination';
import { ApiRequestError } from '@/shared/api';
import { LiveTotal, OrnamentHeading } from '@/shared/ui';

import { AddToCart } from './add-to-cart';

export function SwordDetail({ slug }: { slug: string }) {
  const { data: sword, isPending, error } = useSword(slug);

  if (error) {
    const notFound = error instanceof ApiRequestError && error.status === 404;
    return (
      <div className="grid justify-items-center gap-4 px-4 py-32 text-center">
        <h1 className="text-2xl text-carved">
          {notFound ? '찾는 도검이 벽에 없습니다' : '도검 정보를 불러오지 못했습니다'}
        </h1>
        <Link href="/" className="underline underline-offset-4">
          도검 벽으로 돌아가기
        </Link>
      </div>
    );
  }

  if (isPending) {
    return (
      <div aria-busy="true" className="grid min-h-[70vh] place-items-center">
        <p>도검 정보를 불러오는 중입니다.</p>
      </div>
    );
  }

  return <SwordDetailView sword={sword} />;
}

function SwordDetailView({ sword }: { sword: Sword }) {
  const permit = requiresPossessionPermit(sword.specs);

  return (
    <article className="mx-auto grid max-w-[90rem] lg:grid-cols-[minmax(0,1fr)_28rem] lg:gap-8">
      <div className="relative lg:sticky lg:top-0 lg:h-[calc(100dvh-4.5rem)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,var(--glow)_0%,transparent_75%)]"
        />
        <SwordRelief
          art={sword.art}
          pigment={0.86}
          depth={1.1}
          label={`${sword.name} 부조 일러스트: ${sword.summary}`}
          className="relative mx-auto aspect-square w-full max-w-[min(100%,calc(100dvh-6rem))] lg:h-full"
        />
      </div>

      <div className="grid content-start gap-8 px-4 pb-16 pt-6 sm:px-8 lg:px-0 lg:pr-8 lg:pt-12">
        <header className="grid justify-items-center gap-2 text-center">
          <OrnamentHeading as="p" className="w-full">
            {CATEGORY_LABEL[sword.category]}
          </OrnamentHeading>
          <h1 className="text-4xl text-carved">{sword.name}</h1>
          <p className="small-caps text-ink-muted">
            <span lang="en">{sword.nameEn}</span> · <span>{sword.nameOriginal}</span>
          </p>
          <p className="text-sm small-caps text-ink-muted">
            {sword.era} · {COUNTRY_NAME[sword.origin]} 출고
          </p>
        </header>

        <div className="grid gap-4 text-lg leading-relaxed">
          <p>{sword.summary}</p>
          <p className="text-base text-ink-muted">{sword.description}</p>
        </div>

        <section aria-labelledby="specs-title" className="grid gap-4">
          <OrnamentHeading id="specs-title">제원</OrnamentHeading>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            <dt className="text-ink-muted">칼날 길이</dt>
            <dd>{formatLength(sword.specs.bladeLength)}</dd>
            <dt className="text-ink-muted">전체 길이</dt>
            <dd>{formatLength(sword.specs.totalLength)}</dd>
            <dt className="text-ink-muted">무게</dt>
            <dd>{formatWeight(sword.specs.weight)}</dd>
            <dt className="text-ink-muted">소재</dt>
            <dd>{sword.specs.material}</dd>
            <dt className="text-ink-muted">날</dt>
            <dd>{sword.specs.edge === 'sharp' ? '진검 (날 있음)' : '장식용 (날 없음)'}</dd>
          </dl>
          <p className="rounded-sm border border-line bg-wall-raised/60 p-3 text-sm">
            {permit ? (
              <>
                <strong className="font-semibold text-accent">소지허가 대상</strong> · 칼날 15cm 이상 진검입니다.
                국내에서 가지려면 관할 경찰서의 소지허가가 필요합니다.
              </>
            ) : (
              <>
                <strong className="font-semibold text-accent">장식용 재현품</strong> · 날을 세우지 않았습니다. 배송
                국가의 규정은 결제 전에 한 번 더 안내합니다.
              </>
            )}
          </p>
        </section>

        <section aria-labelledby="buy-title" className="grid gap-4">
          <OrnamentHeading id="buy-title">구매</OrnamentHeading>
          <p className="flex items-baseline justify-between">
            <span className="text-3xl tabular-nums">{formatKRW(sword.price)}</span>
            <span className="text-sm text-ink-muted">{sword.stock > 0 ? `남은 수량 ${sword.stock}점` : '품절'}</span>
          </p>
          <AddToCart sword={sword} />
        </section>

        <ItemCustoms sword={sword} />

        {sword.stories.length > 0 ? (
          <section aria-labelledby="story-title" className="grid gap-4">
            <OrnamentHeading id="story-title">전해지는 이야기</OrnamentHeading>
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
  );
}

/** 이 상품 1점을 고른 국가로 보낼 때의 관세 예상 */
function ItemCustoms({ sword }: { sword: Sword }) {
  const { data: config } = useCustomsConfig();
  const destination = useCartStore((state) => state.destination);

  return (
    <section aria-labelledby="customs-title" className="grid gap-4">
      <OrnamentHeading id="customs-title">관세 예상 (1점 기준)</OrnamentHeading>
      {config ? (
        <>
          <DestinationSelect config={config} />
          <LiveTotal
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
        <p className="text-ink-muted">관세 기준을 불러오는 중입니다.</p>
      )}
    </section>
  );
}
