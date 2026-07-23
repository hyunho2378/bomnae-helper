// ============================================================
// vehicles.js · GTS 차량 매칭 규칙 + 요금표 (IA §9.3 · PATTERNS §33)
// 매칭은 결정론 규칙 함수 하나. 상태 저장 금지 — GtsContext가 셀렉터로 파생(§31).
// 요금 숫자는 전부 DRAFT 초안값 — 5일차 BM 검토에서 확정 전까지 어떤 화면에도
// 확정가처럼 단정 표기 금지(DRAFT 고지 유지).
// ============================================================

// IA §9.3 결정론 규칙:
//   짐 보관 필요:   인원 ≤2 → 'taxi' / ≥3 → 'van'(짐 싣고 함께 이동)
//   짐 보관 불필요: 인원 ≤4 → 'taxi' / ≥5 → 'van'
// party: 1~12 정수(Stepper 클램프), luggage: boolean
export function matchVehicle(party, luggage) {
  if (luggage) return party <= 2 ? 'taxi' : 'van';
  return party <= 4 ? 'taxi' : 'van';
}

// 요금표 · 합계 산식은 §33: base[vehicleType] + (luggage ? luggageFee : 0) + perPerson * party
// [V7] DEPRECATED — 요금은 시간제 이용권(passes.js)이 단일 기준 · fares는 롤백 대비 보존(소비자: FareBreakdown[미사용]뿐).
export const fares = {
  taxi: {
    base: 30000, // DRAFT — 초안 가격, BM 검토에서 확정
    perPerson: 5000, // DRAFT — 초안 가격, BM 검토에서 확정
  },
  van: {
    base: 60000, // DRAFT — 초안 가격, BM 검토에서 확정
    perPerson: 5000, // DRAFT — 초안 가격, BM 검토에서 확정
  },
  luggageFee: 10000, // DRAFT — 짐 보관 추가요금 초안, BM 검토에서 확정
};
