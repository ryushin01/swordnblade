// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { createDb } from './db';

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

  it('저장된 값이 없으면 지금 메모리 상태를 유지한다(시드로 되돌리지 않음)', () => {
    const db = createDb({ storageKey: 'test-db' });
    db.write((state) => ({ ...state, orders: [] }));
    localStorage.clear();
    expect(db.read().orders).toEqual([]);
  });
});
