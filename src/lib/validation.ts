/** 이메일 형식(간단 검사). 로그인·회원가입 공용 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isEmail = (value: string) => EMAIL_RE.test(value.trim());

/** 휴대폰 번호(010/011/016~019). 하이픈·공백은 있어도 없어도 된다 */
const MOBILE_RE = /^01[016-9]\d{7,8}$/;

/** 숫자만 남긴다. 회원가입은 숫자만 서버로 보낸다(예: 01012345678) */
export const digitsOnly = (value: string) => value.replace(/\D/g, '');

export const isMobilePhone = (value: string) => MOBILE_RE.test(digitsOnly(value));

/** 화면 표시용 하이픈 형식(010-1234-5678). 휴대폰 번호 형식이 아니면 받은 값 그대로 */
export function formatMobilePhone(value: string): string {
  if (!isMobilePhone(value)) return value;
  const d = digitsOnly(value);
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
