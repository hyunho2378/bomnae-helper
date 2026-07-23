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

const bcrypt = require('bcryptjs');
const { isAdminUser } = require('../lib/admin');

// [V10] 이메일 기반 회원가입 · ID = 이메일 형식 필수(email 컬럼 저장) + 비밀번호 규칙(6자+숫자+특수).
//   비밀번호는 bcrypt 해시로만 저장(평문 금지) · email 중복 409 · 성공 시 즉시 세션 발급.
//   [V4] 하위호환: 기존 minwoo 등 username 계정은 로그인 경로에서 계속 통과(등록만 이메일화).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 6자 이상 + 숫자 1개 이상 + 특수기호(비영숫자) 1개 이상 — 클라 실시간 검증과 동일 규칙.
const PASSWORD_RE = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
const DUMMY_HASH = '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv'; // 타이밍/존재 비노출용
const safeUser = (u) => {
  const { pin_hash, ...rest } = u; // 해시 응답 제거
  return { ...rest, isAdmin: isAdminUser(u), hasPassword: !!pin_hash };
};

router.post('/auth/register', async (req, res) => {
  try {
    const { username, pin, name } = req.body ?? {}; // username 필드 = 이메일(클라 폼 필드명 유지)
    const email = typeof username === 'string' ? username.trim().toLowerCase() : '';
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'bad_email' });
    if (typeof pin !== 'string' || !PASSWORD_RE.test(pin)) return res.status(400).json({ error: 'bad_pin' });
    const pinHash = await bcrypt.hash(pin, 10);
    const displayName = typeof name === 'string' && name.trim() ? name.trim() : email.split('@')[0];
    let rows;
    try {
      ({ rows } = await pool.query(
        `INSERT INTO users (email, pin_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, avatar, username, pin_hash`,
        [email, pinHash, displayName],
      ));
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ error: 'email_taken' }); // email UNIQUE 충돌
      throw e;
    }
    setUserCookie(res, rows[0].id);
    return res.status(201).json({ user: safeUser(rows[0]) });
  } catch (e) {
    console.error('[auth] register 실패:', e.message); // 비밀번호·해시 비로깅
    return res.status(500).json({ error: 'register_failed' });
  }
});

// [V10] 로그인 · 이메일 또는 레거시 username 어느 쪽이든 매칭(minwoo 하위호환) · 실패는 존재 비노출 단일 401.
router.post('/auth/login', async (req, res) => {
  try {
    const { username, pin } = req.body ?? {};
    if (typeof username !== 'string' || typeof pin !== 'string') return res.status(400).json({ error: 'bad_request' });
    const id = username.trim();
    const { rows } = await pool.query(
      'SELECT id, email, name, avatar, username, pin_hash FROM users WHERE lower(username) = lower($1) OR email = lower($1)',
      [id],
    );
    const u = rows.find((r) => r.pin_hash) || rows[0]; // 비밀번호 보유 행 우선
    // 계정 부재도 bcrypt 비교를 수행(타이밍·존재 노출 완화) · 실패는 전부 동일 401
    const ok = u && u.pin_hash ? await bcrypt.compare(pin, u.pin_hash) : await bcrypt.compare(pin, DUMMY_HASH);
    if (!u || !ok) return res.status(401).json({ error: 'invalid_credentials' });
    setUserCookie(res, u.id);
    return res.json({ user: safeUser(u) });
  } catch (e) {
    console.error('[auth] login 실패:', e.message);
    return res.status(500).json({ error: 'login_failed' });
  }
});

// [V10] 비밀번호 변경 · 현재 비밀번호 확인 후 새 규칙 검증 · 구글 계정(pin_hash 없음)은 400(클라는 섹션 숨김).
router.post('/auth/change-password', async (req, res) => {
  try {
    const uid = readUserId(req);
    if (!uid) return res.status(401).json({ error: 'unauthorized' });
    const { currentPin, newPin } = req.body ?? {};
    const { rows } = await pool.query('SELECT pin_hash FROM users WHERE id = $1', [uid]);
    const hash = rows[0]?.pin_hash;
    if (!hash) return res.status(400).json({ error: 'no_password_account' });
    if (typeof currentPin !== 'string' || !(await bcrypt.compare(currentPin, hash))) {
      return res.status(400).json({ error: 'wrong_current' });
    }
    if (typeof newPin !== 'string' || !PASSWORD_RE.test(newPin)) return res.status(400).json({ error: 'bad_pin' });
    const newHash = await bcrypt.hash(newPin, 10);
    await pool.query('UPDATE users SET pin_hash = $1 WHERE id = $2', [newHash, uid]);
    return res.json({ ok: true });
  } catch (e) {
    console.error('[auth] change-password 실패:', e.message);
    return res.status(500).json({ error: 'change_failed' });
  }
});

router.get('/me', async (req, res) => {
  const uid = readUserId(req);
  if (!uid) return res.json({ user: null, demoMode: DEMO_MODE });
  const { rows } = await pool.query('SELECT id, email, name, avatar, username, pin_hash FROM users WHERE id = $1', [uid]);
  // isAdmin은 불리언만(관리자 목록 비노출) · [V10] hasPassword = 비밀번호 계정 여부(프로필 비번변경 섹션 분기)
  res.json({ user: rows[0] ? safeUser(rows[0]) : null, demoMode: DEMO_MODE });
});

router.post('/logout', (req, res) => {
  clearUserCookie(res);
  res.json({ ok: true });
});

module.exports = { router, resolveUserId, DEMO_MODE, upsertOAuthUser, clientOrigin };
