import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  // 테스트마다 깨끗한 Mock DB, 장바구니, 로그인 상태로 시작합니다.
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('__e2e_reset__')) {
      localStorage.clear();
      sessionStorage.setItem('__e2e_reset__', '1');
    }
  });
});

const header = (page: Page) => page.getByRole('banner');

test('회원가입 → 주문서 자동 채우기 → 내 계정에서 주문 확인 → 로그아웃 → 다시 로그인', async ({ page }) => {
  await page.goto('/');
  await header(page).getByRole('link', { name: '로그인' }).click();
  await expect(page.getByRole('heading', { level: 1, name: '로그인' })).toBeVisible();
  await page.getByRole('link', { name: /회원가입/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: '회원가입' })).toBeVisible();

  // 빈 채로 보내면 오류 요약으로 초점이 갑니다.
  await page.getByRole('button', { name: '가입하기' }).click();
  await expect(page.getByRole('alert').filter({ hasText: '입력 내용을 확인해 주세요.' })).toBeFocused();
  await expectNoA11yViolations(page);

  await page.getByLabel(/^이름/).fill('김가상');
  await page.getByLabel(/^이메일/).fill('member@example.com');
  await page.getByLabel(/^비밀번호 \(/).fill('sword1234');
  await page.getByLabel(/^비밀번호 확인/).fill('sword1234');
  await page.getByRole('button', { name: '가입하기' }).click();

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText('member@example.com')).toBeVisible();
  await expect(page.getByText('아직 주문이 없습니다.')).toBeVisible();
  await expect(header(page).getByRole('link', { name: '내 계정' })).toBeVisible();
  // 화면 전환 직후에는 문서 제목이 잠시 비어 있으므로 바뀐 뒤에 검사합니다.
  await expect(page).toHaveTitle(/내 계정/);
  await expectNoA11yViolations(page);

  await page.goto('/swords/uchigatana');
  await page.getByRole('button', { name: '장바구니에 담기' }).click();
  await expect(page.getByRole('link', { name: /장바구니\s*1점/ })).toBeVisible();
  await page.goto('/checkout');
  await expect(page.getByLabel(/^받는 분/)).toHaveValue('김가상');
  await expect(page.getByLabel(/^이메일/)).toHaveValue('member@example.com');
  await page.getByLabel(/^연락처/).fill('010-0000-0000');
  await page.getByLabel(/^우편번호/).fill('03000');
  await page.getByLabel(/^주소/).fill('서울특별시 종로구 가상로 1');
  await page.getByRole('radio', { name: /신용카드/ }).check();
  await page.getByRole('checkbox', { name: /허가를 받았거나/ }).check();
  await page.getByRole('button', { name: '결제하기' }).click();
  await expect(page).toHaveURL(/\/orders\/(SNB-\d{8}-\d{4})$/);
  const orderId = new URL(page.url()).pathname.split('/').pop()!;

  await header(page).getByRole('link', { name: '내 계정' }).click();
  await expect(page.getByRole('link', { name: `${orderId} 주문 보기` })).toBeVisible();

  await page.getByRole('button', { name: '로그아웃' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(header(page).getByRole('link', { name: '로그인' })).toBeVisible();

  // 로그인하지 않은 채 내 계정을 열면 로그인으로 안내하고, 로그인 뒤 돌아옵니다.
  await page.goto('/account');
  await expect(page.getByText('내 계정을 보려면 로그인해 주세요.')).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: '로그인' }).click();
  await page.getByLabel(/^이메일/).fill('member@example.com');
  await page.getByLabel(/^비밀번호 \(/).fill('wrong1234');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page.getByRole('alert').filter({ hasText: '이메일 또는 비밀번호가 맞지 않습니다.' })).toBeFocused();
  await page.getByLabel(/^비밀번호 \(/).fill('sword1234');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('link', { name: `${orderId} 주문 보기` })).toBeVisible();
});

