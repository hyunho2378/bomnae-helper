// 요금 재계산 · client/src/data/gts/vehicles.js(IA §9.3·PATTERNS §33)와 값·규칙 동일 유지 계약.
// 총액은 서버가 재계산한다 — 클라이언트 total 신뢰 금지(지시서 작업 3).
// 값 변경 시 클라 vehicles.js와 동시 수정할 것(둘 다 DRAFT 초안 · BM 검토 확정 대상).
const FARES = {
  taxi: { base: 30000, perPerson: 5000 },
  van: { base: 60000, perPerson: 5000 },
  luggageFee: 10000,
};

// IA §9.3 결정론 매칭(클라 matchVehicle과 동일)
function matchVehicle(party, luggage) {
  if (luggage) return party <= 2 ? 'taxi' : 'van';
  return party <= 4 ? 'taxi' : 'van';
}

// [V7] DEPRECATED — 시간제 이용권(computePassTotal)으로 대체 · 소비자 0(롤백 대비 보존).
function computeTotal(party, luggage) {
  const vehicleType = matchVehicle(party, luggage);
  const fare = FARES[vehicleType];
  const total = fare.base + (luggage ? FARES.luggageFee : 0) + fare.perPerson * party;
  return { vehicleType, total };
}

// [V7] 시간제 이용권 · 확정값 — 클라 data/gts/passes.js와 값·규칙 동일 유지 계약(동시 수정).
// [V13] 1시간권 제거 · 2h/4h/day 3종. 구 예약(pass_type='1h')은 저장된 pass_amount로 티켓 표시(재계산 안 함).
const PASS_PRICES = { '2h': 20000, '4h': 40000, day: 60000 };
const OVERTIME_PER_HOUR = 10000;
const PASS_LUGGAGE_FEE = 5000;

// 서버 재계산(클라 금액 신뢰 금지 유지) · passType 무효면 null 반환(400 근거)
function computePassTotal(passType, luggage) {
  if (!(passType in PASS_PRICES)) return null;
  const passAmount = PASS_PRICES[passType];
  const luggageAmount = luggage ? PASS_LUGGAGE_FEE : 0;
  return { passAmount, luggageAmount, totalAmount: passAmount + luggageAmount };
}

module.exports = { FARES, matchVehicle, computeTotal, PASS_PRICES, OVERTIME_PER_HOUR, PASS_LUGGAGE_FEE, computePassTotal };
