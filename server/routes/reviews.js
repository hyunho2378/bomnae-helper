// Reviews API · IA §10.8 승격(reviews·review_likes) · 좋아요 = 세션 키 1회, 재요청 시 취소.
const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');
const { ensureAnonKey } = require('../lib/session');
const { resolveUserId } = require('./auth');

const router = express.Router();

// 클라 data/reviews.js 시드 모양과 동일한 응답(프론트 카드 계약 유지)
const LIST_SQL = `
  SELECT r.id, r.rating, r.lang, r.title, r.body,
         r.author_label AS initials, r.country, r.course_label_key AS "courseKey",
         to_char(r.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS date,
         r.mock,
         (r.seed_likes + COALESCE(l.cnt, 0))::int AS likes,
         COALESCE(mine.liked, false) AS liked
  FROM reviews r
  LEFT JOIN (SELECT review_id, count(*) AS cnt FROM review_likes GROUP BY review_id) l ON l.review_id = r.id
  LEFT JOIN (SELECT review_id, true AS liked FROM review_likes WHERE session_key = $1) mine ON mine.review_id = r.id
`;

router.get('/reviews', async (req, res) => {
  const key = ensureAnonKey(req, res);
  const sort = req.query.sort === 'likes' ? 'likes DESC, date DESC' : 'date DESC, id DESC';
  const { rows } = await pool.query(`${LIST_SQL} ORDER BY ${sort}`, [key]);
  res.json({ reviews: rows });
});

router.post('/reviews', async (req, res) => {
  try {
    const { rating, body, title, country, courseKey, lang, initials } = req.body ?? {};
    const r = Number(rating);
    if (!Number.isInteger(r) || r < 1 || r > 5) return res.status(400).json({ error: 'rating 1~5' });
    if (!body || !String(body).trim()) return res.status(400).json({ error: 'body 필수' });
    if (!country || typeof country !== 'object') return res.status(400).json({ error: 'country 객체' });
    if (!courseKey) return res.status(400).json({ error: 'courseKey' });
    const userId = await resolveUserId(req);
    const id = `rv-${crypto.randomBytes(4).toString('hex')}`;
    await pool.query(
      `INSERT INTO reviews (id, user_id, author_label, country, course_label_key, rating, title, body, lang, mock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false)`,
      [id, userId, String(initials || 'D.T.'), JSON.stringify(country), String(courseKey), r, String(title ?? ''), String(body), String(lang || 'en')],
    );
    const key = ensureAnonKey(req, res);
    const { rows } = await pool.query(`${LIST_SQL} WHERE r.id = $2`, [key, id]);
    res.status(201).json({ review: rows[0] });
  } catch (e) {
    console.error('[reviews] 게시 실패:', e.message);
    res.status(500).json({ error: 'internal' });
  }
});

// 좋아요 토글 · unique(review_id, session_key) — 존재하면 취소(지시 작업 3)
router.post('/reviews/:id/like', async (req, res) => {
  const key = ensureAnonKey(req, res);
  const id = String(req.params.id);
  const del = await pool.query('DELETE FROM review_likes WHERE review_id = $1 AND session_key = $2', [id, key]);
  let liked = false;
  if (del.rowCount === 0) {
    try {
      await pool.query('INSERT INTO review_likes (review_id, session_key) VALUES ($1, $2)', [id, key]);
      liked = true;
    } catch (e) {
      if (e.code === '23503') return res.status(404).json({ error: 'not_found' }); // FK 위반 = 없는 리뷰
      throw e;
    }
  }
  const { rows } = await pool.query(
    `SELECT (seed_likes + (SELECT count(*) FROM review_likes WHERE review_id = $1))::int AS likes FROM reviews WHERE id = $1`,
    [id],
  );
  if (!rows.length) return res.status(404).json({ error: 'not_found' });
  res.json({ liked, likes: rows[0].likes });
});

module.exports = router;
