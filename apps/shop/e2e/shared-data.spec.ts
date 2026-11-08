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

test('어드민에서 덧붙인 이야기가 쇼핑몰 상세에 보인다', async ({ page }) => {
  await page.goto('/admin/products/sw-010');
  await expect(page.getByRole('heading', { level: 1, name: '글라디우스 수정' })).toBeVisible();
  await page.getByRole('button', { name: '이야기 추가', exact: true }).click();
  await page.getByLabel('이야기 2: 때', { exact: true }).fill('오늘');
  await page.getByLabel('이야기 2: 내용', { exact: true }).fill('공방에서 새로 벼린 한 자루');
  await page.getByRole('button', { name: '변경 저장' }).click();
  await expect(page.getByText('상품을 저장했습니다.')).toBeVisible();

  await page.goto('/swords/gladius');
  await expect(
    page.getByRole('region', { name: '전해지는 이야기' }).getByText('공방에서 새로 벼린 한 자루'),
  ).toBeVisible();
});

test('어드민에서 고친 영어 글이 영어 화면에 보이고, 비우면 한국어 원문이 보인다', async ({ page }) => {
  await page.goto('/admin/products/sw-008');
  await expect(page.getByRole('heading', { level: 1, name: '롱소드 수정' })).toBeVisible();
  await page.getByLabel('영어 한 줄 소개').fill('A reforged longsword from the admin.');
  await page.getByRole('button', { name: '변경 저장' }).click();
  await expect(page.getByText('상품을 저장했습니다.')).toBeVisible();
  await page.goto('/en/swords/longsword');
  await expect(page.getByText('A reforged longsword from the admin.')).toBeVisible();

  await page.goto('/admin/products/sw-008');
  for (const label of ['영어 시대', '영어 소재', '영어 한 줄 소개']) await page.getByLabel(label).fill('');
  await page.getByLabel('영어 설명').fill('');
  while (await page.getByRole('button', { name: /영어 이야기 \d+ 지우기/ }).count()) {
    await page
      .getByRole('button', { name: /영어 이야기 \d+ 지우기/ })
      .first()
      .click();
  }
  await page.getByRole('button', { name: '변경 저장' }).click();
  await expect(page.getByText('상품을 저장했습니다.')).toBeVisible();
  await page.goto('/en/swords/longsword');
  await expect(page.getByRole('heading', { level: 1, name: 'Longsword' })).toBeVisible();
  await expect(page.getByText('한 손 반, 두 손으로도 쥐는 중세 유럽의 십자형 검.')).toBeVisible();
});

// 2×2 크기의 붉은 PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDK+mmyAAAAABJRU5ErkJggg==',
  'base64',
);

test('어드민에서 올린 사진이 쇼핑몰 상세 갤러리에 대체 텍스트와 함께 보인다', async ({ page }) => {
  await page.goto('/admin/products/sw-004');
  await expect(page.getByRole('heading', { level: 1, name: '우치가타나 수정' })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({ name: 'katana.png', mimeType: 'image/png', buffer: PNG });
  await page.getByLabel('사진 1: 대체 텍스트', { exact: true }).fill('칼날을 따라 흐르는 하몬 무늬를 가까이 찍은 사진');
  await page.getByRole('button', { name: '변경 저장' }).click();
  await expect(page.getByText('상품을 저장했습니다.')).toBeVisible();

  await page.goto('/swords/uchigatana');
  const gallery = page.getByRole('region', { name: '이미지' });
  await gallery.getByRole('button', { name: '이미지 4: 사진 1' }).click();
  const photo = gallery.getByRole('img', { name: '칼날을 따라 흐르는 하몬 무늬를 가까이 찍은 사진' });
  await expect(photo).toBeVisible();
  // Mock API(서비스 워커)가 실제 이미지를 돌려줬는지 확인합니다.
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});
