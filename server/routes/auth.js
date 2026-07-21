// Auth · Google OAuth code 플로우 + 데모 모드(지시 작업 2).
// DEMO_MODE=true(기본): 비로그인 쓰기 요청을 데모 유저로 귀속(클라 DEMO_AUTH 플래그 불변).
// 실 OAuth: GET /api/auth/google → 구글 동의 → callback → users upsert → httpOnly 세션 쿠키.
const express = require('express');
const pool = require('../db/pool');
const { setUserCookie, readUserId, clearUserCookie } = require('../lib/session');

const router = express.Router();
const DEMO_MODE = process.env.DEMO_MODE !== 'false'; // 기본 true

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

router.get('/auth/google', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(req),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
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
    res.redirect(process.env.CLIENT_ORIGIN || '/');
  } catch (e) {
    console.error('[auth] 콜백 실패:', e.message);
    res.status(500).json({ error: 'oauth_failed' });
  }
});

router.get('/me', async (req, res) => {
  const uid = readUserId(req);
  if (!uid) return res.json({ user: null, demoMode: DEMO_MODE });
  const { rows } = await pool.query('SELECT id, email, name, avatar FROM users WHERE id = $1', [uid]);
  res.json({ user: rows[0] ?? null, demoMode: DEMO_MODE });
});

router.post('/logout', (req, res) => {
  clearUserCookie(res);
  res.json({ ok: true });
});

module.exports = { router, resolveUserId, DEMO_MODE };
