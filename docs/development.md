# 개발 가이드

## 워크스페이스

| 패키지 | 역할 |
|---|---|
| `@snb/domain` | 타입(`Sword`, `Order`, `CustomsConfig`), 관세 계산 `estimateCustoms`, 소지허가 판단, 금액·길이 표시 형식 |
| `@snb/mocks` | 16점 시드 데이터, 메모리 DB(`createDb`), MSW 핸들러, 브라우저(`/browser`)·Node(`/node`) 진입점 |
| `@snb/sword-art` | 도검 부조 `SwordRelief`, 칼날 로고 `BladeMark` |
| `@snb/shop` | 쇼핑몰 (포트 3000) |
| `@snb/admin` | 어드민 (포트 3001, `basePath: '/admin'`) |

패키지는 빌드하지 않고 TypeScript 소스를 그대로 내보냅니다. 두 앱은 `next.config.ts`의 `transpilePackages`로 읽습니다.

## 쇼핑몰과 어드민을 한 주소로 (multi-zones)

- 어드민은 `basePath: '/admin'`으로 빌드하고, 쇼핑몰이 `/admin` 요청을 어드민 앱으로 넘깁니다(`apps/shop/next.config.ts`의 rewrites). 그래서 두 앱이 **같은 출처(origin)** 에서 열립니다.
- 넘길 주소는 빌드할 때 `ADMIN_ORIGIN`으로 정합니다. 기본값은 개발 `http://localhost:3001`, 프로덕션 `https://swordnblade-admin.vercel.app`입니다.
- `pnpm dev`로 두 앱을 함께 띄우고 `http://localhost:3000/admin`으로 엽니다. 어드민만 따로 열려면 `http://localhost:3001/admin`입니다.
- 쇼핑몰과 어드민 사이의 이동은 다른 앱으로 넘어가므로 `next/link`가 아닌 일반 `a` 링크를 씁니다.

## FSD 구조

두 앱 모두 Feature-Sliced Design v2.1을 따릅니다.

- Next.js 규칙에 맞춰 계층 이름을 `_app`, `_pages`로 씁니다. `src/app/`의 라우트 파일은 `_pages`와 `_app`을 다시 내보내기만 합니다.
- 슬라이스는 자기보다 아래 계층만, 공개 API(`index.ts`)로만 가져옵니다.
- 한 페이지에서만 쓰는 코드는 그 페이지 슬라이스에 둡니다. 두 곳 이상에서 쓰게 되면 `features`·`widgets`로 올립니다. (예: 배송 국가 선택은 상세와 장바구니에서 써서 `features/choose-destination`)
- `pnpm lint`가 Steiger로 규칙을 검사합니다. `_app`·`_pages` 이름 경고(`fsd/typo-in-layer-name`)만 끕니다.

## Mock API

- 브라우저: 첫 API 요청 전에 `startMockApi`가 MSW 워커를 켭니다(`shared/api/client.ts`). 두 앱이 같은 워커(`/mockServiceWorker.js`)와 같은 localStorage 키(`snb-db-v1`)를 써서 데이터를 함께 씁니다. 새로고침해도 남고, 저장소를 못 쓰는 환경에서는 메모리로만 동작합니다.
- Mock DB는 읽고 쓸 때마다 저장소를 다시 읽어, 다른 앱이 바꾼 값을 바로 봅니다. 저장된 값이 없으면 지금 메모리 상태를 유지합니다(시드로 되돌리지 않음).
- 어드민만 따로 열리면 루트에 워커가 없으므로 `/admin/mockServiceWorker.js`를 `/admin` 범위로 등록합니다(`Service-Worker-Allowed` 헤더). 이때는 데이터가 쇼핑몰과 공유되지 않습니다.
- 테스트: `NEXT_PUBLIC_API_MOCKING=off`로 브라우저 워커를 끄고 `createMockServer()`(MSW Node)를 씁니다.
- 주문 금액은 클라이언트가 보낸 값을 쓰지 않고 Mock 서버가 `estimateCustoms`로 다시 계산합니다. 재고 부족(409), 입력 오류(422)도 서버에서 판단합니다.

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/swords?category=` | 상품 목록 |
| GET | `/api/swords/:slug` | 상품 상세 (slug 또는 id) |
| POST · PUT · DELETE | `/api/swords`, `/api/swords/:id` | 상품 등록·수정·삭제 |
| GET · PUT | `/api/customs-config` | 관세·환율 설정 |
| GET · POST | `/api/orders` | 주문 목록·주문 |
| GET · PATCH | `/api/orders/:id` | 주문 상세·상태 변경 |
| GET | `/api/stats` | 대시보드 통계 |

## 테스트

| 종류 | 위치 | 명령 |
|---|---|---|
| 단위 | `packages/*/src/*.test.ts` | `pnpm test` |
| 컴포넌트 | 컴포넌트 옆 `*.test.tsx` | `pnpm test` |
| 스토리 | 컴포넌트 옆 `*.stories.tsx` | `pnpm test:storybook` (보기: `pnpm --filter @snb/shop storybook`) |
| E2E | `apps/*/e2e` | `pnpm build` 후 `pnpm --filter @snb/shop e2e` |

E2E는 `next start`(프로덕션 빌드)를 띄워 데스크톱·모바일(Pixel 7) 두 화면에서 실행합니다. 쇼핑몰은 3101, 어드민은 3102 포트를 씁니다(`E2E_PORT`로 바꿀 수 있음). `E2E_BASE_URL`을 주면 로컬 서버를 띄우지 않고 그 주소(배포된 사이트)를 검사합니다. 매 페이지에서 axe(WCAG 2.2 AA 태그)를 돌리고, 쇼핑몰은 가로 넘침도 검사합니다. 쇼핑몰 E2E는 어드민 서버도 함께 띄워 두 앱의 데이터 공유를 검사하므로, 쇼핑몰을 `ADMIN_ORIGIN=http://localhost:3102`로 빌드해야 합니다.

