// @vitest-environment node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { SEED_SWORDS } from '@snb/mocks';

/**
 * 칼 이름에만 쓰는 붓글씨 글꼴(sword-brush.woff2)은 이름에 쓰인 한글만 담습니다.
 * 이름이 바뀌어 새 글자가 생기면 이 테스트가 실패합니다. 다시 만드는 방법:
 *   UPDATE_SWORD_BRUSH=1 pnpm --filter @snb/shop exec vitest run --project unit sword-brush
 *   pnpm --filter @snb/shop subset:sword-brush
 */
const CHARS_FILE = join(process.cwd(), 'src/_app/fonts/sword-brush.chars.txt');

function hangulOf(names: readonly string[]): string {
  const chars = new Set<string>();
  for (const name of names) for (const ch of name) if (/[가-힣]/.test(ch)) chars.add(ch);
  return [...chars].sort().join('');
}

test('붓글씨 글꼴에 모든 칼 이름의 한글이 들어 있습니다', () => {
  const expected = hangulOf(SEED_SWORDS.map((sword) => sword.name));
  if (process.env.UPDATE_SWORD_BRUSH) writeFileSync(CHARS_FILE, `${expected}\n`);
  const covered = new Set(readFileSync(CHARS_FILE, 'utf8').trim());
  const missing = [...expected].filter((ch) => !covered.has(ch));
  expect(missing.join('')).toBe('');
});
