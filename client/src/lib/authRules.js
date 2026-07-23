// [V10] 인증 검증 규칙 단일 출처(클라) · 서버 auth.js 의 EMAIL_RE·PASSWORD_RE 와 동일하게 유지.
//   비밀번호: 6자 이상 + 숫자 1개 이상 + 특수기호(비영숫자) 1개 이상.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PW_RULES = [
  { key: 'pwRuleLen', test: (v) => v.length >= 6 },
  { key: 'pwRuleDigit', test: (v) => /\d/.test(v) },
  { key: 'pwRuleSpecial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export const pwValid = (v) => PW_RULES.every((r) => r.test(v));
