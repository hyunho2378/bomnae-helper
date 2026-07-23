// 결제 수단 8종 · PATTERNS §42 파일 계약 (존 C5 신설).
// 파일명 8개 고정(client/public/pay/ · 사용자 배치): applepay·alipay·visa·mastercard·paypal·
//   amex·jcb·unionpay .svg — 파일 부재 시 텍스트 라벨 폴백(onError · 깨진 이미지 0).
// label은 결제 브랜드 고유명사(번역 대상 아님 · 3언어 동일 표기) — i18n 하드코딩 계약의 예외.
// wallet: Apple Pay·Alipay만 true — 카드 폼 생략 + 월렛 시뮬레이션 카피 1줄 + 바로 Pay(§42).
export const PAY_METHODS = [
  { id: 'applepay', label: 'Apple Pay', file: '/images/pay/applepay.svg', wallet: true },
  { id: 'alipay', label: 'Alipay', file: '/images/pay/alipay.svg', wallet: true },
  { id: 'visa', label: 'Visa', file: '/images/pay/visa.svg', wallet: false },
  { id: 'mastercard', label: 'Mastercard', file: '/images/pay/mastercard.svg', wallet: false },
  { id: 'paypal', label: 'PayPal', file: '/images/pay/paypal.svg', wallet: false },
  { id: 'amex', label: 'American Express', file: '/images/pay/amex.svg', wallet: false },
  { id: 'jcb', label: 'JCB', file: '/images/pay/jcb.svg', wallet: false },
  { id: 'unionpay', label: 'UnionPay', file: '/images/pay/unionpay.svg', wallet: false },
];

// 저장된 결제 수단 문자열(id) → 표기 라벨(티켓 §43 결제 수단 행)
export const payMethodLabel = (id) => PAY_METHODS.find((m) => m.id === id)?.label ?? null;
