// [V1] 관리자 API · 전부 requireAdmin(비로그인 401 / 비관리자 403 — 서버측 차단).
// participants: 유저별 집계(시작·마지막 스텝·완료·booking code·총 소요·스텝 상세 배열)
// events?after=<iso>: 라이브 타임라인용 최신 이벤트(폴링 15s 대상).
const express = require('express');
const pool = require('../db/pool');
const { requireAdmin } = require('../lib/admin');

const router = express.Router();

router.get('/admin/participants', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      u.id, u.email, u.name,
      min(e.created_at)                          AS started_at,
      max(e.created_at)                          AS last_at,
      (array_agg(e.step ORDER BY e.created_at DESC))[1] AS last_step,
      bool_or(e.step = 'complete')               AS completed,
      max(CASE WHEN e.step = 'complete' THEN e.payload->>'code' END) AS booking_code,
      coalesce(sum(e.duration_ms), 0)::int       AS total_ms,
      json_agg(json_build_object(
        'step', e.step, 'payload', e.payload, 'durationMs', e.duration_ms, 'at', e.created_at
      ) ORDER BY e.created_at)                   AS steps
    FROM journey_events e
    JOIN users u ON u.id = e.user_id
    GROUP BY u.id, u.email, u.name
    ORDER BY min(e.created_at) DESC
  `);
  res.json({ participants: rows });
});

router.get('/admin/events', requireAdmin, async (req, res) => {
  const after = req.query.after ? new Date(String(req.query.after)) : null;
  const params = [];
  let where = '';
  if (after && !Number.isNaN(after.getTime())) {
    params.push(after.toISOString());
    where = 'WHERE e.created_at > $1';
  }
  const { rows } = await pool.query(
    `SELECT e.id, e.step, e.payload, e.duration_ms, e.created_at, u.email
     FROM journey_events e JOIN users u ON u.id = e.user_id
     ${where}
     ORDER BY e.created_at DESC
     LIMIT 100`,
    params,
  );
  res.json({ events: rows });
});

module.exports = router;
