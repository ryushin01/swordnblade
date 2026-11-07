import { expect, test } from '@playwright/test';

/**
 * 어드민은 쇼핑몰 주소의 /admin 아래에서 열려 같은 Mock 데이터를 씁니다.
 * 어드민에서 바꾼 내용이 쇼핑몰에, 쇼핑몰 주문이 어드민에 보이는지 확인합니다.
 */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('__e2e_reset__')) {
      localStorage.clear();
      sessionStorage.setItem('__e2e_reset__', '1');
    }
  });
});

test('어드민에서 바꾼 가격이 쇼핑몰에 보인다', async ({ page }) => {
  await page.goto('/admin/products/sw-002');
  await expect(page.getByRole('heading', { level: 1, name: '환도 수정' })).toBeVisible();
  await page.getByLabel('가격(원)').fill('3500000');
  await page.getByRole('button', { name: '변경 저장' }).click();
  await expect(page.getByText('상품을 저장했습니다.')).toBeVisible();

  await page.getByRole('link', { name: '쇼핑몰 보기' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '도검의 벽' })).toBeVisible();
  await expect(page.getByRole('link', { name: /환도.*3,500,000원/ })).toBeVisible();
});

test('쇼핑몰 주문이 어드민 주문 목록에 보인다', async ({ page }) => {
  await page.goto('/swords/gladius');
  await page.getByRole('button', { name: '장바구니에 담기' }).click();
  await page.goto('/checkout');
  await page.getByLabel(/^받는 분/).fill('공유확인');
  await page.getByLabel(/^이메일/).fill('share@example.com');
  await page.getByLabel(/^연락처/).fill('010-0000-0000');
  await page.getByLabel(/^우편번호/).fill('03000');
  await page.getByLabel(/^주소/).fill('서울특별시 종로구 가상로 1');
  await page.getByRole('radio', { name: /계좌이체/ }).check();
  await page.getByRole('checkbox', { name: /허가를 받았거나/ }).check();
  await page.getByRole('button', { name: '결제하기' }).click();
  await expect(page).toHaveURL(/\/orders\/SNB-/);

  await page.getByRole('link', { name: '관리자 화면 보기' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '대시보드' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '공유확인' })).toBeVisible();
});
