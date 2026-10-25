/** 이메일 형식(간단 검사). 로그인·회원가입 공용 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value: string) => EMAIL_RE.test(value.trim());
