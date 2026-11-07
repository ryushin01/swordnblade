import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const tiles = (page: Page) =>
  page.getByRole('list', { name: /도검의 벽|신화·전설|동양 도검|서양 도검/ }).getByRole('link');

async function expectNoA11yViolations(page: Page) {
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

test('도검의 벽: 16점이 보이고 분류로 거를 수 있다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: '도검의 벽' })).toBeVisible();
  await expect(tiles(page)).toHaveCount(16);

  await page.getByRole('navigation', { name: '도검 분류' }).getByRole('link', { name: '신화·전설' }).click();
  await expect(page).toHaveURL(/category=legend/);
  await expect(page.getByRole('heading', { level: 1, name: '신화·전설' })).toBeVisible();
  await expect(tiles(page)).toHaveCount(5);
  await expect(page.getByRole('link', { name: '신화·전설' })).toHaveAttribute('aria-current', 'page');

  await expectNoA11yViolations(page);
  await expectNoHorizontalOverflow(page);
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
