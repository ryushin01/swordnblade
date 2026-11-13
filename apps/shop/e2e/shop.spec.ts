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
  await expect(page.locator('ul a[href^="/swords/"]').first()).toContainText('쿠사나기노츠루기');

  await page.goto('/?q=없는이름');
  await expect(page.getByText('‘없는이름’에 맞는 도검이 없습니다.', { exact: false })).toBeVisible();
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
  /** 화면에 보이는 라우트 경계 수의 최댓값을 그려진 프레임마다 기록합니다. 전환 중에는 두 화면이 겹칩니다. */
  async function trackOverlap(page: Page) {
    await page.evaluate(() => {
      const w = window as unknown as { __maxPages: number };
      w.__maxPages = 0;
      const tick = () => {
        const visible = [...document.querySelectorAll('[data-ssgoi-transition]')].filter(
          (el) => el.getClientRects().length > 0,
        );
        w.__maxPages = Math.max(w.__maxPages, visible.length);
        requestAnimationFrame(tick);
      };
      tick();
    });
  }
  const maxPages = (page: Page) => page.evaluate(() => (window as unknown as { __maxPages: number }).__maxPages);

  async function openFirstSword(page: Page) {
    await page.goto('/');
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
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await waitForPageTransition(page);
  });

  test('동작 줄이기를 켜면 화면 전환 없이 바로 바뀐다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openFirstSword(page);
    expect(await maxPages(page)).toBe(1);
  });

  test('언어를 바꾸면 문서를 새로 받아 화면이 하나만 남는다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.getByRole('navigation', { name: '언어' }).getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('[data-ssgoi-transition]')).toHaveCount(1);
  });

  test('없는 주소는 화면 전환 영역 밖에서 404로 응답한다', async ({ request }) => {
    expect((await request.get('/no/such/page')).status()).toBe(404);
    expect((await request.get('/en/no/such/page')).status()).toBe(404);
  });
});
