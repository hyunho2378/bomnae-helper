// GTS 예약 API · IA §9.6 데이터 모델 · 총액은 서버 재계산(클라 total 신뢰 금지 — 지시 작업 3).
const express = require('express');
const pool = require('../db/pool');
const { matchVehicle, computePassTotal } = require('../services/fares'); // [V7] 이용권 재계산(computeTotal DEPRECATED)
const { resolveUserId } = require('./auth');
const { readUserId } = require('../lib/session'); // [V10] 내 예약 조회·취소 소유권 판정

const router = express.Router();

// [V10] 여행일 기준 48시간 전이면 취소 가능 · travel_date(YYYY-MM-DD)를 KST 자정 시작 시각으로 해석.
//   날짜 미지정 예약은 시점 제약을 증명할 수 없어 취소 허용(사용자 보수적).
function cancellable(travelDateStr) {
  if (!travelDateStr) return true;
  const start = new Date(`${travelDateStr}T00:00:00+09:00`).getTime();
  return start - Date.now() > 48 * 60 * 60 * 1000;
}

// [V5-frictionless] 회귀 방지 플래그(기본 false = 무마찰) · 운영 전환 시 env로 재필수화.
//   REQUIRE_DROPOFF=true → 하차 지점 미입력 400 / REQUIRE_PAYMETHOD=true → 결제 수단 미선택 400.
const REQUIRE_DROPOFF = process.env.REQUIRE_DROPOFF === 'true';
const REQUIRE_PAYMETHOD = process.env.REQUIRE_PAYMETHOD === 'true';

// 6자 코드 · 클라 data/gts/api.js와 동일 규칙(혼동 문자 제외)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

router.post('/gts/bookings', async (req, res) => {
  try {
    const { party, luggage, mealPlan, itinerary, dropoffText, payMethod, travelDate, passType, consent } = req.body ?? {};
    const p = Number(party);
    if (!Number.isInteger(p) || p < 1 || p > 12) return res.status(400).json({ error: 'party 1~12' });
    if (!['none', 'lunch', 'lunchDinner'].includes(mealPlan)) return res.status(400).json({ error: 'mealPlan' });
    if (!Array.isArray(itinerary) || !itinerary.length) return res.status(400).json({ error: 'itinerary' });
    // [V5-frictionless] 하차 지점 · 미입력이면 null 저장(빈 문자열 아님) · REQUIRE_DROPOFF 시에만 필수
    const dropoff = typeof dropoffText === 'string' && dropoffText.trim() ? dropoffText.trim() : null;
    if (REQUIRE_DROPOFF && !dropoff) return res.status(400).json({ error: 'dropoffText 필수' });
    // [V5-frictionless] 결제 수단 · 미선택이면 null · REQUIRE_PAYMETHOD 시에만 필수
    const payMethodValue = typeof payMethod === 'string' && payMethod ? payMethod : null;
    if (REQUIRE_PAYMETHOD && !payMethodValue) return res.status(400).json({ error: 'payMethod 필수' });
    // [V3] 여행 날짜 · 선택값(YYYY-MM-DD) — 형식만 검증(당일 허용 · 과거 차단은 클라 캘린더 소유)
    const tDate = typeof travelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(travelDate) ? travelDate : null;
    const lug = Boolean(luggage);
    // [V7] 시간제 이용권 = 금액의 단일 근거 · 서버 재계산(클라 금액 신뢰 금지 유지).
    //   이용권·환불 동의는 무마찰 예외 아님(필수) — 미선택/미동의 400.
    const pass = computePassTotal(passType, lug);
    if (!pass) return res.status(400).json({ error: 'passType 필수(1h|2h|4h|day)' });
    if (consent !== true) return res.status(400).json({ error: 'consent 필수' });
    const { passAmount, luggageAmount, totalAmount } = pass;
    const vehicleType = matchVehicle(p, lug); // §9.3 차량 매칭은 유지(표시용)
    const userId = await resolveUserId(req);
    // 코드 충돌 시 재시도 3회
    for (let i = 0; i < 3; i += 1) {
      const code = makeCode();
      try {
        const { rows } = await pool.query(
          `INSERT INTO gts_bookings (code, user_id, party, luggage, vehicle_type, meal_plan, picks, dropoff_text, pay_method, total, travel_date,
                                     pass_type, pass_amount, luggage_amount, total_amount, consent_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,now()) RETURNING code, created_at`,
          [code, userId, p, lug, vehicleType, mealPlan, JSON.stringify(itinerary), dropoff, payMethodValue, totalAmount, tDate,
           passType, passAmount, luggageAmount, totalAmount],
        );
        return res.status(201).json(toBooking({
          ...req.body, code: rows[0].code, vehicleType, party: p, luggage: lug,
          dropoffText: dropoff, payMethod: payMethodValue, travelDate: tDate,
          passType, passAmount, luggageAmount, totalAmount, total: totalAmount,
        }));
      } catch (e) {
        if (e.code !== '23505') throw e; // unique 충돌만 재시도
      }
    }
    return res.status(500).json({ error: 'code_collision' });
  } catch (e) {
    console.error('[gts] 생성 실패:', e.message);
    return res.status(500).json({ error: 'internal' });
  }
});

