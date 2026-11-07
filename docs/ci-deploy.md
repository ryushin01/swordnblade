# CI · 배포

## GitHub Actions (`.github/workflows/ci.yml`)

`main` 푸시와 PR마다 실행합니다.

1. `pnpm install --frozen-lockfile`
2. `pnpm lint` (Steiger FSD 규칙)
3. `pnpm typecheck`
4. `pnpm test`
5. `pnpm build` (두 앱)
6. 두 앱 Storybook 빌드
7. Chromium 설치 후 두 앱 E2E (프로덕션 빌드, 데스크톱·모바일, axe)

실패하면 Playwright 보고서와 기록을 7일간 내려받을 수 있습니다.

pnpm 12는 허용하지 않은 의존성의 빌드 스크립트가 있으면 CI 설치를 실패로 끝냅니다. 빌드 스크립트가 필요한 의존성(지금은 `esbuild`)은 `pnpm approve-builds <패키지>`로 `pnpm-workspace.yaml`의 `allowBuilds`에 넣습니다.

## Vercel

앱마다 Vercel 프로젝트를 하나씩 두고 GitHub 저장소와 연결했습니다. `main`에 푸시하면 두 앱이 프로덕션으로 배포되고, PR에는 미리보기 배포가 붙습니다.

| 앱 | 프로젝트 | Root Directory | 주소 |
|---|---|---|---|
| 쇼핑몰 | `swordnblade` | `apps/shop` | https://swordnblade.vercel.app/ |
| 어드민 | `swordnblade-admin` | `apps/admin` | https://swordnblade-admin.vercel.app/ |

- Framework는 Next.js, Node.js는 22.x입니다. 설치·빌드 명령은 기본값을 씁니다. Vercel이 루트의 `packageManager`(pnpm 12)와 워크스페이스를 알아서 처리합니다.
- 환경 변수는 `NEXT_TELEMETRY_DISABLED=1` 하나뿐입니다. Mock API가 브라우저에서 동작하므로 비밀 값이 없습니다.
- 어드민은 `robots: noindex`로 검색 노출을 막습니다.

## 배포 후 검사

배포된 사이트에도 같은 E2E를 돌릴 수 있습니다. 로컬 서버를 띄우지 않고 주소만 바꿔 검사합니다.

```bash
E2E_BASE_URL=https://swordnblade.vercel.app pnpm --filter @snb/shop e2e
E2E_BASE_URL=https://swordnblade-admin.vercel.app pnpm --filter @snb/admin e2e
```
