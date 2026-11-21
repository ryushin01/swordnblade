# AGENTS.md — Sword & Blade (swordNblade)

AI 코딩 에이전트(Codex, Claude Code 등)가 이 저장소에서 일할 때 지킬 규칙입니다. 자세한 내용은 `docs/`와 `README.md`에 있습니다.

## 1. 프로젝트 개요

- 석고 부조처럼 진열한 도검 쇼핑몰과 관리자 화면입니다. 배송 국가별 관세·부가세를 미리 계산합니다. 실제로 판매하지 않는 포트폴리오이며, 백엔드 없이 브라우저 Mock API(MSW)와 가상 데이터로 동작합니다.
- 화면 축: 쇼핑몰(`apps/shop`) · 어드민(`apps/admin`)
- 운영: 쇼핑몰 https://swordnblade-ryushin01.vercel.app/ (영어 `/en`) · 어드민 https://swordnblade-ryushin01.vercel.app/admin · Storybook `/storybook`, `/admin/storybook`. 로그인 없이 바로 볼 수 있고, 어드민은 로그인 화면에 공개한 데모 계정으로 들어갑니다.

## 2. 기술 스택과 구조

- pnpm 워크스페이스 + Turborepo. Next.js 16(App Router, multi-zones), React 19, TypeScript 6(6.0으로 고정, typescript-eslint가 7.0 미지원).
- 쇼핑몰: Tailwind CSS 4, shadcn/ui, SSGOI(화면 전환), next-intl(한국어 `/`, 영어 `/en`). 어드민: Ant Design 6(한국어만). 공통: TanStack Query 5, Zustand 5, MSW 3.

```
apps/shop       쇼핑몰 (포트 3000)
apps/admin      어드민 (포트 3001, basePath '/admin')
packages/domain     타입, 관세 계산 estimateCustoms, 표시 형식
packages/mocks      시드 데이터, Mock DB, MSW 핸들러
packages/sword-art  도검 부조 SVG 렌더러, 칼날 로고
```

- 패키지는 빌드하지 않고 TS 소스를 그대로 내보내며, 앱이 `transpilePackages`로 읽습니다.
- 두 앱 모두 **FSD v2.1**. 층 순서(위→아래): `_app` → `_pages` → `widgets` → `features` → `entities` → `shared`(Next.js 때문에 `_app`·`_pages` 이름 사용). `src/app/` 라우트 파일은 `_pages`·`_app`을 다시 내보내기만 합니다.
- 슬라이스는 아래 층만, 공개 API(`index.ts`)로만 가져옵니다. 한 페이지에서만 쓰는 코드는 그 페이지 슬라이스에, 두 곳 이상이면 `features`·`widgets`로 올립니다. `pnpm lint`가 Steiger로 검사합니다(`fsd/typo-in-layer-name`만 끔).
- 쇼핑몰과 어드민은 다른 앱이므로 서로 이동할 때 `next/link`가 아닌 일반 `<a>`를 씁니다. 쇼핑몰 안 이동은 `@/shared/i18n`의 `Link`·`useRouter`를 씁니다.
- 화면 코드는 `@snb/mocks` 묶음을 값으로 불러오지 않습니다(`import type` 또는 `@snb/mocks/admin-account` 같은 하위 경로). 도검 목록이 번들에 들어가면 크기 검사(490 kB)가 실패합니다.
- 도검을 더하면 시드 버전을 올리고 새 id를 `seed-bundle.ts`의 `ADDED_IN`에 등록합니다. 시드 도검이 바뀌면 공유 이미지(`apps/shop/public/og/swords/<slug>.jpg`)를 `apps/shop`에서 `node scripts/generate-og.mjs http://localhost:3101 --missing`으로 만듭니다(파일이 빠지면 단위 테스트 실패).
- 자세한 규칙: `docs/development.md`(Mock API, 서버 렌더링, SSGOI 패치, 품질 예산).

## 3. 설치·개발 명령

- Node.js 22 이상(`.nvmrc`), pnpm 12(`packageManager`).

```bash
corepack enable pnpm
pnpm install
pnpm dev   # 쇼핑몰 http://localhost:3000 · 어드민 http://localhost:3000/admin
```