router.get('/gts/bookings/:code', async (req, res) => {
  const code = String(req.params.code).toUpperCase();
  // [V3] travel_date는 to_char로 문자열 고정(pg DATE→Date 객체의 TZ 하루 시프트 방지)
  const { rows } = await pool.query(
    "SELECT *, to_char(travel_date, 'YYYY-MM-DD') AS travel_date_str FROM gts_bookings WHERE code = $1",
    [code],
  );
  if (!rows.length) return res.status(404).json({ error: 'not_found' });
  const b = rows[0];
  res.json(
    toBooking({
      code: b.code.trim(),
      party: b.party,
      luggage: b.luggage,
      vehicleType: b.vehicle_type,
      mealPlan: b.meal_plan,
      itinerary: b.picks,
      dropoffText: b.dropoff_text,
      payMethod: b.pay_method,
      total: b.total,
      travelDate: b.travel_date_str, // [V3]
      status: b.status, // [V10]
      // [V7] 분리 내역 · 구 예약은 pass_type NULL → 티켓 "Not specified"
      passType: b.pass_type,
      passAmount: b.pass_amount,
      luggageAmount: b.luggage_amount,
      totalAmount: b.total_amount,
    }),
  );
});

// [V10] 내 예약 목록 · 로그인 필수 · 최신순. 취소 포함(status로 구분) · cancellable 플래그 동반.
router.get('/gts/bookings', async (req, res) => {
  const uid = readUserId(req);
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  const { rows } = await pool.query(
    `SELECT *, to_char(travel_date, 'YYYY-MM-DD') AS travel_date_str
       FROM gts_bookings WHERE user_id = $1 ORDER BY created_at DESC`,
    [uid],
  );
  const bookings = rows.map((b) => ({
    ...toBooking({
      code: b.code.trim(),
      party: b.party,
      luggage: b.luggage,
      vehicleType: b.vehicle_type,
      mealPlan: b.meal_plan,
      itinerary: b.picks,
      dropoffText: b.dropoff_text,
      payMethod: b.pay_method,
      total: b.total,
      travelDate: b.travel_date_str,
      status: b.status,
      passType: b.pass_type,
      passAmount: b.pass_amount,
      luggageAmount: b.luggage_amount,
      totalAmount: b.total_amount,
    }),
    createdAt: b.created_at,
    // 취소 버튼 활성 조건 = 확정 상태 + 여행일 48시간 전(서버가 최종 판정 · 클라는 표시용)
    cancellable: b.status === 'confirmed' && cancellable(b.travel_date_str),
  }));
  res.json({ bookings });
});

// [V10] 예약 취소(소프트) · 로그인 + 소유권 필수 · 48시간 규칙 서버 강제 · status='cancelled'.
router.post('/gts/bookings/:code/cancel', async (req, res) => {
  const uid = readUserId(req);
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  const code = String(req.params.code).toUpperCase();
  const { rows } = await pool.query(
    "SELECT id, user_id, status, to_char(travel_date, 'YYYY-MM-DD') AS travel_date_str FROM gts_bookings WHERE code = $1",
    [code],
  );
  const b = rows[0];
  if (!b) return res.status(404).json({ error: 'not_found' });
  if (b.user_id !== uid) return res.status(403).json({ error: 'forbidden' });
  if (b.status === 'cancelled') return res.json({ status: 'cancelled' }); // 멱등
  if (!cancellable(b.travel_date_str)) return res.status(409).json({ error: 'too_late' });
  await pool.query("UPDATE gts_bookings SET status = 'cancelled', cancelled_at = now() WHERE id = $1", [b.id]);
  return res.json({ status: 'cancelled' });
});

// 클라 Ticket 계약(존 C4·C5)과 동일 모양: id=code, kind:'gts' · [V10] status는 DB값 관통(기본 confirmed)
function toBooking(src) {
  return {
    id: src.code,
    code: src.code,
    kind: 'gts',
    status: src.status ?? 'confirmed',
    party: src.party,
    luggage: src.luggage,
    vehicleType: src.vehicleType,
    mealPlan: src.mealPlan,
    meals: src.meals ?? [],
    picks: src.picks ?? [],
    itinerary: src.itinerary,
    dropoffText: src.dropoffText,
    payMethod: src.payMethod ?? null,
    total: src.total,
    travelDate: src.travelDate ?? null, // [V3] 빌더 날짜 관통(체크아웃·티켓 표기)
    // [V7] 시간제 이용권 분리 내역(구 예약 null 허용)
    passType: src.passType ?? null,
    passAmount: src.passAmount ?? null,
    luggageAmount: src.luggageAmount ?? null,
    totalAmount: src.totalAmount ?? null,
  };
}

module.exports = router;
