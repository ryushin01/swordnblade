import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const tiles = (page: Page) =>
  page.getByRole('list', { name: /도검의 벽|신화·전설|동양 도검|서양 도검/ }).getByRole('link');

/** 화면 전환(SSGOI)이 끝날 때까지 기다립니다. 전환 중에는 떠나는 화면과 들어오는 화면이 겹치고 투명도가 바뀝니다. */
async function waitForPageTransition(page: Page) {
  await expect(page.locator('[data-ssgoi-transition]')).toHaveCount(1);
  // SSGOI는 Element.animate로 움직입니다. 스크롤에 묶인 CSS 애니메이션(상세의 부조 연출 등)은 계속 도므로 세지 않습니다.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .filter((a) => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
      .every((a) => a.playState !== 'running'),
  );
}

async function expectNoA11yViolations(page: Page) {
  await waitForPageTransition(page);
  // 화면 전환 직후에는 문서 제목이 잠시 비어 있어 document-title로 잘못 잡히므로 제목이 채워진 뒤에 검사합니다.
  await expect(page).toHaveTitle(/\S/);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.beforeEach(async ({ page }) => {
  // 테스트마다 깨끗한 Mock DB와 장바구니로 시작합니다.
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('__e2e_reset__')) {
      localStorage.clear();
      sessionStorage.setItem('__e2e_reset__', '1');
    }
  });
});

test('도검의 벽: 한 쪽에 24점씩 보이고 분류로 거를 수 있다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: '도검의 벽' })).toBeVisible();
  await expect(tiles(page)).toHaveCount(24);
  await expect(page.getByRole('status').filter({ hasText: '213점 가운데 1–24번째' })).toBeVisible();

  const categories = page.getByRole('navigation', { name: '도검 분류' });
  await expect(categories.getByRole('link')).toHaveCount(6);
  await categories.getByRole('link', { name: '신화·전설' }).click();
  await expect(page).toHaveURL(/category=legend/);
  await expect(page.getByRole('heading', { level: 1, name: '신화·전설' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: '112점 가운데 1–24번째' })).toBeVisible();
  await expect(categories.getByRole('link', { name: '신화·전설' })).toHaveAttribute('aria-current', 'page');

  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);
});

test('쪽 이동과 형태 거르기: 조건이 주소에 남는다', async ({ page }) => {
  await page.goto('/?category=legend');
  const pages = page.getByRole('navigation', { name: '목록 쪽 이동' });
  await expect(pages.getByRole('link', { name: /^1 ?쪽$/ })).toHaveAttribute('aria-current', 'page');
  await pages.getByRole('link', { name: '다음 쪽' }).click();
  await expect(page).toHaveURL(/category=legend.*page=2|page=2.*category=legend/);
  await expect(page.getByRole('status').filter({ hasText: '112점 가운데 25–48번째' })).toBeVisible();
  await expect(pages.getByRole('link', { name: /^2 ?쪽$/ })).toHaveAttribute('aria-current', 'page');
  await pages.getByRole('link', { name: /^5 ?쪽$/ }).click();
  await expect(tiles(page)).toHaveCount(16);
  await expect(pages.getByRole('link', { name: '다음 쪽' })).toHaveCount(0);
  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);

  await page.goto('/');
  const search = page.getByRole('search', { name: '도검 찾기' });
  await search.getByLabel('형태').selectOption('training');
  await search.getByRole('button', { name: '찾기' }).click();
  await expect(page).toHaveURL(/kind=training/);
  await expect(page.getByRole('status').filter({ hasText: '7점' })).toBeVisible();
  await expect(page.getByRole('link', { name: /죽도/ })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '목록 쪽 이동' })).toHaveCount(0);
});

test('본문 바로가기 링크가 첫 초점을 받는다', async ({ page, isMobile }) => {
  test.skip(isMobile, '키보드 검사는 데스크톱에서만');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: '본문 바로가기' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
});

test('상세: 쌍수도의 제원, 허가 안내, 관세 예상을 보여 준다', async ({ page }) => {
  await page.goto('/swords/ssangsudo');
  await expect(page.getByRole('heading', { level: 1, name: '쌍수도' })).toBeVisible();
  await expect(page.getByRole('img', { name: /쌍수도 부조 일러스트/ })).toBeVisible();
  await expect(page.getByText('소지허가 대상')).toBeVisible();

  await page.getByLabel('배송 국가').selectOption('US');
  await expect(page.getByText('대한민국 → 미국')).toBeVisible();

  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);
});

