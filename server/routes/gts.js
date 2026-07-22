// GTS 예약 API · IA §9.6 데이터 모델 · 총액은 서버 재계산(클라 total 신뢰 금지 — 지시 작업 3).
const express = require('express');
const pool = require('../db/pool');
const { computeTotal } = require('../services/fares');
const { resolveUserId } = require('./auth');

const router = express.Router();

// 6자 코드 · 클라 data/gts/api.js와 동일 규칙(혼동 문자 제외)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const makeCode = () =>
  Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

router.post('/gts/bookings', async (req, res) => {
  try {
    const { party, luggage, mealPlan, itinerary, dropoffText, payMethod, travelDate } = req.body ?? {};
    const p = Number(party);
    if (!Number.isInteger(p) || p < 1 || p > 12) return res.status(400).json({ error: 'party 1~12' });
    if (!['none', 'lunch', 'lunchDinner'].includes(mealPlan)) return res.status(400).json({ error: 'mealPlan' });
    if (!Array.isArray(itinerary) || !itinerary.length) return res.status(400).json({ error: 'itinerary' });
    if (!dropoffText || !String(dropoffText).trim()) return res.status(400).json({ error: 'dropoffText 필수' });
    // [V3] 여행 날짜 · 선택값(YYYY-MM-DD) — 형식만 검증(당일 허용 · 과거 차단은 클라 캘린더 소유)
    const tDate = typeof travelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(travelDate) ? travelDate : null;
    const lug = Boolean(luggage);
    // 서버 재계산(§9.3 결정론 + 요금표) — 클라가 보낸 total·vehicleType은 무시
    const { vehicleType, total } = computeTotal(p, lug);
    const userId = await resolveUserId(req);
    // 코드 충돌 시 재시도 3회
    for (let i = 0; i < 3; i += 1) {
      const code = makeCode();
      try {
        const { rows } = await pool.query(
          `INSERT INTO gts_bookings (code, user_id, party, luggage, vehicle_type, meal_plan, picks, dropoff_text, pay_method, total, travel_date)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING code, created_at`,
          [code, userId, p, lug, vehicleType, mealPlan, JSON.stringify(itinerary), String(dropoffText), payMethod ?? null, total, tDate],
        );
        return res.status(201).json(toBooking({ ...req.body, code: rows[0].code, vehicleType, total, party: p, luggage: lug, travelDate: tDate }));
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
    }),
  );
});

// 클라 Ticket 계약(존 C4·C5)과 동일 모양: id=code, kind:'gts', status:'confirmed'
function toBooking(src) {
  return {
    id: src.code,
    code: src.code,
    kind: 'gts',
    status: 'confirmed',
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
  };
}

module.exports = router;
