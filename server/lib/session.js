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

module.exports = { setUserCookie, readUserId, clearUserCookie, ensureAnonKey };
