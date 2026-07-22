// Auth · Google OAuth code 플로우 + 데모 모드(지시 작업 2).
// [V1] DEMO_MODE 기본 false(실OAuth 기본) · true 시 비로그인 쓰기를 데모 유저로 귀속(시연 복귀용).
// 실 OAuth: GET /api/auth/google → 구글 동의 → callback → users upsert → httpOnly 세션 쿠키.
const express = require('express');
const pool = require('../db/pool');
const { setUserCookie, readUserId, clearUserCookie } = require('../lib/session');

const router = express.Router();
const DEMO_MODE = process.env.DEMO_MODE === 'true'; // [V1] 기본 false — 시연 복귀는 env DEMO_MODE=true

// [V1-fix2] redirect_uri 단일 고정 — 프록시 뒤 req.protocol='http' 조립로 구글 등록값(https)과 불일치하던 사고 방지.
// SERVER_ORIGIN(권장: https://gts-server-pnzt.onrender.com)이 있으면 그 값만 사용 · 없으면 로컬호스트 외 https 강제.
// 인가 요청·토큰 교환 모두 같은 redirectUri()를 쓰므로 양쪽 동일 보장.
const envOrigin = (process.env.SERVER_ORIGIN || '').trim().replace(/\/$/, '');
const serverOrigin = (req) => {
  if (envOrigin) return envOrigin;
  const host = req.get('host');
  const proto = /^(localhost|127\.0\.0\.1)/.test(host) ? req.protocol : 'https';
  return `${proto}://${host}`;
};
const redirectUri = (req) => `${serverOrigin(req)}/api/auth/google/callback`;
// [V1-fix3] CLIENT_ORIGIN 정규화 — env 붙여넣기에서 스킴 앞 글자가 소실된 값('ttps://…')이
// 성공 리다이렉트 base 로 그대로 이어붙어 깨지던 사고 방어: trim·끝 슬래시 제거 + 스킴 불완전 시 https 재조립.
const clientOrigin = (() => {
  const raw = (process.env.CLIENT_ORIGIN || '').trim().replace(/\/$/, '');
  if (!raw || /^https?:\/\//.test(raw)) return raw;
  return `https://${raw.replace(/^[a-z]*:?\/\//i, '')}`;
})();
// 기동 시 1회 출력 — 구글 콘솔 등록값과 문자 단위 대조용(시크릿 아님)
console.log(
  '[auth] OAuth redirect_uri =',
  envOrigin ? `${envOrigin}/api/auth/google/callback` : '(SERVER_ORIGIN 미설정 — 요청 host 기반 · 로컬호스트 외 https 강제)',
);
console.log('[auth] 성공 리다이렉트 base =', clientOrigin || '(CLIENT_ORIGIN 미설정 — 상대 경로 리다이렉트)');

// 데모 유저 upsert · 클라 AuthContext demoUser(demo@gts.ac.kr)와 동일 정체
async function ensureDemoUser() {
  const { rows } = await pool.query(
    `INSERT INTO users (google_sub, email, name) VALUES (NULL, 'demo@gts.ac.kr', 'Demo Traveler')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
  );
  return rows[0].id;
}

// 쓰기 요청 귀속 사용자 결정(세션 → 데모 → null)
async function resolveUserId(req) {
  const uid = readUserId(req);
  if (uid) return uid;
  if (DEMO_MODE) return ensureDemoUser();
  return null;
}

// [V1] returnTo 보존 = OAuth state(HMAC 서명) — 클라 쿼리 노출 금지 · 내부 경로만 허용(open redirect 방지)
const crypto = require('crypto');
const stateSign = (v) => crypto.createHmac('sha256', process.env.SESSION_SECRET || 'dev-secret').update(v).digest('base64url');
const encodeState = (returnTo) => {
  const b = Buffer.from(returnTo).toString('base64url');
  return `${b}.${stateSign(b)}`;
};
const decodeState = (state) => {
  if (!state) return null;
  const i = state.lastIndexOf('.');
  if (i < 1) return null;
  const [b, sig] = [state.slice(0, i), state.slice(i + 1)];
  if (sig !== stateSign(b)) return null;
  const returnTo = Buffer.from(b, 'base64url').toString();
  return /^\/[a-zA-Z0-9\-/]*$/.test(returnTo) ? returnTo : null;
};

router.get('/auth/google', (req, res) => {
  const returnTo = typeof req.query.returnTo === 'string' && /^\/[a-zA-Z0-9\-/]*$/.test(req.query.returnTo)
    ? req.query.returnTo
    : '/';
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(req),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state: encodeState(returnTo),
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// [V1-fix] 유저 upsert를 이메일 기준으로 교체(users_email_key 충돌 근본 수리) · 저장·비교 모두 lower() 정규화.
// google_sub 유니크와의 상호작용: 같은 sub가 다른 이메일 행에 남아 있으면 선행 UPDATE로 그 행의 sub만 분리(NULL) —
// 행 삭제 금지(예약·이벤트 user_id 참조 보존), 다음 upsert가 이메일 행에 sub를 재연결.
const oauthError = (reason, message) => Object.assign(new Error(message || reason), { reason });

async function upsertOAuthUser({ sub, email, name, picture }) {
  await pool.query('UPDATE users SET google_sub = NULL WHERE google_sub = $1 AND email <> lower($2)', [sub, email]);
  const { rows } = await pool.query(
    `INSERT INTO users (google_sub, email, name, avatar) VALUES ($1, lower($2), $3, $4)
     ON CONFLICT (email) DO UPDATE SET google_sub = EXCLUDED.google_sub, name = EXCLUDED.name, avatar = EXCLUDED.avatar
     RETURNING *`,
    [sub, email, name || email, picture || null],
  );
  return rows[0];
}

router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) throw oauthError('no_code', 'code 없음');
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: (process.env.GOOGLE_CLIENT_SECRET || '').trim(), // 앞뒤 공백·줄바꿈 = invalid_client 원인
        redirect_uri: redirectUri(req),
        grant_type: 'authorization_code',
      }),
    });
    const token = await tokenRes.json();
    if (!token.id_token) throw oauthError('token_exchange', token.error_description || token.error || 'id_token 없음');
    // id_token 검증은 구글 tokeninfo 위임(경량 · 라이브러리 추가 금지)
    const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token.id_token}`);
    const info = await infoRes.json();
    if (info.aud !== process.env.GOOGLE_CLIENT_ID) throw oauthError('aud_mismatch', 'aud 불일치');
    const user = await upsertOAuthUser(info);
    setUserCookie(res, user.id);
    // [V1] returnTo 복귀(+login=1 마커 — 클라가 login 트래킹 1회 발화)
    const returnTo = decodeState(req.query.state) || '/';
    const sep = returnTo.includes('?') ? '&' : '?';
    const dest = `${clientOrigin}${returnTo}${sep}login=1`;
    console.log('[auth] 성공 리다이렉트 =', dest); // 스킴 온전성 확인용(시크릿 없음)
    res.redirect(dest);
  } catch (e) {
    // 원인 삼키기 금지: 로그 = 단계 코드 + err.message(시크릿·토큰 없음), 응답 = 짧은 reason 코드만
    const reason = e.reason || (e.code ? `db_${e.code}` : 'unknown');
    console.error('[auth] 콜백 실패:', reason, '-', e.message);
    res.status(e.reason === 'no_code' ? 400 : 500).json({ error: 'oauth_failed', reason });
  }
});

const { isAdminEmail } = require('../lib/admin');

router.get('/me', async (req, res) => {
  const uid = readUserId(req);
  if (!uid) return res.json({ user: null, demoMode: DEMO_MODE });
  const { rows } = await pool.query('SELECT id, email, name, avatar FROM users WHERE id = $1', [uid]);
  const user = rows[0] ?? null;
  // isAdmin은 불리언만(관리자 목록 비노출) — 클라 RequireAdmin 가드용
  res.json({ user: user ? { ...user, isAdmin: isAdminEmail(user.email) } : null, demoMode: DEMO_MODE });
});

router.post('/logout', (req, res) => {
  clearUserCookie(res);
  res.json({ ok: true });
});

module.exports = { router, resolveUserId, DEMO_MODE, upsertOAuthUser, clientOrigin };
