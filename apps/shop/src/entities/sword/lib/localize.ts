import { type Locale, localizeSword, type Sword } from '@snb/domain';
import { SEED_SWORDS, SEED_TRANSLATIONS_EN } from '@snb/mocks';

/**
 * 도검을 화면 언어로 바꿉니다. 예전에 저장된 Mock 데이터에는 번역이 없을 수 있어,
 * 같은 id의 시드 번역을 대신 씁니다. 어드민에서 새로 만든 도검은 한국어 원문을 보여 줍니다.
 */
export const localizeForLocale = (sword: Sword, locale: Locale): Sword =>
  localizeSword(sword, locale, SEED_TRANSLATIONS_EN[sword.id]);

/** 주문 내역처럼 이름만 남은 곳에서 화면 언어의 이름을 고릅니다. 모르는 도검은 저장된 이름을 씁니다. */
export function swordNameFor(swordId: string, savedName: string, locale: Locale): string {
  if (locale === 'ko') return savedName;
  return SEED_SWORDS.find((sword) => sword.id === swordId)?.nameEn ?? savedName;
}
