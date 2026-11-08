import { SEED_SWORDS } from '@snb/mocks';

import { productJsonLd } from './product-json-ld';

describe('productJsonLd', () => {
  const sword = SEED_SWORDS[0]!;

  it('이름, 가격, 재고, 언어별 주소를 담는다', () => {
    const data = JSON.parse(productJsonLd(sword, 'en')) as {
      name: string;
      url: string;
      offers: Record<string, unknown>;
    };
    expect(data.name).toBe(sword.name);
    expect(data.url).toMatch(/\/en\/swords\/ssangsudo$/);
    expect(data.offers).toMatchObject({ price: sword.price, priceCurrency: 'KRW' });
  });

  it('글 속의 < 를 그대로 내보내지 않는다', () => {
    const output = productJsonLd({ ...sword, name: '</script><b>' }, 'ko');
    expect(output).not.toContain('<');
    expect((JSON.parse(output) as { name: string }).name).toBe('</script><b>');
  });
});