- 환경 변수(이름만): `ADMIN_ORIGIN`(쇼핑몰이 `/admin`을 넘길 주소, 빌드 시), `NEXT_PUBLIC_SENTRY_DSN`(있을 때만 Sentry), `NEXT_PUBLIC_API_MOCKING`(테스트에서 `off`), `E2E_BASE_URL`, `E2E_PORT`, `NEXT_TELEMETRY_DISABLED`.
- pnpm 12는 허용하지 않은 빌드 스크립트가 있으면 설치가 실패합니다. 필요하면 `pnpm approve-builds <패키지>`로 `pnpm-workspace.yaml`의 `allowBuilds`에 넣습니다.

## 4. 검사·테스트 명령

| 명령 | 내용 |
|---|---|
| `pnpm lint` | ESLint(Next.js·jsx-a11y·import 정렬) + Steiger |
| `pnpm format:check` / `pnpm format` | Prettier 검사 / 정리 |
| `pnpm typecheck` | 타입 검사 |
| `pnpm test` / `pnpm test:coverage` | 단위·컴포넌트 테스트 / 커버리지 하한까지 |
| `pnpm test:storybook` | 모든 스토리를 Chromium에서 렌더링 + axe(위반 시 실패) |
| `pnpm build` | 두 앱 빌드(Storybook 포함) |
| `pnpm --filter @snb/shop size` | 번들 크기(JS 490 kB, CSS 12 kB) |
| `pnpm --filter @snb/shop e2e` / `pnpm --filter @snb/admin e2e` | 프로덕션 빌드 E2E(데스크톱·모바일, axe). 쇼핑몰 E2E는 `ADMIN_ORIGIN=http://localhost:3102 pnpm build` 후 |
| `pnpm --filter @snb/shop lhci` | Lighthouse 기준(빌드 후) |

- CI(`.github/workflows/ci.yml`, PR·main 푸시): 바뀐 파일 분류 → [Lint·Format·Typecheck·Test(`lint` → `format:check` → `typecheck` → `test:coverage`)] · [Storybook] · [Build·Size]를 동시에 → 빌드 결과물로 E2E(쇼핑몰) · E2E(어드민) · Lighthouse. Markdown만 바뀌면 Storybook·E2E·Lighthouse를 건너뜁니다.
- `live-check.yml`: main 푸시 뒤 Vercel 배포를 기다렸다가 운영 주소에 E2E를 돌립니다.
- husky pre-commit: lint-staged(ESLint·Prettier) → `pnpm typecheck` → `pnpm test`.
- **테스트 원칙: Testing Library.** 구현 세부가 아니라 사용자가 보는 동작을 검사하고, 요소는 역할·이름(`getByRole`)으로 찾습니다. 도구: 단위·컴포넌트는 Vitest + Testing Library(`renderWithProviders`), 화면 흐름은 Playwright E2E, 접근성은 axe(`@axe-core/playwright`로 E2E 매 페이지 WCAG 2.2 AA 태그, Storybook addon-a11y로 스토리마다).

## 5. 코드 스타일

- Prettier: 작은따옴표, 한 줄 120자. `*.md`는 표를 손으로 맞춰 Prettier에서 제외합니다.
- import 순서: react → next → 외부 → `@snb/` → `@/` → 상대 경로 → `import type` → CSS(자동 정렬).
- 버그를 고치면 고치기 전에 실패하는 테스트를 함께 넣습니다.
- 접근성(KWCAG 2.2): 네이티브 요소 우선(`<button type="button">`, `<a href>`), 텍스트 대비 4.5:1 이상(쇼핑몰 5.35:1, 어드민은 대비가 모자란 Ant Design 토큰을 진하게), 모든 기능 키보드, 초점 표시 유지(`outline: none` 단독 금지), 조작 크기 24px 이상(링크·버튼은 `min-h-11` 44px), 입력 레이블과 오류의 `aria-invalid`·`aria-describedby` 연결·오류 칸으로 초점, 바뀌는 안내는 `role="status"`, 항목 삭제 뒤 초점 이동(`useRemovalFocus`), `prefers-reduced-motion`이면 전환 끄기. 줄 그은 정가에는 숨긴 글자로 '정가'·'할인가'를 붙입니다.
- **타입: TypeScript strict.** `tsconfig.base.json`에서 `strict`와 `noUncheckedIndexedAccess`를 켭니다. `any`·`as` 단언·`@ts-ignore`는 피하고, 외부 입력(Mock API 요청 본문, 저장값, URL)은 서버·불러오기 쪽에서 모양을 검사합니다.
- **서식:** Prettier(`.prettierrc.json`)를 그대로 따릅니다(Biome 없음).
- **접근성 기준: WCAG 2.2·KWCAG 2.2.** 자동 검사는 eslint-plugin-jsx-a11y(recommended 전체를 켬)와 axe(Storybook·Playwright)입니다. axe 통과가 KWCAG 준수는 아니므로 `docs/development.md`의 '접근성 점검 (KWCAG 2.2)' 표를 함께 지킵니다.

