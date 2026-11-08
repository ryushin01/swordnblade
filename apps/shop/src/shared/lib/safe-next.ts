/**
 * 로그인 뒤 돌아갈 주소. 다른 사이트로 빠져나가지 않도록 '/'로 시작하는 내부 경로만 받습니다
 * ('//evil.com' 같은 프로토콜 상대 주소와 '/\\' 우회도 막습니다).
 */
export function safeNextPath(value: string | null | undefined, fallback = '/account'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