test('구매 흐름: 담기 → 장바구니 관세 계산 → 주문서 오류 안내 → 결제 완료', async ({ page }) => {
  await page.goto('/swords/uchigatana');
  await page.getByRole('button', { name: '장바구니에 담기' }).click();
  await expect(page.getByText('우치가타나 1점을 장바구니에 담았습니다.')).toBeVisible();
  await expect(page.getByRole('link', { name: /장바구니\s*1점/ })).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByRole('table', { name: /장바구니에 담은 도검/ })).toBeVisible();
  await page.getByLabel('배송 국가').selectOption('KR');
  // 일본 출고 4,500,000원 → 한국: 관세 366,800원, 부가세 495,180원
  await expect(page.getByText('일본 → 대한민국')).toBeVisible();
  await expect(page.getByText('5,446,980원').first()).toBeVisible();
  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);

  await page.getByRole('link', { name: '주문서 작성하기' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '주문서' })).toBeVisible();

  await page.getByRole('button', { name: '결제하기' }).click();
  const alert = page.getByRole('alert').filter({ hasText: '입력 내용을 확인해 주세요.' });
  await expect(alert).toBeFocused();
  await expectNoA11yViolations(page);

  await page.getByLabel(/^받는 분/).fill('김가상');
  await page.getByLabel(/^이메일/).fill('buyer@example.com');
  await page.getByLabel(/^연락처/).fill('010-0000-0000');
  await page.getByLabel(/^우편번호/).fill('03000');
  await page.getByLabel(/^주소/).fill('서울특별시 종로구 가상로 1');
  await page.getByRole('radio', { name: /신용카드/ }).check();
  await page.getByRole('checkbox', { name: /허가를 받았거나/ }).check();
  await page.getByRole('button', { name: '결제하기' }).click();

  await expect(page).toHaveURL(/\/orders\/SNB-\d{8}-\d{4}$/);
  await expect(page.getByRole('heading', { level: 1, name: '주문이 벽에 새겨졌습니다' })).toBeVisible();
  await expect(page.getByText('허가 확인 중')).toBeVisible();
  await expect(page.getByRole('link', { name: /장바구니\s*0점/ })).toBeVisible();
  await expectNoA11yViolations(page);
});