## 6. Git·PR

- **흐름: GitHub Flow.** `main`에 직접 커밋·푸시하지 않습니다. 최신 `main`에서 브랜치를 만들어 PR로만 병합합니다. PR은 목적 하나로 작게, 본문에 무엇·왜·검사 결과(`## 요약`)를 적습니다.
- **브랜치 이름:** `feat/…`, `fix/…`, `refactor/…`, `docs/…`, `test/…`, `chore/…`, `release/…`. 이 저장소는 CI 변경에 `ci/…`도 썼습니다(예: `ci/split-jobs`).
- **커밋 메시지: Conventional Commits.** `<타입>: <한국어 요약>`, 타입은 `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `style`, `chore`, `ci`, `build`. 호환이 깨지면 본문에 `BREAKING CHANGE:`. 실제 예: `feat: 미뤘던 「가공의 도검」 5점과 열쇠 이빨 렌더러 1.10.0`, `ci: 검사를 작업 여러 개로 나눠 동시에 돌리기 1.11.1`.
  - 표준과 다른 점: 이 저장소는 버전을 괄호 없이 제목 끝에 붙입니다(`… 1.11.1`, 표준은 `(1.11.1)`). 기존 관례를 따릅니다.
- **기여자는 ryushin01만 남깁니다(2026-11-21 사용자 결정).** 커밋 작성자는 늘 `ryushin0 <141554987+ryushin01@users.noreply.github.com>`입니다. 이 저장소는 백엔드 코드가 없으므로 `Co-Authored-By` 줄을 넣지 않습니다(백엔드 저장소만 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). PR 본문 끝에는 `🤖 Generated with [Claude Code](https://claude.com/claude-code)`를 적습니다.
  - GitHub Actions가 커밋하는 워크플로는 작성자를 ryushin01로 설정합니다(`github-actions[bot]` 금지)(지금은 커밋하는 워크플로 없음).
  - Dependabot PR은 그대로 병합하지 않고, 같은 변경을 ryushin01 커밋으로 다시 만들어 PR로 병합합니다.
- **버전: Semantic Versioning.** 호환이 깨지면 주, 기능 추가는 부, 버그 수정·작은 개선은 수. 버전을 맞추는 곳은 두 앱의 `package.json`(`apps/shop`, `apps/admin`의 `version`), `CHANGELOG.md`, README 버전 배지(`version-x.y.z`)입니다. 루트에는 `version`이 없고, `packages/*`는 0.1.0 그대로 둡니다. 문서만 바뀐 PR은 보통 버전을 올리지 않습니다.
- **변경 기록: Keep a Changelog.** `CHANGELOG.md`에 최신 버전을 위에 `## x.y.z - YYYY-MM-DD`로 적습니다. 표준과 다른 점: 추가·변경·수정·제거 소제목 대신 요약 한 문단과 `영역: 내용` 목록으로 적고, `[Unreleased]` 절은 쓰지 않습니다(PR마다 바로 버전을 붙임).
- 병합은 squash(제목 끝 `(#번호)`). **CI가 통과하면 바로 병합**하고 CodeRabbit 리뷰는 기다리지 않습니다(이미 달린 맞는 지적은 반영). 원격 브랜치 삭제는 저장소 설정에 맡깁니다.
- 공개 저장소라 Actions가 돕니다. Actions가 막히면 CI와 같은 검사를 로컬에서 돌려 대신합니다.

## 7. 배포·릴리스

- Vercel 프로젝트: `swordnblade`(Root `apps/shop`), `swordnblade-admin`(Root `apps/admin`). **main만 배포**하고 PR 미리보기는 끔(`vercel.json`의 `git.deploymentEnabled`). 쇼핑몰이 `/admin`을 어드민 앱으로 넘깁니다(multi-zones).
- `scripts/vercel-ignore.sh`(Ignored Build Step): 직전 배포 이후 문서·테스트·스토리·`.github`만 바뀌면 빌드를 건너뜁니다. Vercel Hobby는 계정 전체 하루 100회 한도라 푸시를 모읍니다.
- 데모 모드: 별도 플래그 없이 항상 브라우저 Mock API(localStorage `snb-db-v1`)로 동작합니다. 비밀값이 없습니다.
- 릴리스: 병합 뒤 태그 `vX.Y.Z`, 제목 `vX.Y.Z`, 대상은 병합 커밋 전체 SHA, 본문은 CHANGELOG의 해당 절. 그 뒤 백업 `bash ~/Documents/Archive/Backup/backup.sh`.
- 배포 뒤 운영·어드민·Storybook 주소가 200인지, `/version.txt`가 병합 커밋인지 확인합니다.
- 보관함 계획 문서(`~/Documents/Obsidian Vault/`): `swordnblade v1.0.0 고도화 계획.md`, `swordnblade 가공의 도검 목록.md`, `swordnblade 가공의 도검 전체 수록 계획.md`, `swordnblade 도검 자료 확장 계획.md`. 진행 기록을 날짜와 함께 남깁니다.
- 소개가 크게 바뀌면 프로필 저장소 `ryushin01/ryushin01` README 프로젝트 표(내용·기술·실행 칸)를 고칩니다. 버전 숫자는 Actions가 자동으로 고칩니다.

## 8. 보안·주의사항

- 비밀값·`.env`를 커밋하지 않습니다. 공개 데모에 실제 DB·유료 API 키를 넣지 않습니다.
- Mock 인증(회원 SHA-256 해시, 어드민 데모 토큰)은 브라우저 안에만 있어 실제 보안이 아닙니다. 주문 금액은 Mock 서버가 다시 계산하고, 주문 확인은 주문 키·회원·어드민만 엽니다. 이 보호를 약하게 만들지 않습니다.
- 보안 헤더(CSP `frame-ancestors 'self'` 등, `next.config.ts`)를 유지합니다. E2E가 운영에서도 확인합니다.
- Sentry에는 오류 내용만 보내고 사용자 정보·쿠키·쿼리·브레드크럼은 모으지 않습니다.
- 도검 일러스트는 이미지 파일 없이 코드(SVG)로 그립니다. 게임·작품 속 검은 원작 이름 그대로 본뜬 비공식 팬 재현품으로 적고, 생김새는 문서 그림을 보고 맞춥니다.
- 글꼴은 SIL OFL 1.1 판만 씁니다. KoPub바탕은 예약 이름 때문에 줄인 파일을 SnbBatang으로 부릅니다. 새 자료를 넣으면 README 출처 표에 저작자·라이선스·원본을 적습니다.
- `patches/@ssgoi__core@7.5.0.patch`: SSGOI를 올릴 때는 업스트림이 고쳤는지 보고 패치를 지우거나 `pnpm patch @ssgoi/core`로 다시 만듭니다.
- Dependabot: TypeScript 6.1 이상, `@types/node` 23 이상은 받지 않습니다.

## 9. 공통 규칙

공통 규칙은 `~/Documents/GitHub/CLAUDE.md`에 있습니다(이 파일과 충돌하면 이 파일이 우선). 핵심:

- 답변·커밋·PR·문서·코드 주석은 한국어로 씁니다.
- 묻지 않고 끝까지 진행하고 결과를 한 번에 보고합니다. 비용이 드는 일, 새 비밀값, 디자인 결정, 되돌릴 수 없는 공개 행동은 하지 않고 보고합니다.
- 사용자의 진행 중인 작업(커밋하지 않은 변경, 원격에 없는 브랜치)을 건드리지 말고 `git worktree add /tmp/<이름> -b <브랜치> origin/main`에서 작업한 뒤 worktree를 지웁니다.
- 다른 세션에 공지할 때는 Paseo ryushin01 그룹 세션에만 보냅니다.
