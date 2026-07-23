// ============================================================
// passes.js · [V7] 시간제 이용권 — 새 요금 체계의 단일 기준(확정값).
// 기존 vehicles.js fares(기본요금+인당) 계산은 DEPRECATED(롤백 대비 보존 · 미사용).
// 서버 재계산과 값·규칙 동일 유지 계약: server/services/fares.js PASS 블록과 동시 수정할 것.
// ============================================================

export const PASS_PRICES = { '1h': 10000, '2h': 20000, '4h': 40000, day: 60000 };
export const PASS_ORDER = ['1h', '2h', '4h', 'day'];
export const OVERTIME_PER_HOUR = 10000;
export const LUGGAGE_FEE = 5000;

// 이용권 + 짐 보관 합계 · 이용권 미선택(null)이면 null(금액 근거 없음 — Pay 비활성 근거)
export function computePassTotal(passType, luggage) {
  if (!passType || !(passType in PASS_PRICES)) return null;
  return PASS_PRICES[passType] + (luggage ? LUGGAGE_FEE : 0);
}

export default PASS_PRICES;
