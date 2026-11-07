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

## Netlify

앱마다 사이트를 하나씩 만듭니다. 각 앱 폴더의 `netlify.toml`이 빌드 명령을 정합니다.

| 사이트 | Base directory | 설정 파일 |
|---|---|---|
| 쇼핑몰 | `apps/shop` | `apps/shop/netlify.toml` |
| 어드민 | `apps/admin` | `apps/admin/netlify.toml` |

- 빌드는 저장소 루트에서 의존성을 설치한 뒤 Turborepo로 해당 앱만 빌드합니다.
- Next.js 런타임은 Netlify가 자동으로 붙입니다.
- 환경 변수는 필요 없습니다. Mock API가 브라우저에서 동작합니다.
- 어드민은 `robots: noindex`로 검색 노출을 막습니다.
