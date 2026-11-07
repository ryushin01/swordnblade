# 개발 가이드

## 워크스페이스

| 패키지 | 역할 |
|---|---|
| `@snb/domain` | 타입(`Sword`, `Order`, `CustomsConfig`), 관세 계산 `estimateCustoms`, 소지허가 판단, 금액·길이 표시 형식 |
| `@snb/mocks` | 16점 시드 데이터, 메모리 DB(`createDb`), MSW 핸들러, 브라우저(`/browser`)·Node(`/node`) 진입점 |
| `@snb/sword-art` | 도검 부조 `SwordRelief`, 칼날 로고 `BladeMark` |
| `@snb/shop` | 쇼핑몰 (포트 3000) |
| `@snb/admin` | 어드민 (포트 3001) |

패키지는 빌드하지 않고 TypeScript 소스를 그대로 내보냅니다. 두 앱은 `next.config.ts`의 `transpilePackages`로 읽습니다.

## FSD 구조

두 앱 모두 Feature-Sliced Design v2.1을 따릅니다.

- Next.js 규칙에 맞춰 계층 이름을 `_app`, `_pages`로 씁니다. `src/app/`의 라우트 파일은 `_pages`와 `_app`을 다시 내보내기만 합니다.
- 슬라이스는 자기보다 아래 계층만, 공개 API(`index.ts`)로만 가져옵니다.
- 한 페이지에서만 쓰는 코드는 그 페이지 슬라이스에 둡니다. 두 곳 이상에서 쓰게 되면 `features`·`widgets`로 올립니다. (예: 배송 국가 선택은 상세와 장바구니에서 써서 `features/choose-destination`)
- `pnpm lint`가 Steiger로 규칙을 검사합니다. `_app`·`_pages` 이름 경고(`fsd/typo-in-layer-name`)만 끕니다.

## Mock API

- 브라우저: 첫 API 요청 전에 `startMockApi`가 MSW 워커를 켭니다(`shared/api/client.ts`). 데이터는 앱마다 다른 localStorage 키(`snb-shop-db-v1`, `snb-admin-db-v1`)에 저장되어 새로고침해도 남습니다. 저장소를 못 쓰는 환경에서는 메모리로만 동작합니다.
- 테스트: `NEXT_PUBLIC_API_MOCKING=off`로 브라우저 워커를 끄고 `createMockServer()`(MSW Node)를 씁니다.
- 쇼핑몰과 어드민은 다른 주소로 배포되므로 **한쪽에서 바꾼 데이터가 다른 쪽에 보이지 않습니다.** 두 앱은 같은 시드에서 시작합니다.
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
| 스토리 | 컴포넌트 옆 `*.stories.tsx` | `pnpm --filter @snb/shop storybook` |
| E2E | `apps/*/e2e` | `pnpm build` 후 `pnpm --filter @snb/shop e2e` |

E2E는 `next start`(프로덕션 빌드)를 띄워 데스크톱·모바일(Pixel 7) 두 화면에서 실행합니다. 쇼핑몰은 3101, 어드민은 3102 포트를 씁니다(`E2E_PORT`로 바꿀 수 있음). 매 페이지에서 axe(WCAG 2.2 AA 태그)를 돌리고, 쇼핑몰은 가로 넘침도 검사합니다.

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
