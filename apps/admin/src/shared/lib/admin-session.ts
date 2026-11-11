const KEY = 'snb-admin-session-v1';
const listeners = new Set<() => void>();

/** 어드민 데모 로그인 토큰. 서버 렌더에서는 알 수 없어 undefined입니다. */
export function getAdminToken(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(KEY, token);
    else window.localStorage.removeItem(KEY);
  } catch {
    // 저장소를 못 쓰면 로그인을 유지할 수 없습니다.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeAdminToken(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