test('주문하는 사이 가격이 바뀌면 바뀐 금액을 알리고, 확인한 뒤 다시 결제하면 그 금액으로 주문한다', async ({
  page,
}) => {
  await page.goto('/swords/uchigatana');
  await page.getByRole('button', { name: '장바구니에 담기' }).click();
  await expect(page.getByText('우치가타나 1점을 장바구니에 담았습니다.')).toBeVisible();
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { level: 1, name: '주문서' })).toBeVisible();
  const summary = page.getByRole('complementary', { name: '주문 요약' });
  await expect(summary).toContainText('4,500,000원');

  // 주문서를 보는 사이 어드민이 가격을 바꿉니다(이 화면은 아직 예전 가격을 보여 줌).
  await page.evaluate(async () => {
    const login = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', password: 'demo1234' }),
    });
    const { token } = (await login.json()) as { token: string };
    const sword = (await (await fetch('/api/swords/uchigatana')).json()) as { id: string };
    await fetch(`/api/swords/${sword.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...sword, price: 5_000_000 }),
    });
  });

  await page.getByLabel(/^받는 분/).fill('김가상');
  await page.getByLabel(/^이메일/).fill('buyer@example.com');
  await page.getByLabel(/^연락처/).fill('010-0000-0000');
  await page.getByLabel(/^우편번호/).fill('03000');
  await page.getByLabel(/^주소/).fill('서울특별시 종로구 가상로 1');
  await page.getByRole('radio', { name: /신용카드/ }).check();
  await page.getByRole('checkbox', { name: /허가를 받았거나/ }).check();
  await page.getByRole('button', { name: '결제하기' }).click();

  // 주문하지 않고 바뀐 금액을 알리며, 주문 요약도 새 가격으로 바뀝니다.
  await expect(page.getByRole('alert').filter({ hasText: '결제 금액이' })).toBeFocused();
  await expect(summary).toContainText('5,000,000원');
  await expectNoA11yViolations(page);

  await page.getByRole('button', { name: '결제하기' }).click();
  await expect(page).toHaveURL(/\/orders\/SNB-\d{8}-\d{4}$/);
  await expect(page.getByRole('region', { name: '주문 내역' })).toContainText('5,000,000원');
});

test('없는 도검 주소는 안내를 보여 준다', async ({ page }) => {
  await page.goto('/swords/no-such-sword');
  await expect(page.getByRole('heading', { level: 1, name: '찾는 도검이 벽에 없습니다' })).toBeVisible();
});

test('찾기와 정렬: 주소에 남고 결과 수를 알려 준다', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('search', { name: '도검 찾기' });
  await search.getByLabel('이름으로 찾기').fill('LongSword');
  await search.getByRole('button', { name: '찾기' }).click();
  await expect(page).toHaveURL(/q=LongSword/);
  // 영문 이름(Longsword)으로 찾고, 대소문자는 가리지 않습니다.
  await expect(page.getByRole('status').filter({ hasText: '검색 결과 1점' })).toBeVisible();
  await expect(page.getByRole('link', { name: /롱소드/ })).toBeVisible();

  await page.goto('/?sort=price-desc');
  // 이동 중에 글자를 한 번에 읽으면 실패할 수 있어, 다시 시도하는 단언으로 확인합니다.
  await expect(page.locator('ul a[href^="/swords/"]').first()).toContainText('쌍수도');

  await page.goto('/?q=없는이름');
  await expect(page.getByText('‘없는이름’에 맞는 도검이 없습니다.', { exact: false })).toBeVisible();
  await expectNoA11yViolations(page);
});

test('할인: 할인 중인 도검만 거르고, 상세에 정가·할인가·할인율을 보여 준다', async ({ page }) => {
  await page.goto('/');
  const search = page.getByRole('search', { name: '도검 찾기' });
  await search.getByLabel('할인 중인 도검만').check();
  await search.getByRole('button', { name: '찾기' }).click();
  await expect(page).toHaveURL(/sale=1/);
  // 기한 없는 시드 할인(바이킹 소드 15%)으로 확인합니다. 줄 그은 정가는 화면 낭독기에 '정가'로 읽힙니다.
  const viking = page.getByRole('link', { name: /바이킹 소드.*정가 3,100,000원 할인가 2,635,000원 15% 할인/ });
  await expect(viking).toBeVisible();
  // 시작 전인 할인(오오타치)은 빠지고, 보이는 칸은 모두 할인 중입니다.
  await expect(tiles(page).filter({ hasText: '오오타치' })).toHaveCount(0);
  for (const text of await tiles(page).allTextContents()) expect(text).toMatch(/\d+% 할인/);
  await expectNoA11yViolations(page);

  await viking.click();
  const buy = page.getByRole('region', { name: '구매', exact: true });
  await expect(buy.locator('del')).toContainText('3,100,000원');
  await expect(buy).toContainText('2,635,000원');
  await expect(buy).toContainText('15% 할인');
  await expectNoA11yViolations(page);
});

test('서버가 상품 목록을 HTML로 먼저 그린다(자바스크립트 없이도 보임)', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/swords/ssangsudo');
  await expect(page.getByRole('heading', { level: 1, name: '쌍수도' })).toBeVisible();
  await page.goto('/?q=쌍수');
  await expect(page.getByRole('link', { name: /쌍수도/ })).toBeVisible();
  await context.close();
});

test('어드민에서 아주 긴 이름을 붙여도 상세 화면이 가로로 넘치지 않는다', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByRole('button', { name: '데모 계정으로 로그인' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '대시보드' })).toBeVisible();
  await page.goto('/admin/products/sw-005');
  await page.getByLabel('이름', { exact: true }).fill('아주아주긴이름의와키자시짧은칼특별한정판재현품');
  await page.getByRole('button', { name: '변경 저장' }).click();
  await expect(page.getByText('상품을 저장했습니다.')).toBeVisible();
  await page.goto('/swords/wakizashi');
  await expect(page.getByRole('heading', { level: 1, name: /아주아주긴이름/ })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('상세 갤러리: 이전·다음 버튼과 썸네일로 넘기고 위치를 알린다', async ({ page }) => {
  await page.goto('/swords/ssangsudo');
  const gallery = page.getByRole('region', { name: '이미지' });
  await expect(gallery.getByText('1 / 5: 전체 모습')).toBeVisible();
  await gallery.getByRole('button', { name: '다음 이미지' }).click();
  await expect(gallery.getByText('2 / 5: 손잡이 확대')).toBeVisible();
  await expect(gallery.getByRole('button', { name: '이미지 2: 손잡이 확대' })).toHaveAttribute('aria-current', 'true');
  await gallery.getByRole('button', { name: '이미지 3: 칼끝 확대' }).click();
  await expect(gallery.getByRole('img', { name: /칼끝 확대/ })).toBeVisible();
  await expect(gallery.getByRole('button', { name: /^이미지 \d/ })).toHaveCount(5);
  await gallery.getByRole('button', { name: '다음 이미지' }).click();
  await expect(gallery.getByText('4 / 5: 코등이 확대')).toBeVisible();
  await gallery.getByRole('button', { name: '다음 이미지' }).click();
  await expect(gallery.getByText('5 / 5: 덧쇠 확대')).toBeVisible();
  await gallery.getByRole('button', { name: '다음 이미지' }).click();
  await expect(gallery.getByText('1 / 5: 전체 모습')).toBeVisible();
  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);
});

test('찜하기: 상세에서 찜하고 찜 목록에서 보고 뺀다', async ({ page }) => {
  await page.goto('/swords/ssangsudo');
  const button = page.getByRole('button', { name: '찜하기' });
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');

  await page
    .getByRole('banner')
    .getByRole('link', { name: /찜 목록/ })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: '찜 목록' })).toBeVisible();
  await expect(page.getByRole('link', { name: /쌍수도/ })).toBeVisible();
  await expect(page).toHaveTitle(/찜 목록/);
  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: '쌍수도 찜 해제' }).click();
  await expect(page.getByText('아직 찜한 도검이 없습니다.')).toBeVisible();
});

test('함께 볼 도검: 상세 아래에 같은 지역의 도검을 보여 준다', async ({ page }) => {
  await page.goto('/swords/ssangsudo');
  const related = page.getByRole('list', { name: '함께 볼 도검' });
  await expect(related.getByRole('link')).toHaveCount(4);
  await expect(related.getByRole('link', { name: /쌍수도/ })).toHaveCount(0);
});

test('도검 비교: 상세에서 넘어와 도검을 더 고르면 주소에 남고 제원 표로 본다', async ({ page }) => {
  await page.goto('/swords/ssangsudo');
  await page.getByRole('link', { name: '다른 도검과 비교' }).click();
  await expect(page).toHaveURL(/\/compare\?a=ssangsudo/);
  await expect(page.getByLabel('1번째 도검')).toHaveValue('ssangsudo');

  await page.getByLabel('2번째 도검').selectOption('wakizashi');
  await page.getByRole('button', { name: '비교하기' }).click();
  await expect(page).toHaveURL(/a=ssangsudo.*b=wakizashi/);
  const table = page.getByRole('table', { name: '고른 도검의 제원 비교' });
  await expect(table.getByRole('columnheader', { name: '와키자시' })).toBeVisible();
  await expect(table.getByRole('rowheader', { name: '칼날 길이' })).toBeVisible();
  await expect(page).toHaveTitle(/도검 비교/);
  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);
});

test('검색 엔진: sitemap, robots, 공유 정보, 상품 구조화 데이터', async ({ page, request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/en/swords/ssangsudo');
  expect(sitemap).toContain('/swords/bongukgeom');
  expect(await (await request.get('/robots.txt')).text()).toContain('sitemap.xml');
  expect((await request.get('/og.jpg')).status()).toBe(200);
  expect((await request.get('/og/swords/ssangsudo.jpg')).status()).toBe(200);

  await page.goto('/swords/ssangsudo');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', '쌍수도');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/swords\/ssangsudo\.jpg/);
  const product = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
  ) as Record<string, unknown>;
  expect(product['@type']).toBe('Product');
  expect(product).not.toHaveProperty('offers');
});

test('도검 연표: 시대와 지역 표로 역사 도검을 본다', async ({ page }) => {
  await page.goto('/timeline');
  await expect(page.getByRole('heading', { level: 1, name: '도검 연표' })).toBeVisible();
  const table = page.getByRole('table', { name: '시대와 지역별 역사 도검' });
  await expect(table.getByRole('rowheader', { name: '18~19세기' })).toBeVisible();
  await expect(table.getByRole('columnheader', { name: '동양 도검' })).toBeVisible();
  await table.getByRole('link', { name: '쌍수도' }).click();
  await expect(page).toHaveURL(/\/swords\/ssangsudo$/);
  await page.goto('/timeline');
  await expect(page).toHaveTitle(/도검 연표/);
  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);
});

test('최근 본 도검: 앞서 본 도검을 상세 아래에 보여 준다', async ({ page }) => {
  await page.goto('/swords/hwando');
  await expect(page.getByRole('heading', { name: '최근 본 도검' })).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: '환도' })).toBeVisible();
  await page.goto('/swords/ssangsudo');
  const recent = page.getByRole('list', { name: '최근 본 도검' });
  await expect(recent.getByRole('link', { name: /환도/ })).toBeVisible();
  await expect(recent.getByRole('link', { name: /쌍수도/ })).toHaveCount(0);
});

test.describe('화면 전환', () => {
  /**
   * 그려진 프레임마다 화면에 보이는 라우트 경계 수를 기록합니다. 전환 중에는 두 화면이 겹칩니다.
   * 겹친 프레임 수(overlapFrames)도 셉니다. 동작 줄이기에서는 전환이 한 프레임 안에 끝납니다.
   */
  async function trackOverlap(page: Page) {
    await page.evaluate(() => {
      const w = window as unknown as { __maxPages: number; __overlapFrames: number };
      w.__maxPages = 0;
      w.__overlapFrames = 0;
      const tick = () => {
        const visible = [...document.querySelectorAll('[data-ssgoi-transition]')].filter(
          (el) => el.getClientRects().length > 0,
        );
        w.__maxPages = Math.max(w.__maxPages, visible.length);
        if (visible.length > 1) w.__overlapFrames += 1;
        requestAnimationFrame(tick);
      };
      tick();
    });
  }
  const maxPages = (page: Page) => page.evaluate(() => (window as unknown as { __maxPages: number }).__maxPages);
  const overlapFrames = (page: Page) =>
    page.evaluate(() => (window as unknown as { __overlapFrames: number }).__overlapFrames);

  /** 수화(hydration)가 끝나 클라이언트 이동이 될 때까지 기다립니다. 그 전에 누르면 문서를 새로 받습니다. */
  async function waitForHydration(page: Page) {
    await page.waitForFunction(() => Boolean((window as unknown as { next?: { router?: unknown } }).next?.router));
  }

  /**
   * 화면이 열린 뒤 몇 프레임 기다립니다. SSGOI는 화면이 열린 직후 10프레임 동안의 스크롤을 기록하지 않으므로
   * (스크롤 복원 중의 움직임을 사용자의 스크롤로 착각하지 않으려는 것), 사람이 스크롤하듯 그 뒤에 움직입니다.
   */
  const waitForFrames = (page: Page, frames = 15) =>
    page.evaluate(
      (count) =>
        new Promise<void>((resolve) => {
          let left = count;
          const tick = () => (--left <= 0 ? resolve() : requestAnimationFrame(tick));
          requestAnimationFrame(tick);
        }),
      frames,
    );
  const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

  async function openFirstSword(page: Page) {
    await page.goto('/');
    await waitForHydration(page);
    const art = page.locator('[data-hero-exit-key]').first();
    await expect(art).toBeVisible();
    const slug = await art.getAttribute('data-hero-exit-key');
    await trackOverlap(page);
    await page.locator(`a[href$="/swords/${slug}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`/swords/${slug}$`));
    // 카드 부조와 같은 키를 단 상세의 큰 부조로 날아갑니다.
    await expect(page.locator(`[data-hero-enter-key="${slug}"]`)).toBeVisible();
    await waitForPageTransition(page);
  }

  test('도검 카드를 누르면 두 화면이 겹쳐 움직이고, 끝나면 하나만 남는다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await openFirstSword(page);
    expect(await maxPages(page)).toBe(2);
    // 실측: 움직이면 두 화면이 12~20프레임 겹칩니다(데스크톱 12, 모바일 18~20).
    expect(await overlapFrames(page)).toBeGreaterThan(5);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await waitForPageTransition(page);
  });

  test('동작 줄이기를 켜면 움직이지 않고 바로 바뀐다(겹침은 몇 프레임 안)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openFirstSword(page);
    // 스크롤 정책을 지키려고 규칙은 그대로 두고 전환만 즉시 끝나게 하므로, 준비와 정리 동안 두 화면이 몇 프레임 함께 있습니다(실측 2~3).
    expect(await overlapFrames(page)).toBeLessThanOrEqual(4);
  });

  test('언어를 바꾸면 문서를 새로 받아 화면이 하나만 남는다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.getByRole('navigation', { name: '언어' }).getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-ssgoi-transition]')).toHaveCount(1);
  });

  test('없는 주소는 404로 응답한다', async ({ request }) => {
    expect((await request.get('/no/such/page')).status()).toBe(404);
    expect((await request.get('/en/no/such/page')).status()).toBe(404);
  });

  test('앱 안에서 없는 주소로 이동하면 떠난 화면이 남지 않고 404만 보인다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await waitForHydration(page);
    await expect(page.getByRole('heading', { level: 1, name: '도검의 벽' })).toBeVisible();
    // 깨진 내부 링크를 누른 것과 같은 클라이언트 이동
    await page.evaluate(() =>
      (window as unknown as { next: { router: { push: (href: string) => void } } }).next.router.push('/no/such/page'),
    );
    await expect(page).toHaveURL(/\/no\/such\/page$/);
    await waitForPageTransition(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: '도검의 벽' })).toHaveCount(0);
  });

  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`도검 상세에서 뒤로 가면 벽의 보던 자리로 돌아온다(동작 줄이기: ${reducedMotion})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion });
      await page.goto('/');
      await waitForHydration(page);
      await waitForFrames(page);
      const card = page.locator('a[href*="/swords/"]').nth(10);
      await card.scrollIntoViewIfNeeded();
      await waitForFrames(page, 3);
      const wallScroll = await scrollY(page);
      expect(wallScroll).toBeGreaterThan(0);
      await card.click();
      await expect(page).toHaveURL(/\/swords\//);
      await waitForPageTransition(page);
      await page.goBack();
      await expect(page).toHaveURL(/\/$/);
      await waitForPageTransition(page);
      await expect.poll(() => scrollY(page)).toBeGreaterThan(wallScroll - 10);
    });
  }

  // SSGOI 7.5.0은 문서의 첫 화면을 맨 위로 보내 브라우저가 되살린 위치를 지웠습니다. patches/@ssgoi__core@7.5.0.patch로 고칩니다.
  test('새로고침해도 보던 자리를 지키고, 그 자리에서 상세로 갔다 돌아와도 같은 자리다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await waitForHydration(page);
    await waitForFrames(page);
    const card = page.locator('a[href*="/swords/"]').nth(10);
    await card.scrollIntoViewIfNeeded();
    await waitForFrames(page, 3);
    const wallScroll = await scrollY(page);
    expect(wallScroll).toBeGreaterThan(0);

    await page.reload();
    await waitForHydration(page);
    await waitForFrames(page);
    // 수화 뒤 위쪽 요소의 높이가 바뀌면(모바일 머리글의 언어 링크) 브라우저가 보던 내용을 지키려고 스크롤을 더 내릴 수
    // 있습니다(scroll anchoring). 그래서 정확한 값 대신 되살린 위치보다 위로(맨 위로) 가지 않았는지 봅니다.
    expect(await scrollY(page)).toBeGreaterThan(wallScroll - 10);

    // 새로고침 뒤 스크롤하지 않고 바로 이동해도, 되살린 위치가 기록돼 있어야 합니다.
    await card.click();
    await expect(page).toHaveURL(/\/swords\//);
    await waitForPageTransition(page);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await waitForPageTransition(page);
    await expect.poll(() => scrollY(page)).toBeGreaterThan(wallScroll - 10);
  });
});
