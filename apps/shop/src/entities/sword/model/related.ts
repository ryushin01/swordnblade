import type { Sword } from '@snb/domain';

/** 같은 지역·같은 형태를 먼저, 그다음 같은 지역의 다른 형태를 고릅니다. 자기 자신은 뺍니다. */
export function relatedSwords<T extends Pick<Sword, 'id' | 'category' | 'kind'>>(sword: T, all: T[], limit = 4): T[] {
  const others = all.filter((item) => item.id !== sword.id && item.category === sword.category);
  return [
    ...others.filter((item) => item.kind === sword.kind),
    ...others.filter((item) => item.kind !== sword.kind),
  ].slice(0, limit);
}
