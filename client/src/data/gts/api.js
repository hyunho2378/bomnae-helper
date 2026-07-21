// ============================================================
// api.js · GTS 목 데이터 창구 (PATTERNS §33 · 존 C4 신설)
// 기존 src/data/api.js 수정 금지 원칙에 따라 GTS 전용 별도 창구.
// 스타일은 src/data/api.js 모방: 전부 async(PHASE 3 fetch 교체 시 페이지 diff 0),
// in-memory 저장소 · 웹스토리지 금지(DESIGN §15).
// ============================================================
import { fares } from './vehicles';

const gtsBookings = new Map();

// 6자 코드 · 혼동 문자(I/L/O/0/1) 제외 — src/data/api.js와 동일 규칙
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

// §33 합계 산식: base[vehicleType] + (luggage ? luggageFee : 0) + perPerson × party
// 값은 전부 vehicles.js DRAFT 초안(화면에는 DRAFT 고지 동반 표기)
export function computeGtsTotal(vehicleType, luggage, party) {
  const fare = fares[vehicleType];
  return fare.base + (luggage ? fares.luggageFee : 0) + fare.perPerson * party;
}

// payload: {party, luggage, vehicleType, mealPlan, meals, picks, itinerary(순서 보존 · §9.6), dropoffText, total}
export async function createGtsBooking(payload) {
  const code = makeCode();
  const booking = { id: code, code, kind: 'gts', status: 'confirmed', ...payload };
  gtsBookings.set(code, booking);
  return booking;
}

export async function getGtsBooking(id) {
  return gtsBookings.get(id) ?? null;
}
