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

function computeTotal(party, luggage) {
  const vehicleType = matchVehicle(party, luggage);
  const fare = FARES[vehicleType];
  const total = fare.base + (luggage ? FARES.luggageFee : 0) + fare.perPerson * party;
  return { vehicleType, total };
}

module.exports = { FARES, matchVehicle, computeTotal };
