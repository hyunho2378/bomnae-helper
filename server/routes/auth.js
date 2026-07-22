// Auth · Google OAuth code 플로우 + 데모 모드(지시 작업 2).
// [V1] DEMO_MODE 기본 false(실OAuth 기본) · true 시 비로그인 쓰기를 데모 유저로 귀속(시연 복귀용).
// 실 OAuth: GET /api/auth/google → 구글 동의 → callback → users upsert → httpOnly 세션 쿠키.
const express = require('express');
const pool = require('../db/pool');
const { setUserCookie, readUserId, clearUserCookie } = require('../lib/session');

const router = express.Router();
const DEMO_MODE = process.env.DEMO_MODE === 'true'; // [V1] 기본 false — 시연 복귀는 env DEMO_MODE=true

const serverOrigin = (req) => process.env.SERVER_ORIGIN || `${req.protocol}://${req.get('host')}`;
const redirectUri = (req) => `${serverOrigin(req)}/api/auth/google/callback`;

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

router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'code 없음' });
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri(req),
        grant_type: 'authorization_code',
      }),
    });
    const token = await tokenRes.json();
    if (!token.id_token) throw new Error(token.error_description || 'id_token 없음');
    // id_token 검증은 구글 tokeninfo 위임(경량 · 라이브러리 추가 금지)
    const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token.id_token}`);
    const info = await infoRes.json();
    if (info.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error('aud 불일치');
    const { rows } = await pool.query(
      `INSERT INTO users (google_sub, email, name, avatar) VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_sub) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, avatar = EXCLUDED.avatar
       RETURNING id`,
      [info.sub, info.email, info.name || info.email, info.picture || null],
    );
    setUserCookie(res, rows[0].id);
    // [V1] returnTo 복귀(+login=1 마커 — 클라가 login 트래킹 1회 발화)
    const returnTo = decodeState(req.query.state) || '/';
    const base = process.env.CLIENT_ORIGIN || '';
    const sep = returnTo.includes('?') ? '&' : '?';
    res.redirect(`${base}${returnTo}${sep}login=1`);
  } catch (e) {
    console.error('[auth] 콜백 실패:', e.message);
    res.status(500).json({ error: 'oauth_failed' });
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

module.exports = { router, resolveUserId, DEMO_MODE };