test('로그인 뒤 돌아갈 주소는 사이트 안 주소만 따른다', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel(/^이름/).fill('김가상');
  await page.getByLabel(/^이메일/).fill('next@example.com');
  await page.getByLabel(/^비밀번호 \(/).fill('sword1234');
  await page.getByLabel(/^비밀번호 확인/).fill('sword1234');
  await page.getByRole('button', { name: '가입하기' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.getByRole('button', { name: '로그아웃' }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/login?next=//evil.example.com');
  await page.getByLabel(/^이메일/).fill('next@example.com');
  await page.getByLabel(/^비밀번호 \(/).fill('sword1234');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/localhost:\d+\/account$/);

  await page.getByRole('button', { name: '로그아웃' }).click();
  await page.goto('/login?next=/cart');
  await page.getByLabel(/^이메일/).fill('next@example.com');
  await page.getByLabel(/^비밀번호 \(/).fill('sword1234');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/cart$/);
});

const signUp = async (page: Page, email: string) => {
  await page.goto('/signup');
  await page.getByLabel(/^이름/).fill('김가상');
  await page.getByLabel(/^이메일/).fill(email);
  await page.getByLabel(/^비밀번호 \(/).fill('sword1234');
  await page.getByLabel(/^비밀번호 확인/).fill('sword1234');
  await page.getByRole('button', { name: '가입하기' }).click();
  await expect(page).toHaveURL(/\/account$/);
};

test('찜 목록은 계정에 남는다: 로그아웃하면 비고, 다시 로그인하면 돌아온다', async ({ page }) => {
  await signUp(page, 'wish@example.com');
  await header(page).getByRole('link', { name: '내 계정' }).waitFor();
  await page.goto('/swords/ssangsudo');
  const saved = page.waitForResponse((r) => r.url().endsWith('/api/me/wishlist') && r.request().method() === 'PUT');
  await page.getByRole('button', { name: '찜하기' }).click();
  await saved;

  await header(page).getByRole('link', { name: '내 계정' }).click();
  await page.getByRole('button', { name: '로그아웃' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(header(page).getByRole('link', { name: /찜 목록\s*0점/ })).toBeVisible();

  await page.goto('/login');
  await page.getByLabel(/^이메일/).fill('wish@example.com');
  await page.getByLabel(/^비밀번호 \(/).fill('sword1234');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(header(page).getByRole('link', { name: /찜 목록\s*1점/ })).toBeVisible();
});

test('내 주문 취소: 한 번 더 확인하고, 취소하면 재고가 돌아온다', async ({ page }) => {
  await signUp(page, 'cancel@example.com');
  const stockText = page.getByText(/남은 수량 \d+점/);
  await page.goto('/swords/uchigatana');
  const before = await stockText.innerText();
  await page.getByRole('button', { name: '장바구니에 담기' }).click();
  await expect(page.getByRole('link', { name: /장바구니\s*1점/ })).toBeVisible();
  await page.goto('/checkout');
  await expect(page.getByLabel(/^받는 분/)).toHaveValue('김가상');
  await page.getByLabel(/^연락처/).fill('010-0000-0000');
  await page.getByLabel(/^우편번호/).fill('03000');
  await page.getByLabel(/^주소/).fill('서울특별시 종로구 가상로 1');
  await page.getByRole('radio', { name: /신용카드/ }).check();
  await page.getByRole('checkbox', { name: /허가를 받았거나/ }).check();
  await page.getByRole('button', { name: '결제하기' }).click();
  await expect(page).toHaveURL(/\/orders\/SNB-/);

  await page.goto('/swords/uchigatana');
  await expect(stockText).not.toHaveText(before);

  await page.goto('/account');
  await page.getByRole('button', { name: '주문 취소' }).click();
  await expect(page.getByRole('button', { name: '취소 확정' })).toBeFocused();
  await expectNoA11yViolations(page);
  await page.getByRole('button', { name: '취소 확정' }).click();
  await expect(page.getByRole('button', { name: '주문 취소' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '내 주문' })).toBeFocused();

  await page.goto('/swords/uchigatana');
  await expect(stockText).toHaveText(before);
});

test('구매 후기와 프로필 사진: 산 회원만 쓰고, 사진이 원형으로 보인다', async ({ page }) => {
  await signUp(page, 'review@example.com');
  await page.getByLabel('프로필 사진').setInputFiles({
    name: 'me.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR4nGP4z8DwHwyBDBgAAH7lB/m0mfTcAAAAAElFTkSuQmCC',
      'base64',
    ),
  });
  await expect(page.getByRole('button', { name: '사진 지우기' })).toBeVisible();

  await page.goto('/swords/uchigatana');
  await expect(page.getByText('이 도검을 구매하면 후기를 쓸 수 있습니다.')).toBeVisible();
  await page.getByRole('button', { name: '장바구니에 담기' }).click();
  await expect(page.getByRole('link', { name: /장바구니\s*1점/ })).toBeVisible();
  await page.goto('/checkout');
  await expect(page.getByLabel(/^받는 분/)).toHaveValue('김가상');
  await page.getByLabel(/^연락처/).fill('010-0000-0000');
  await page.getByLabel(/^우편번호/).fill('03000');
  await page.getByLabel(/^주소/).fill('서울특별시 종로구 가상로 1');
  await page.getByRole('radio', { name: /신용카드/ }).check();
  await page.getByRole('checkbox', { name: /허가를 받았거나/ }).check();
  await page.getByRole('button', { name: '결제하기' }).click();
  await expect(page).toHaveURL(/\/orders\/SNB-/);

  await page.goto('/swords/uchigatana');
  const section = page.getByRole('region', { name: /구매 후기/ });
  await section.getByRole('button', { name: '후기 등록' }).click();
  await expect(section.getByRole('alert')).toContainText('별점을 골라 주세요.');
  await section.getByRole('radio', { name: '5점' }).check();
  await section.getByLabel('후기 내용').fill('균형이 좋고 손잡이 감기가 단단합니다.');
  await section.getByRole('button', { name: '후기 등록' }).click();

  await expect(section.getByText('균형이 좋고 손잡이 감기가 단단합니다.')).toBeVisible();
  await expect(section.getByText('김*상')).toBeVisible();
  await expect(section.getByText('이 도검의 후기를 이미 썼습니다.')).toBeVisible();
  const avatar = section.getByRole('listitem').locator('img');
  await expect(avatar).toHaveClass(/rounded-full/);
  await expect.poll(() => avatar.evaluate((node: HTMLImageElement) => node.naturalWidth)).toBeGreaterThan(0);
  await expectNoA11yViolations(page);
});
