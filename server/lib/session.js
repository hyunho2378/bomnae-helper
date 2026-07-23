// 경량 세션 · SESSION_SECRET HMAC 서명 쿠키(외부 세션 스토어 없음 · 의존성 추가 금지).
// gts_session = "<userId>.<hmac>" (로그인 귀속) / gts_anon = 랜덤 키(리뷰 좋아요 session_key).
const crypto = require('crypto');

const SECRET = process.env.SESSION_SECRET || 'dev-secret';
const isProd = process.env.NODE_ENV === 'production';

const sign = (value) => crypto.createHmac('sha256', SECRET).update(String(value)).digest('base64url');

function setUserCookie(res, userId) {
  res.cookie('gts_session', `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax', // 배포는 Vercel(클라)↔Render(서버) 크로스 사이트
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

function readUserId(req) {
  const raw = req.cookies?.gts_session;
  if (!raw) return null;
  const i = raw.lastIndexOf('.');
  if (i < 1) return null;
  const [id, sig] = [raw.slice(0, i), raw.slice(i + 1)];
  return sig === sign(id) ? Number(id) : null;
}

function clearUserCookie(res) {
  res.clearCookie('gts_session', { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd });
}

// [V16] 관리자 2차 인증 세션 · gts_session과 동일한 HMAC 서명 쿠키 패턴(외부 세션 스토어·미들웨어 없음).
//   값 = "<uid>.<expiresAt>.<hmac(uid.expiresAt)>" — 만료 시각을 서명에 포함(변조·연장 불가).
//   쿠키 옵션(httpOnly·sameSite·secure)은 기존 인증 쿠키(gts_session)와 동일.
function setAdmin2faCookie(res, uid, expiresAt) {
  const payload = `${uid}.${expiresAt}`;
  res.cookie('gts_admin2fa', `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: Math.max(0, expiresAt - Date.now()),
  });
}

// 서명·만료 검증 후 { uid, expiresAt } 반환 · 무효(서명 불일치·만료·형식 오류)면 null
function readAdmin2fa(req) {
  const raw = req.cookies?.gts_admin2fa;
  if (!raw) return null;
  const i = raw.lastIndexOf('.');
  if (i < 1) return null;
  const [payload, cookieSig] = [raw.slice(0, i), raw.slice(i + 1)];
  if (cookieSig !== sign(payload)) return null; // 서명 불일치
  const j = payload.indexOf('.');
  if (j < 1) return null;
  const uid = Number(payload.slice(0, j));
  const exp = Number(payload.slice(j + 1));
  if (!Number.isFinite(uid) || !Number.isFinite(exp) || exp <= Date.now()) return null;
  return { uid, expiresAt: exp };
}

function clearAdmin2faCookie(res) {
  res.clearCookie('gts_admin2fa', { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd });
}

// 익명 세션 키(좋아요 1인 1회 판정) · 없으면 발급
function ensureAnonKey(req, res) {
  let key = req.cookies?.gts_anon;
  if (!key || !/^[a-f0-9]{32}$/.test(key)) {
    key = crypto.randomBytes(16).toString('hex');
    res.cookie('gts_anon', key, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }
  return key;
}

module.exports = {
  setUserCookie,
  readUserId,
  clearUserCookie,
  ensureAnonKey,
  setAdmin2faCookie, // [V16]
  readAdmin2fa, // [V16]
  clearAdmin2faCookie, // [V16]
};
