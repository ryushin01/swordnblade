/**
 * 배포된 커밋을 알려 줍니다. 배포 후 검사(live-check.yml)가 방금 올린 커밋이 배포되었는지 확인하는 데 씁니다.
 * Vercel이 빌드할 때 넣어 주는 값이라 로컬에서는 'local'입니다.
 */
export function GET() {
  return new Response(process.env.VERCEL_GIT_COMMIT_SHA ?? 'local', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
