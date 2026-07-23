// ============================================================
// api.js · GTS 데이터 창구 (PATTERNS §33 → [G1] 서버 연동 v1)
// 내부만 fetch로 교체 — 호출 시그니처·반환 모양 불변(GTS 페이지 diff 0 계약).
// 서버 실패(네트워크·5xx) 시 기존 in-memory 목으로 폴백(데모 오프라인 보장 · 명세 5-①).
// 총액은 서버가 재계산해 내려준다(클라 계산값은 표시용 · 신뢰 금지 — 서버 services/fares.js).
// ============================================================
import { TRAVEL_LOG_SEEDS } from './travelLogSeeds';
import { fares } from './vehicles';

// VITE_API_BASE 미설정 시 로컬 서버(개발 기본) — client/.env.example 참조
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const gtsBookings = new Map();

// 6자 코드 · 혼동 문자(I/L/O/0/1) 제외 — src/data/api.js와 동일 규칙(폴백 전용)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

// [V7] DEPRECATED — 시간제 이용권(passes.js computePassTotal)으로 대체 · 소비자 0(롤백 대비 보존).
// 구 §33 합계 산식: base[vehicleType] + (luggage ? luggageFee : 0) + perPerson × party
export function computeGtsTotal(vehicleType, luggage, party) {
  const fare = fares[vehicleType];
  return fare.base + (luggage ? fares.luggageFee : 0) + fare.perPerson * party;
}

// payload: {party, luggage, vehicleType, mealPlan, meals, picks, itinerary(순서 보존 · §9.6),
//           dropoffText, payMethod(§42 결제 수단 문자열 · 존 C5 확장), total}
export async function createGtsBooking(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/gts/bookings`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const booking = await res.json();
    gtsBookings.set(booking.code, booking); // 세션 재조회 캐시
    return booking;
  } catch {
    // 폴백: 서버 부재 시 기존 세션 메모리 동작 유지
    const code = makeCode();
    const booking = { id: code, code, kind: 'gts', status: 'confirmed', ...payload };
    gtsBookings.set(code, booking);
    return booking;
  }
}

// [V3] Travel Log 발자취 조회 — 서버 집계(실 로그 + 시드) · 실패 시 클라 시드 미러 폴백(오프라인 데모)
export async function getTravelLogs() {
  try {
    const res = await fetch(`${API_BASE}/api/travel-logs`, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.logs) && data.logs.length ? data.logs : TRAVEL_LOG_SEEDS;
  } catch {
    return TRAVEL_LOG_SEEDS;
  }
}

// [V10] 내 예약 목록 · 로그인 세션 기준(서버가 user_id로 필터) · 최신순 · 취소 포함(status·cancellable 동반).
//   서버 부재·비로그인(401) 시 빈 배열(프로필은 "예약 없음" 표시).
export async function getMyBookings() {
  try {
    const res = await fetch(`${API_BASE}/api/gts/bookings`, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.bookings) ? data.bookings : [];
  } catch {
    return [];
  }
}

// [V10] 예약 취소(소프트) · {ok, error?} 반환. too_late = 48시간 규칙 위반, forbidden = 소유 아님.
export async function cancelGtsBooking(code) {
  try {
    const res = await fetch(`${API_BASE}/api/gts/bookings/${String(code).toUpperCase()}/cancel`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || 'cancel_failed' };
    return { ok: true, status: data.status };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export async function getGtsBooking(id) {
  const key = String(id).toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/api/gts/bookings/${key}`, { credentials: 'include' });
    if (res.status === 404) return gtsBookings.get(key) ?? null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return gtsBookings.get(key) ?? null;
  }
}
