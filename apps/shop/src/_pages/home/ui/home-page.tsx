import { CATEGORY_LABEL, CATEGORY_LABEL_EN, type SwordCategory } from '@snb/domain';

import { SwordWall } from './sword-wall';

const CATEGORIES: SwordCategory[] = ['east', 'west', 'legend'];

export async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: raw } = await searchParams;
  const category = CATEGORIES.includes(raw as SwordCategory) ? (raw as SwordCategory) : undefined;

  return (
    <>
      <div className="mx-auto grid max-w-[90rem] justify-items-center gap-3 px-4 pb-10 pt-12 text-center sm:px-8 sm:pt-16">
        <p className="small-caps text-sm text-accent">
          {category ? CATEGORY_LABEL_EN[category] : 'Carved in plaster, forged in steel'}
        </p>
        <h1 id="wall-title" className="text-carved text-3xl sm:text-4xl">
          {category ? CATEGORY_LABEL[category] : '도검의 벽'}
        </h1>
        <p className="max-w-xl text-ink-muted">
          조선의 쌍수도부터 호수의 여인이 건넨 검까지. 벽에 새긴 도검을 골라 이야기를 읽고, 배송 국가의 관세까지 미리
          계산해 보세요.
        </p>
      </div>
      <SwordWall category={category} labelledBy="wall-title" />
    </>
  );
}
