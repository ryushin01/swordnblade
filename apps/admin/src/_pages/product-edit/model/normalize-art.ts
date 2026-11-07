import type { SwordArt, SwordStory } from '@snb/domain';

/**
 * 폼에서 비운 선택 값을 그림 데이터에 맞게 정리합니다.
 * - 칼날 고리·술·상감·코등이 장식 색·보석 색을 비우면 그 속성을 없앱니다(빈 값이면 그림에 그려지지 않음).
 * - 칼날 길이는 제원의 칼날 길이와 맞춥니다.
 */
export function normalizeArt(art: SwordArt, bladeLength?: number): SwordArt {
  const { collar, tassel, guard: rawGuard, ...rest } = art;
  const { accent, ...guardRest } = rawGuard;
  const guard = accent ? { ...guardRest, accent } : guardRest;
  const blade = { ...art.blade, length: bladeLength || art.blade.length };
  if (!blade.inscription) delete blade.inscription;
  const pommel = { ...art.pommel };
  if (pommel.type !== 'gem' || !pommel.gem) delete pommel.gem;
  return {
    ...rest,
    guard,
    blade,
    pommel,
    ...(collar?.color ? { collar: { color: collar.color } } : {}),
    ...(tassel ? { tassel } : {}),
  };
}

/** 내용이 빈 이야기 줄은 버리고(쇼핑몰에 빈 항목이 보이지 않게) 앞뒤 공백을 지웁니다. */
export function normalizeStories(stories: Array<Partial<SwordStory>> | undefined): SwordStory[] {
  return (stories ?? [])
    .map((story) => ({ when: (story.when ?? '').trim(), text: (story.text ?? '').trim() }))
    .filter((story) => story.text);
}
