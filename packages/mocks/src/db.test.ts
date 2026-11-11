// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { createDb } from './db';
import { SEED_SWORDS } from './seed';

describe('createDb (localStorage 공유)', () => {
  beforeEach(() => localStorage.clear());

  it('같은 키를 쓰는 다른 앱(DB 인스턴스)이 바꾼 내용을 다음 읽기에서 본다', () => {
    const shop = createDb({ storageKey: 'test-db' });
    const admin = createDb({ storageKey: 'test-db' });
    expect(shop.read().swords[0]?.price).toBe(6_800_000);

    admin.write((state) => ({
      ...state,
      swords: state.swords.map((sword, index) => (index === 0 ? { ...sword, price: 7_000_000 } : sword)),
    }));

    expect(shop.read().swords[0]?.price).toBe(7_000_000);
  });

  it.each([
    ['모양이 다른 JSON', '{}'],
    ['깨진 JSON', '{"swords":'],
  ])('저장된 값이 %s이면 무시하고 메모리 상태를 쓴다', (_, raw) => {
    const db = createDb({ storageKey: 'test-db' });
    localStorage.setItem('test-db', raw);
    expect(db.read().swords).toHaveLength(SEED_SWORDS.length);
    expect(createDb({ storageKey: 'test-db' }).read().swords).toHaveLength(SEED_SWORDS.length);
  });

  it('저장된 값이 없으면 지금 메모리 상태를 유지한다(시드로 되돌리지 않음)', () => {
    const db = createDb({ storageKey: 'test-db' });
    db.write((state) => ({ ...state, orders: [] }));
    localStorage.clear();
    expect(db.read().orders).toEqual([]);
  });
});

describe('migrateSeed (시드 버전)', () => {
  beforeEach(() => localStorage.clear());

  it('예전 시드 데이터는 그림·설명을 새 시드로 바꾸고 가격·재고는 둔다', () => {
    const fresh = createDb({ storageKey: 'test-db' }).read();
    const legacy = {
      ...fresh,
      seedVersion: undefined,
      swords: fresh.swords.map((sword, index) =>
        index === 0 ? { ...sword, price: 7_777_000, stock: 9, art: { ...sword.art, tassel: '#000000' } } : sword,
      ),
    };
    localStorage.setItem('test-db', JSON.stringify(legacy));

    const migrated = createDb({ storageKey: 'test-db' }).read();
    const first = migrated.swords[0]!;
    expect(first.price).toBe(7_777_000);
    expect(first.stock).toBe(9);
    expect(first.art.tassel).toBeUndefined();
    expect(first.art.blade.sleeve).toBeDefined();
    expect(JSON.parse(localStorage.getItem('test-db')!).seedVersion).toBe(migrated.seedVersion);
  });

  it('새 시드에만 있는 도검은 더하고, 어드민에서 만든 도검은 남긴다', () => {
    const fresh = createDb({ storageKey: 'test-db' }).read();
    const custom = { ...fresh.swords[1]!, id: 'custom-1', slug: 'custom' };
    // 버전 1 데이터에는 처음 16점이 있었습니다. 그 뒤 시드에 들어온 도검은 모두 더해져야 합니다.
    const legacy = { ...fresh, seedVersion: 1, swords: [...fresh.swords.slice(0, 16), custom] };
    localStorage.setItem('test-db', JSON.stringify(legacy));

    const ids = createDb({ storageKey: 'test-db' })
      .read()
      .swords.map((sword) => sword.id);
    expect(ids).toContain('custom-1');
    expect(ids.length).toBe(fresh.swords.length + 1);
  });

  it('출처를 바로잡은 도검은 예전 데이터의 원어·영어 이름과 출고국도 바꾸고, 뺀 도검은 지운다', () => {
    const fresh = createDb({ storageKey: 'test-db' }).read();
    const legacy = {
      ...fresh,
      seedVersion: 5,
      swords: [
        ...fresh.swords.map((sword) =>
          sword.id === 'sw-kuruchi' ? { ...sword, origin: 'IQ' as const, nameEn: 'Kuruchi', price: 1 } : sword,
        ),
        { ...fresh.swords[0]!, id: 'sw-hwer', slug: 'hwer' },
      ],
    };
    localStorage.setItem('test-db', JSON.stringify(legacy));
    const swords = createDb({ storageKey: 'test-db' }).read().swords;
    const kuruchi = swords.find((sword) => sword.id === 'sw-kuruchi')!;
    expect(kuruchi.origin).toBe('TR');
    expect(kuruchi.nameEn).toBe('Copper Cutter of Heaven and Earth');
    expect(kuruchi.price).toBe(1);
    expect(swords.some((sword) => sword.id === 'sw-hwer')).toBe(false);
  });

  it('어드민에서 지운 시드 도검은 되살리지 않고, 그 뒤 시드 버전에 들어온 도검만 더한다', () => {
    const fresh = createDb({ storageKey: 'test-db' }).read();
    const legacy = {
      ...fresh,
      seedVersion: 5,
      swords: fresh.swords.filter((sword) => !['sw-002', 'sw-tachi', 'sw-dojigiri'].includes(sword.id)),
    };
    localStorage.setItem('test-db', JSON.stringify(legacy));
    const ids = createDb({ storageKey: 'test-db' })
      .read()
      .swords.map((sword) => sword.id);
    expect(ids).not.toContain('sw-002');
    expect(ids).not.toContain('sw-tachi');
    expect(ids).toContain('sw-dojigiri');
  });

  it('삼인검이 남은 예전 데이터는 삼인검을 지우고 본국검을 채운다', () => {
    const fresh = createDb({ storageKey: 'test-db' }).read();
    const legacy = {
      ...fresh,
      seedVersion: 4,
      swords: [
        ...fresh.swords.filter((sword) => sword.id !== 'sw-bongukgeom'),
        { ...fresh.swords[0]!, id: 'sw-samingeom', slug: 'samingeom' },
      ],
    };
    localStorage.setItem('test-db', JSON.stringify(legacy));
    const ids = createDb({ storageKey: 'test-db' })
      .read()
      .swords.map((sword) => sword.id);
    expect(ids).toContain('sw-bongukgeom');
    expect(ids).not.toContain('sw-samingeom');
  });
});
