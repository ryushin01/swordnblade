# 버전 기록

## 0.2.0 - 2026-11-07

- 어드민을 쇼핑몰 주소의 `/admin`에 붙임(Next.js multi-zones). 두 앱이 같은 MSW 워커와 저장 키를 써서, 어드민에서 바꾼 내용이 쇼핑몰에, 쇼핑몰 주문이 어드민에 보임
- 코드 스타일: ESLint(Next.js 규칙, import 정렬), Prettier, husky + lint-staged. typescript-eslint 지원 범위에 맞춰 TypeScript 6.0으로 고정
- 스토리 테스트: 모든 스토리를 실제 브라우저에서 렌더링하고 axe로 검사
- Storybook 배포: `/storybook`, `/admin/storybook`
- 배포 후 검사(live-check), Dependabot, 배포 커밋을 알려 주는 `/version.txt`, 어드민 404 화면
- 고침: 장바구니 복원 훅을 `useSyncExternalStore`로 바꿈, 저장 성공 메시지를 목록 새로 받기보다 먼저 보여 줌

## 0.1.1 - 2026-11-07

- 배포: Vercel에 쇼핑몰(https://swordnblade.vercel.app/)과 어드민(https://swordnblade-admin.vercel.app/)을 Git 연동으로 배포. 쓰지 않게 된 Netlify 설정 파일 삭제
- CI: pnpm 12에서 설치가 실패하던 문제 수정(`esbuild` 빌드 스크립트 허용)
- E2E: `E2E_BASE_URL`로 배포된 사이트를 검사하는 기능 추가

## 0.1.0 - 2026-11-07

처음 공개한 버전입니다.

- 모노레포: pnpm 워크스페이스와 Turborepo로 쇼핑몰·어드민 두 앱과 도메인·Mock·일러스트 패키지를 구성
- 쇼핑몰: 도검의 벽(16점), 분류 필터, 상세(제원·허가 안내·관세 예상·전승 타임라인), 장바구니, 주문서, 주문 확인
- 석고 부조 SVG 렌더러와 칼날 로고
- 관세 계산: 출고지별 배송, 해외 → 한국과 한국 → 해외, CIF·FOB, 면세 한도
- 어드민(Ant Design): 대시보드, 상품 CRUD와 일러스트 미리보기, 주문 상태 변경, 관세·환율 설정
- 품질: Vitest 단위·컴포넌트 테스트, Playwright + axe E2E(프로덕션 빌드), Storybook, Steiger FSD 검사, GitHub Actions
