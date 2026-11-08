/** 비밀번호 규칙: 8자 이상, 영문과 숫자를 함께. 쇼핑몰 폼과 Mock 서버가 같은 규칙을 씁니다. */
export const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidPassword = (password: string): boolean => PASSWORD_RULE.test(password);
export const isValidEmail = (email: string): boolean => EMAIL_RULE.test(email.trim());
