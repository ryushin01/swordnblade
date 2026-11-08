import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('__e2e_reset__')) {
      localStorage.clear();
      sessionStorage.setItem('__e2e_reset__', '1');
    }
  });
});

test('대시보드: 통계와 최근 주문을 보여 준다', async ({ page }) => {
  await page.goto('/admin/');
  await expect(page.getByRole('heading', { level: 1, name: '대시보드' })).toBeVisible();
  await expect(page.getByText('213', { exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'SNB-20261103-0002' })).toBeVisible();
  await expectNoA11yViolations(page);
});

test('상품: 가격을 바꿔 저장하면 목록에 반영된다', async ({ page }) => {
  await page.goto('/admin/products');
  await expect(page.getByRole('heading', { level: 1, name: '상품' })).toBeVisible();
  await expectNoA11yViolations(page);

  await page.getByRole('link', { name: '환도 수정' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '환도 수정' })).toBeVisible();
  await expect(page.getByRole('img', { name: /환도 일러스트 미리보기/ })).toBeVisible();
  await expectNoA11yViolations(page);

  const price = page.getByLabel('가격(원)');
  await price.fill('3500000');
  await page.getByRole('button', { name: '변경 저장' }).click();
  await expect(page.getByText('상품을 저장했습니다.')).toBeVisible();

  await page.goto('/admin/products');
  await expect(page.getByRole('row', { name: /환도/ })).toContainText('3,500,000원');
});

test('상품: 필수 칸을 비우면 저장하지 않고 안내한다', async ({ page }) => {
  await page.goto('/admin/products/new');
  await expect(page.getByRole('heading', { level: 1, name: '상품 등록' })).toBeVisible();
  await page.getByRole('button', { name: '상품 등록' }).click();
  await expect(page.getByText('이름을 입력해 주세요.').first()).toBeVisible();
  await expect(page.getByLabel('이름', { exact: true })).toBeFocused();
});

test('주문: 상태를 바꾼다', async ({ page }) => {
  await page.goto('/admin/orders');
  await expect(page.getByRole('heading', { level: 1, name: '주문' })).toBeVisible();
  await expectNoA11yViolations(page);

  await page.getByLabel('SNB-20261103-0002 주문 상태').click();
  // 화면에 보이는 드롭다운 항목을 누릅니다(접근성용 숨은 listbox와 구분).
  await page.locator('.ant-select-dropdown').getByText('출고 준비', { exact: true }).click();
  await expect(page.getByText('주문 상태를 바꿨습니다.')).toBeVisible();
  await expect(
    page
      .getByRole('row', { name: /SNB-20261103-0002/ })
      .getByText('출고 준비')
      .first(),
  ).toBeVisible();
});

test('설정: 관세율을 바꿔 저장한다', async ({ page }) => {
  await page.goto('/admin/settings');
  await expect(page.getByRole('heading', { level: 1, name: '관세·환율 설정' })).toBeVisible();
  await expectNoA11yViolations(page);

  await page.getByLabel('대한민국 관세율(%)').fill('6.5');
  await page.getByRole('button', { name: '설정 저장' }).click();
  await expect(page.getByText('관세·환율 설정을 저장했습니다.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('대한민국 관세율(%)')).toHaveValue('6.5');
});

test('상품: 칼날 무늬·술·전해지는 이야기를 고쳐 저장한다', async ({ page }) => {
  await page.goto('/admin/products/sw-002');
  await expect(page.getByRole('heading', { level: 1, name: '환도 수정' })).toBeVisible();

  await page.getByRole('checkbox', { name: '하몬(물결 무늬)' }).check();
  await page.getByRole('button', { name: '술 색 없애기' }).click();
  await expect(page.getByRole('button', { name: '술 색 없애기' })).toHaveCount(0);

  await page.getByRole('button', { name: '이야기 추가', exact: true }).click();
  await page.getByLabel('이야기 3: 때', { exact: true }).fill('오늘');
  await page.getByLabel('이야기 3: 내용', { exact: true }).fill('어드민에서 덧붙인 이야기');
  await expectNoA11yViolations(page);

  await page.getByRole('button', { name: '변경 저장' }).click();
  await expect(page.getByText('상품을 저장했습니다.')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('checkbox', { name: '하몬(물결 무늬)' })).toBeChecked();
  await expect(page.getByLabel('이야기 3: 내용', { exact: true })).toHaveValue('어드민에서 덧붙인 이야기');
  await expect(page.getByRole('button', { name: '술 색 없애기' })).toHaveCount(0);
});

test('상품: 이름으로 찾으면 목록과 개수가 바뀐다', async ({ page }) => {
  await page.goto('/admin/products');
  await expect(page.getByRole('link', { name: '환도 수정' })).toBeVisible();
  await page.getByLabel('이름으로 찾기').fill('Excalibur');
  await expect(page.getByRole('status').filter({ hasText: '1점' })).toBeVisible();
  await expect(page.getByRole('link', { name: '엑스칼리버 수정' })).toBeVisible();
  await expect(page.getByRole('link', { name: '환도 수정' })).toHaveCount(0);
  await expectNoA11yViolations(page);
});
