import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { SEED_SWORDS } from '@snb/mocks';

import { productJsonLd, swordOgImage } from './product-json-ld';

describe('productJsonLd', () => {
  const sword = SEED_SWORDS[0]!;

  it('이름과 언어별 주소를 담고, 가격·재고는 넣지 않는다', () => {
    const data = JSON.parse(productJsonLd(sword, 'en')) as {
      name: string;
      url: string;
      offers: Record<string, unknown>;
    };
    expect(data.name).toBe(sword.name);
    expect(data.url).toMatch(/\/en\/swords\/ssangsudo$/);
    expect(productJsonLd(sword, 'en')).not.toContain('offers');
  });

  it('글 속의 < 를 그대로 내보내지 않는다', () => {
    const output = productJsonLd({ ...sword, name: '</script><b>' }, 'ko');
    expect(output).not.toContain('<');
    expect((JSON.parse(output) as { name: string }).name).toBe('</script><b>');
  });

  it('모든 시드 도검에 공유 이미지 파일이 있다', () => {
    const missing = SEED_SWORDS.filter((item) => !existsSync(resolve(`public${swordOgImage(item.slug)}`)));
    expect(missing.map((item) => item.slug)).toEqual([]);
  });
});
