// [V1] 관리자 API · 전부 requireAdmin(비로그인 401 / 비관리자 403 — 서버측 차단).
// participants: 유저별 집계(시작·마지막·완주(예약 유무)·이벤트 수·스텝 배열).
// events?after=<iso>: 라이브 타임라인용 최신 이벤트(폴링 15s).
const express = require('express');
const pool = require('../db/pool');
const { requireAdmin, ADMIN_EMAILS } = require('../lib/admin');

const router = express.Router();

// [V6] 검증 대시보드 = 실제 로그인 사용자(구글 이메일 + ID/PIN 일반 로그인 모두 포함).
//   자동화/시드/데모 계정만 제외: demo · example.com · admin seed(minwoo) · tester01 · e2e*.
//   NULL 필드는 coalesce로 안전 처리(미제외 조건이 NULL 되어 실계정이 누락되는 것 방지).
const REAL_USER_FILTER = `NOT (
      coalesce(lower(u.email), '') = 'demo@gts.ac.kr'
      OR coalesce(lower(u.email), '') LIKE '%@example.com'
      OR coalesce(lower(u.username), '') IN ('minwoo', 'tester01')
      OR coalesce(lower(u.username), '') LIKE 'e2e%'
    )`;

// [V6] 팀 내부 계정 제외(검증 통계에서 자기 팀 제거). EXCLUDED_EMAILS 없으면 ADMIN_EMAILS 기본 · 소문자 비교.
//   DB 행 삭제 아님 — 집계·타임라인에서만 제외. `<> ALL()`이라 email NULL(ID/PIN)은 유지.
const EXCLUDED_EMAILS = process.env.EXCLUDED_EMAILS
  ? process.env.EXCLUDED_EMAILS.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  : ADMIN_EMAILS;

// [V6] 완주 판정 = gts_bookings 예약 행 존재(서버가 써서 유실 안 됨). complete 이벤트는 기록만, 판정 근거 아님.
//   LEFT JOIN + LATERAL(유저별 최신 예약 1건)로 이벤트 없는 완주·로그인만 유저도 모두 표시. 행 중복 없음.
router.get('/admin/participants', requireAdmin, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       u.id, u.email, u.name, u.username,
       coalesce(min(e.created_at), bk.booked_at, u.created_at) AS started_at,
       max(e.created_at)                          AS last_at,
       count(e.id)::int                           AS event_count,
       (bk.code IS NOT NULL)                      AS completed,
       bk.code                                    AS booking_code,
       bk.picks                                   AS booking_picks,
       coalesce(
         json_agg(json_build_object(
           'step', e.step, 'payload', e.payload, 'durationMs', e.duration_ms, 'at', e.created_at
         ) ORDER BY e.created_at) FILTER (WHERE e.id IS NOT NULL),
         '[]'::json
       )                                          AS steps
     FROM users u
     LEFT JOIN journey_events e ON e.user_id = u.id
     LEFT JOIN LATERAL (
       SELECT code, picks, created_at AS booked_at
       FROM gts_bookings WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
     ) bk ON true
     WHERE ${REAL_USER_FILTER}
       AND coalesce(lower(u.email), '') <> ALL($1::text[])
     GROUP BY u.id, u.email, u.name, u.username, u.created_at, bk.code, bk.picks, bk.booked_at
     ORDER BY max(e.created_at) DESC NULLS LAST,
              coalesce(min(e.created_at), bk.booked_at, u.created_at) DESC`,
    [EXCLUDED_EMAILS],
  );
  // [V6] 제외된 내부 계정 수(화면 하단 "내부 계정 N명 제외" 표기용)
  const { rows: exc } = await pool.query(
    `SELECT count(*)::int n FROM users u
     WHERE ${REAL_USER_FILTER} AND coalesce(lower(u.email), '') = ANY($1::text[])`,
    [EXCLUDED_EMAILS],
  );
  res.json({ participants: rows, excludedCount: exc[0].n });
});

router.get('/admin/events', requireAdmin, async (req, res) => {
  const after = req.query.after ? new Date(String(req.query.after)) : null;
  // [V6] 타임라인도 실계정만 + 팀 내부 계정 제외
  const params = [EXCLUDED_EMAILS];
  let where = `WHERE ${REAL_USER_FILTER} AND coalesce(lower(u.email), '') <> ALL($1::text[])`;
  if (after && !Number.isNaN(after.getTime())) {
    params.push(after.toISOString());
    where += ' AND e.created_at > $2';
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
