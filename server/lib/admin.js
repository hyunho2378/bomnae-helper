// [V1] 관리자 판별 · env 없이도 동작하는 4인 폴백, env(ADMIN_EMAILS)가 있으면 env가 이긴다.
// 이메일 비교는 항상 소문자(대문자 표기 계정도 판별 통과).
const pool = require('../db/pool');
const { readUserId } = require('./session');

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'smmilk2378@gmail.com,mijuhur@gmail.com,mv.tn04@gmail.com,mardoto20220@gmail.com')
  .split(',')
  .map((s) => s.trim().toLowerCase());

const isAdminEmail = (email) => !!email && ADMIN_EMAILS.includes(String(email).toLowerCase());

// 서버측 차단: 비로그인 401 / 비관리자 403 (클라 가드는 404 위장 — 여긴 API라 명시 코드)
async function requireAdmin(req, res, next) {
  const uid = readUserId(req);
  if (!uid) return res.status(401).json({ error: 'unauthorized' });
  const { rows } = await pool.query('SELECT email FROM users WHERE id = $1', [uid]);
  if (!isAdminEmail(rows[0]?.email)) return res.status(403).json({ error: 'forbidden' });
  req.adminUserId = uid;
  return next();
}

module.exports = { ADMIN_EMAILS, isAdminEmail, requireAdmin };