스토리 테스트는 모든 스토리를 실제 브라우저(Chromium)에서 렌더링하고 axe를 돌립니다. 접근성 위반이 하나라도 있으면 실패합니다(`a11y: { test: 'error' }`).

## 코드 스타일

- ESLint(`eslint.config.mjs`): Next.js 권장 규칙(Core Web Vitals, TypeScript, jsx-a11y, React Hooks)과 import 정렬. 순서는 react → next → 외부 패키지 → `@snb/` → `@/` → 상대 경로 → `import type` → CSS입니다. `pnpm lint`는 ESLint와 Steiger를 함께 돌립니다.
- Prettier(`.prettierrc.json`): 작은따옴표, 한 줄 120자. 문서(`*.md`)는 표를 손으로 맞춰 두어 제외합니다.
- husky: 커밋 전에 바뀐 파일에 ESLint·Prettier(lint-staged), 전체 타입 검사, 단위 테스트를 실행합니다.
- TypeScript는 6.0으로 고정합니다. typescript-eslint가 아직 7.0을 지원하지 않습니다.

## 언어 (next-intl)

- 쇼핑몰만 한국어와 영어를 지원합니다. 한국어는 지금 주소(`/`), 영어는 `/en` 아래입니다(`localePrefix: 'as-needed'`). 브라우저 언어로 자동 이동하지 않습니다.
- `src/proxy.ts`(Next 16의 미들웨어)가 언어 경로를 처리합니다. `/admin`, `/storybook`, `/api`, 정적 파일은 건드리지 않습니다.
- 라우트는 `src/app/[locale]/` 아래에 있고, 화면 글은 `shared/i18n/messages/{ko,en}.json`에 있습니다. 앱 안 이동에는 `next/link` 대신 `@/shared/i18n`의 `Link`·`useRouter`를 씁니다(`/en`을 알아서 붙임).
- 도검의 영어 글은 `packages/mocks/src/seed-en.ts`에 있고 `Sword.translations.en`으로 붙습니다. 화면은 `localizeForLocale`로 바꿔 보여 주며, 예전에 저장된 Mock 데이터에 번역이 없으면 같은 id의 시드 번역을, 그것도 없으면(어드민에서 새로 만든 도검) 한국어 원문을 씁니다. 어드민 상품 수정 화면의 "영어(English)" 카드에서 영어 글을 고칩니다. 모두 비우면 `translations`를 빈 객체로 저장해, 시드 번역으로 되돌아가지 않고 한국어 원문을 보여 줍니다.
- 금액은 한국어 `1,234원`, 영어 `₩1,234`로, 국가 이름·주문 상태·허가 안내도 언어에 맞춥니다(`@snb/domain`의 `i18n.ts`).
- 머리글의 언어 링크는 지금 주소와 검색 조건을 그대로 두고 언어만 바꿉니다. 링크 글자는 그 언어로 쓰고 `lang`·`hrefLang`을 붙입니다. 페이지마다 `hreflang` 대체 주소를 알립니다.
- 시드 도검 상세, 장바구니, 주문서는 언어마다 정적으로 만듭니다(`setRequestLocale`).
- 테스트는 `renderWithProviders(ui, { locale })`로 번역을 감싸고, Storybook은 도구 막대에서 언어를 바꿉니다.

