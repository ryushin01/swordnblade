# CI · 배포

## GitHub Actions (`.github/workflows/ci.yml`)

`main` 푸시와 PR마다 실행합니다.

1. `pnpm install --frozen-lockfile`
2. `pnpm lint` (ESLint + Steiger FSD 규칙), `pnpm format:check`
3. `pnpm typecheck`
4. `pnpm test`
5. Chromium 설치 후 `pnpm test:storybook` (모든 스토리 렌더링 + axe)
6. `pnpm build` (두 앱, Storybook 포함)
7. 두 앱 E2E (프로덕션 빌드, 데스크톱·모바일, axe, 두 앱 데이터 공유)

CI는 `ADMIN_ORIGIN=http://localhost:3102`로 빌드해, 쇼핑몰의 `/admin`이 로컬 어드민 서버로 넘어가게 합니다.

실패하면 Playwright 보고서와 기록을 7일간 내려받을 수 있습니다.

pnpm 12는 허용하지 않은 의존성의 빌드 스크립트가 있으면 CI 설치를 실패로 끝냅니다. 빌드 스크립트가 필요한 의존성(지금은 `esbuild`)은 `pnpm approve-builds <패키지>`로 `pnpm-workspace.yaml`의 `allowBuilds`에 넣습니다.

## Vercel

앱마다 Vercel 프로젝트를 하나씩 두고 GitHub 저장소와 연결했습니다. `main`에 푸시하면 두 앱이 프로덕션으로 배포되고, PR에는 미리보기 배포가 붙습니다.

| 앱 | 프로젝트 | Root Directory | 주소 |
|---|---|---|---|
| 쇼핑몰 | `swordnblade` | `apps/shop` | https://swordnblade.vercel.app/ |
| 어드민 | `swordnblade-admin` | `apps/admin` | https://swordnblade.vercel.app/admin |

- 어드민은 쇼핑몰 주소의 `/admin`으로 엽니다. 쇼핑몰이 `/admin` 요청을 `swordnblade-admin.vercel.app/admin`으로 넘깁니다(multi-zones). 어드민 단독 주소(`swordnblade-admin.vercel.app`)도 열리지만, 출처가 달라 쇼핑몰과 데이터를 공유하지 않습니다.
- 쇼핑몰의 미리보기 배포도 `/admin`을 프로덕션 어드민으로 넘깁니다.
- Storybook은 앱 빌드에 포함되어 `/storybook`(쇼핑몰)과 `/admin/storybook`(어드민)에서 열립니다. 폴더 주소는 `index.html`로 보냅니다(상대 경로 파일 때문).

- Framework는 Next.js, Node.js는 22.x입니다. 설치·빌드 명령은 기본값을 씁니다. Vercel이 루트의 `packageManager`(pnpm 12)와 워크스페이스를 알아서 처리합니다.
- 환경 변수는 `NEXT_TELEMETRY_DISABLED=1` 하나뿐입니다. Mock API가 브라우저에서 동작하므로 비밀 값이 없습니다.
- 어드민은 `robots: noindex`로 검색 노출을 막습니다.

## 배포 후 검사 (`.github/workflows/live-check.yml`)

`main`에 푸시하면 Vercel 배포가 끝나기를 기다렸다가 실제 사이트에 같은 E2E를 돌립니다.

1. 두 앱의 `/version.txt`(빌드한 커밋, `VERCEL_GIT_COMMIT_SHA`)가 이번 커밋과 같아질 때까지 최대 10분 기다립니다.
2. `E2E_BASE_URL=https://swordnblade.vercel.app`으로 쇼핑몰·어드민 E2E를 실행합니다.

손으로 돌릴 때는 Actions에서 **Run workflow**를 누르거나 다음을 실행합니다.

```bash
E2E_BASE_URL=https://swordnblade.vercel.app pnpm --filter @snb/shop e2e
E2E_BASE_URL=https://swordnblade.vercel.app pnpm --filter @snb/admin e2e
```

## Dependabot (`.github/dependabot.yml`)

- npm: 매주 월요일, 같은 메이저 안의 패치·마이너만, 출시 후 14일이 지난 버전만 제안합니다. 운영·개발 의존성을 나눠 PR 하나씩 엽니다.
- TypeScript는 6.1 이상, `@types/node`는 23 이상을 제안하지 않습니다.
- GitHub Actions: 매월, 메이저 제외.
