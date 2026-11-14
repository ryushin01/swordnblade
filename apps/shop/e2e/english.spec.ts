import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

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
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('__e2e_reset__')) {
      localStorage.clear();
      sessionStorage.setItem('__e2e_reset__', '1');
    }
  });
});

test('영어 화면: /en에서 영어로 보이고 lang이 en이다', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'The Wall of Blades' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Excalibur.*₩12,000,000/ })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: '1–24 of 213 swords' })).toBeVisible();
  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);
});

test('언어 전환: 주소와 검색 조건을 그대로 두고 언어만 바꾼다', async ({ page }) => {
  await page.goto('/?category=legend');
  const languages = page.getByRole('navigation', { name: '언어' });
  await expect(languages.getByRole('link', { name: '한국어' })).toHaveAttribute('aria-current', 'true');
  // 서버 HTML의 링크는 검색 조건 없이 언어만 바꾸고, hydrate 뒤에 검색 조건이 붙습니다.
  const english = languages.getByRole('link', { name: 'English' });
  await expect(english).toHaveAttribute('href', /category=legend/);
  await english.click();
  await expect(page).toHaveURL(/\/en\?category=legend$/);
  await waitForPageTransition(page);
  await expect(page.getByRole('heading', { level: 1, name: 'Myth & Legend' })).toBeVisible();

  const korean = page.getByRole('navigation', { name: 'Language' }).getByRole('link', { name: '한국어' });
  await expect(korean).toHaveAttribute('href', /category=legend/);
  await korean.click();
  await expect(page).toHaveURL(/\/\?category=legend$/);
  await waitForPageTransition(page);
  await expect(page.getByRole('heading', { level: 1, name: '신화·전설' })).toBeVisible();
});

test('영어 상세와 구매 흐름: 번역된 이야기, 영어 관세 안내, 영어 오류 안내', async ({ page }) => {
  await page.goto('/en/swords/ssangsudo');
  await expect(page.getByRole('heading', { level: 1, name: 'Ssangsudo' })).toBeVisible();
  await expect(page.getByText('Permit required')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Stories told' }).getByText(/Muyedobotongji/)).toBeVisible();
  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByText('Added 1 × Ssangsudo to your cart.')).toBeVisible();

  await page.goto('/en/cart');
  await page.getByLabel('Ship to').selectOption('US');
  await expect(page.getByText('South Korea → United States')).toBeVisible();
  await expect(page.getByText(/Assumes no de minimis exemption/)).toBeVisible();

  await page.getByRole('link', { name: 'Go to checkout' }).click();
  await expect(page).toHaveURL(/\/en\/checkout$/);
  await page.getByRole('button', { name: 'Pay now' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Please check your details.' })).toBeFocused();
  await expect(page.getByRole('link', { name: /Recipient: Enter the recipient’s name\./ })).toBeVisible();
  await expectNoA11yViolations(page);
});

test('영어 404와 검색', async ({ page }) => {
  await page.goto('/en/no-such-page');
  await expect(page.getByRole('heading', { level: 1, name: 'Nothing is carved in this spot' })).toBeVisible();
  await page.goto('/en?q=legend');
  await expect(page.getByRole('status').filter({ hasText: '1–24 of 112 results for “legend”' })).toBeVisible();
});

test('언어별 대체 주소(hreflang)를 절대 주소로 알린다', async ({ page }) => {
  await page.goto('/en/swords/ssangsudo');
  const en = await page.locator('link[rel="alternate"][hreflang="en"]').getAttribute('href');
  const ko = await page.locator('link[rel="alternate"][hreflang="ko"]').getAttribute('href');
  expect(en).toMatch(/^https:\/\/.+\/en\/swords\/ssangsudo$/);
  expect(ko).toMatch(/^https:\/\/.+\/swords\/ssangsudo$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', en!);
});
