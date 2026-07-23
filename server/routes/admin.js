// [V1] 관리자 API · 전부 requireAdmin(비로그인 401 / 비관리자 403 — 서버측 차단).
// participants: 유저별 집계(시작·마지막 스텝·완료·booking code·총 소요·스텝 상세 배열)
// events?after=<iso>: 라이브 타임라인용 최신 이벤트(폴링 15s 대상).
const express = require('express');
const pool = require('../db/pool');
const { requireAdmin } = require('../lib/admin');

const router = express.Router();

// [V6] 검증 대시보드 = 실제 로그인 사용자(구글 이메일 + ID/PIN 일반 로그인 모두 포함).
//   LEFT JOIN이라 로그인만 하고 여정 이벤트가 없는 실계정도 표시("이 사람들이 로그인해 썼다" 검증).
//   자동화/시드/데모 계정만 제외: demo · example.com · admin seed(minwoo) · tester01 · e2e*.
//   NULL 필드는 coalesce로 안전 처리(미제외 조건이 NULL 되어 실계정이 누락되는 것 방지). 영구 삭제 아님.
const REAL_USER_FILTER = `NOT (
      coalesce(lower(u.email), '') = 'demo@gts.ac.kr'
      OR coalesce(lower(u.email), '') LIKE '%@example.com'
      OR coalesce(lower(u.username), '') IN ('minwoo', 'tester01')
      OR coalesce(lower(u.username), '') LIKE 'e2e%'
    )`;

router.get('/admin/participants', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      u.id, u.email, u.name, u.username,
      coalesce(min(e.created_at), u.created_at)  AS started_at,
      max(e.created_at)                          AS last_at,
      coalesce(
        (array_agg(e.step ORDER BY e.created_at DESC) FILTER (WHERE e.step IS NOT NULL))[1],
        'login'
      )                                          AS last_step,
      bool_or(e.step = 'complete')               AS completed,
      max(CASE WHEN e.step = 'complete' THEN e.payload->>'code' END) AS booking_code,
      coalesce(sum(e.duration_ms), 0)::int       AS total_ms,
      coalesce(
        json_agg(json_build_object(
          'step', e.step, 'payload', e.payload, 'durationMs', e.duration_ms, 'at', e.created_at
        ) ORDER BY e.created_at) FILTER (WHERE e.id IS NOT NULL),
        '[]'::json
      )                                          AS steps
    FROM users u
    LEFT JOIN journey_events e ON e.user_id = u.id
    WHERE ${REAL_USER_FILTER}
    GROUP BY u.id, u.email, u.name, u.username, u.created_at
    ORDER BY (count(e.id) > 0) DESC, coalesce(min(e.created_at), u.created_at) DESC
  `);
  res.json({ participants: rows });
});

router.get('/admin/events', requireAdmin, async (req, res) => {
  const after = req.query.after ? new Date(String(req.query.after)) : null;
  const params = [];
  // [V6] 타임라인도 실계정(구글/기관 이메일)만 · 테스트·ID/PIN 계정 제외
  let where = `WHERE ${REAL_USER_FILTER}`;
  if (after && !Number.isNaN(after.getTime())) {
    params.push(after.toISOString());
    where += ' AND e.created_at > $1';
  }
  const { rows } = await pool.query(
    `SELECT e.id, e.step, e.payload, e.duration_ms, e.created_at,
            coalesce(u.email, '@' || u.username) AS email
     FROM journey_events e JOIN users u ON u.id = e.user_id
     ${where}
     ORDER BY e.created_at DESC
     LIMIT 100`,
    params,
  );
  res.json({ events: rows });
});

module.exports = router;
