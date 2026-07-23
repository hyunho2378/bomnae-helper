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

// ─────────────────────────────────────────────────────────────────────────────
// [V11] User Management 2차 게이트 · env ADMIN_2FA_PIN 검증(하드코딩 금지).
//   성공 시 30분 유효 · 5회 실패 시 10분 잠금. 상태는 서버 프로세스 인메모리(userId 키) —
//   재시작 시 재입력(허용) · 실패 카운트는 서버만 신뢰(클라 조작 방지).
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_2FA_PIN = (process.env.ADMIN_2FA_PIN || '').trim();
const TWOFA_TTL_MS = 30 * 60 * 1000; // 30분 유효
const LOCK_MS = 10 * 60 * 1000; // 10분 잠금
const MAX_FAILS = 5;
const twoFa = new Map(); // userId -> { verifiedUntil, failCount, lockedUntil }
const twoFaState = (uid) => twoFa.get(uid) || { verifiedUntil: 0, failCount: 0, lockedUntil: 0 };

router.post('/admin/2fa', requireAdmin, (req, res) => {
  const uid = req.adminUserId;
  const now = Date.now();
  const st = twoFaState(uid);
  if (st.lockedUntil > now) return res.status(423).json({ error: 'locked', lockedUntil: st.lockedUntil });
  if (!ADMIN_2FA_PIN) return res.status(500).json({ error: 'not_configured' }); // env 미설정
  const pin = String(req.body?.pin ?? '');
  if (pin.length > 0 && pin === ADMIN_2FA_PIN) {
    twoFa.set(uid, { verifiedUntil: now + TWOFA_TTL_MS, failCount: 0, lockedUntil: 0 });
    return res.json({ ok: true, verifiedUntil: now + TWOFA_TTL_MS });
  }
  const failCount = st.failCount + 1;
  if (failCount >= MAX_FAILS) {
    twoFa.set(uid, { verifiedUntil: 0, failCount: 0, lockedUntil: now + LOCK_MS });
    return res.status(423).json({ error: 'locked', lockedUntil: now + LOCK_MS });
  }
  twoFa.set(uid, { verifiedUntil: 0, failCount, lockedUntil: 0 });
  return res.status(401).json({ error: 'wrong_pin', remaining: MAX_FAILS - failCount });
});

router.get('/admin/2fa/status', requireAdmin, (req, res) => {
  const now = Date.now();
  const st = twoFaState(req.adminUserId);
  res.json({
    verified: st.verifiedUntil > now,
    verifiedUntil: st.verifiedUntil > now ? st.verifiedUntil : 0,
    lockedUntil: st.lockedUntil > now ? st.lockedUntil : 0,
    configured: !!ADMIN_2FA_PIN,
  });
});

// 2차 게이트 통과 필수(requireAdmin 다음 체이닝) · 미통과 시 403 2fa_required
function requireAdmin2fa(req, res, next) {
  if (twoFaState(req.adminUserId).verifiedUntil > Date.now()) return next();
  return res.status(403).json({ error: '2fa_required' });
}

// [V11] 전체 사용자 테이블 · 이름/이메일/가입일/예약 수/마지막 활동.
//   User Management는 검증 대시보드와 달리 REAL_USER_FILTER 없음(전체 사용자 관리 목적).
//   이 조회는 SELECT만 — journey_events에 아무 것도 쓰지 않는다(관리자 행위로 데이터 오염 금지 · 지시 [1]).
router.get('/admin/users', requireAdmin, requireAdmin2fa, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.username,
            to_char(u.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS joined,
            (SELECT count(*) FROM gts_bookings b WHERE b.user_id = u.id)::int AS booking_count,
            GREATEST(
              (SELECT max(created_at) FROM gts_bookings b WHERE b.user_id = u.id),
              (SELECT max(created_at) FROM journey_events e WHERE e.user_id = u.id)
            ) AS last_at
       FROM users u
      ORDER BY last_at DESC NULLS LAST, u.created_at DESC`,
  );
  res.json({ users: rows });
});

// [V11] 사용자 상세 · 예약 목록(picks=선택 동선) + journey_events 타임라인. SELECT만(기록 안 함).
router.get('/admin/users/:id', requireAdmin, requireAdmin2fa, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'bad_id' });
  const { rows: urows } = await pool.query(
    `SELECT id, name, email, username,
            to_char(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS joined
       FROM users WHERE id = $1`,
    [id],
  );
  if (!urows.length) return res.status(404).json({ error: 'not_found' });
  const { rows: bookings } = await pool.query(
    `SELECT code, status, party, meal_plan, pass_type, total_amount, total, picks,
            to_char(travel_date, 'YYYY-MM-DD') AS travel_date,
            to_char(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
       FROM gts_bookings WHERE user_id = $1 ORDER BY created_at DESC`,
    [id],
  );
  const { rows: events } = await pool.query(
    `SELECT id, step, payload, duration_ms, created_at
       FROM journey_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [id],
  );
  res.json({ user: urows[0], bookings, events });
});

module.exports = router;
