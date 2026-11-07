export const SITE = {
  name: 'Sword & Blade 어드민',
  /** 쇼핑몰과 같은 출처(/admin)에서 열리므로 같은 키로 Mock 데이터를 함께 씁니다. */
  mockStorageKey: 'snb-db-v1',
  /** next.config.ts의 basePath. Link·router 밖의 일반 링크에 붙입니다. */
  basePath: '/admin',
  /** 쇼핑몰은 같은 출처의 루트에 있습니다. */
  shopUrl: '/',
} as const;
