/**
 * 로그인 뒤 돌아갈 주소. 다른 사이트로 빠져나가지 않도록 '/'로 시작하는 내부 경로만 받습니다
 * ('//evil.com' 같은 프로토콜 상대 주소와 '/\\' 우회도 막습니다).
 */
export function safeNextPath(value: string | null | undefined, fallback = '/account'): string {
  if (!value || !value.startsWith('/')) return fallback;
  // 브라우저는 주소의 탭과 줄바꿈을 지우고 해석하므로, 지운 모양으로 검사합니다('/\t/evil.com' 우회 방지).
  const normalized = value.replace(/[\t\n\r]/g, '');
  if (normalized.startsWith('//') || normalized.startsWith('/\\')) return fallback;
  return value;
}