## 서버 렌더링

- 상품 목록과 상세는 서버가 시드 데이터로 먼저 그립니다. 첫 화면과 검색 엔진에 내용이 바로 보이고, 자바스크립트 없이도 읽을 수 있습니다(E2E로 확인).
- 브라우저에서는 TanStack Query의 `initialData`로 받아 바로 보여 준 뒤, `initialDataUpdatedAt: 0`이라 곧바로 Mock API에서 다시 받아 어드민에서 바꾼 값으로 바꿉니다.
- 시드 도검 상세는 빌드할 때 정적으로 만듭니다(`generateStaticParams`). 어드민에서 새로 만든 도검은 브라우저에서 불러옵니다.
- 찾기·정렬은 GET 폼(`next/form`)이라 결과가 주소(`?q=&sort=`)에 남습니다.

## 성능 (Lighthouse, 모바일)

| 화면 | 성능 | 접근성 | 권장사항 | SEO |
|---|---|---|---|---|
| 도검의 벽 | 95 | 100 | 100 | 100 |
| 쌍수도 상세(영어) | 95 | 100 | 100 | 100 |
| 장바구니 | 98 | 100 | 100 | 100 |

운영 주소(https://swordnblade.vercel.app)에서 2026-11-08에 잰 값입니다. 한글 웹 글꼴(Noto Serif KR)을 쓸 때는 한 화면에 조각 파일 10여 개(약 700KB)를 받아 성능이 62~70, 첫 화면 표시(FCP)가 4~5초였습니다. 그래서 한글은 운영체제 명조체를 씁니다. 권장사항은 사이트 아이콘이 없어 `/favicon.ico` 404가 콘솔 오류로 잡혀 96이었다가, 아이콘을 넣어 100이 되었습니다. 어드민은 검색 노출을 막아(noindex) SEO 점수가 낮은 것이 정상입니다.

## 접근성 점검 (KWCAG 2.2)

axe를 통과해도 KWCAG 준수는 아니므로 다음을 직접 확인했습니다.

| 항목 | 처리 |
|---|---|
| 5.1.1 대체 텍스트 | 상세 부조는 `role="img"`와 설명, 목록 부조는 이름·가격 글자가 있어 장식으로 숨김 |
| 5.3.1 표 구성 | 장바구니 표에 `caption`, `th scope` |
| 5.4.1 색 무관 인식 | 주문 상태·허가 여부를 색 점과 글자로 함께 표시 |
| 5.4.3 명도 대비 | 쇼핑몰 글자색 5.35:1 이상. 어드민은 Ant Design 기본값 중 대비가 모자란 토큰(primary, 보조 글자)을 진하게 바꿈 |
| 6.1.1 키보드 | 가로로 넘치는 어드민 표는 초점을 받는 영역(`ScrollRegion`)으로 감쌈. ColorPicker는 버튼을 트리거로 써서 레이블과 연결 |
| 6.1.3 조작 가능 | 링크·버튼 높이 44px(`min-h-11`), 오류 요약 링크 24px 이상 |
| 6.4.1 반복 영역 건너뛰기 | 두 앱 모두 "본문 바로가기" |
| 7.1.1 기본 언어 | `lang="ko"`, 영문 이름에 `lang="en"` |
| 7.3.1 오류 정정 | 오류 요약(초점 이동, 칸으로 가는 링크), `aria-invalid`, `aria-describedby` |
| 7.3.4 반복 입력 | 주문서에 `autocomplete` |
| 6.2.2 정지 | `prefers-reduced-motion`에서 전환 효과를 끔 |

### 화면낭독기 구조

Playwright로 접근성 트리(화면낭독기가 읽는 구조)를 뽑아 확인했습니다. 랜드마크(banner, navigation, search, main, contentinfo), 페이지마다 h1 하나와 h2 영역, 모든 입력의 이름, 부조 그림의 설명이 맞게 읽힙니다.

VoiceOver로 직접 들어 보는 점검은 사람이 해야 합니다. 다음을 확인합니다.

- 첫 화면에서 Tab 한 번에 "본문 바로가기"가 읽히고, 누르면 본문으로 이동하는가
- 로터(VO+U)의 제목·랜드마크 목록만으로 화면 구조를 알 수 있는가
- 찾기 결과 수, 장바구니 담기 알림, 결제 예정 금액이 바뀔 때 읽히는가
- 주문서 오류 요약으로 초점이 옮겨지고, 링크를 누르면 해당 칸으로 가는가
- 어드민 표(상품·주문)의 머리글이 칸마다 함께 읽히는가
