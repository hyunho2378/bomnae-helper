// [V3] Travel Log · GET /api/travel-logs — 완료된 gts_bookings 익명화 집계 + 목업 시드 6건 병합.
// 익명화: 이니셜 = users.name 첫 글자 + '.'(없으면 null → 클라 'Traveler' 폴백) ·
//   국가 컬럼은 users 스키마에 없어 실 로그 country = null(클라 폴백 동일).
// 실 로그 최근 6건 + 목업 시드 6건 · 예약 생성 = 완료(별도 상태 없음 · 스키마 v4).
const express = require('express');
const pool = require('../db/pool');
const MOCK_LOGS = require('../data/travelLogSeeds');

const router = express.Router();

router.get('/travel-logs', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.code, b.party, b.meal_plan, b.picks,
              to_char(b.travel_date, 'YYYY-MM-DD') AS travel_date,
              to_char(b.created_at, 'YYYY-MM-DD') AS created_date,
              u.name
       FROM gts_bookings b
       LEFT JOIN users u ON u.id = b.user_id
       WHERE b.status IS DISTINCT FROM 'cancelled'
         AND (b.travel_date IS NULL OR b.travel_date <= CURRENT_DATE)  -- [V13] 오늘 이후(미래 여행일) 제외
       ORDER BY b.created_at DESC
       LIMIT 6`,
    );
    const real = rows.map((r) => ({
      code: r.code.trim(),
      mock: false,
      author: r.name ? `${r.name.trim()[0].toUpperCase()}.` : null,
      country: null,
      party: r.party,
      mealPlan: r.meal_plan,
      itinerary: r.picks,
      travelDate: r.travel_date ?? r.created_date,
    }));
    res.json({ logs: [...real, ...MOCK_LOGS] });
  } catch (e) {
    // DB 불가 시에도 시드는 응답(데모 보장) — 원인은 로그만
    console.error('[travel-logs] 집계 실패:', e.message);
    res.json({ logs: MOCK_LOGS });
  }
});

module.exports = router;
