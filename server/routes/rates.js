// [V12] GET /api/rates · 서버 메모리 캐시(6시간 갱신)를 그대로 전달. 캐시 없으면 rates:null(클라가 환산 숨김).
const express = require('express');
const { getRates } = require('../services/rates');

const router = express.Router();

router.get('/rates', (req, res) => {
  res.set('Cache-Control', 'public, max-age=1800'); // 클라 30분 캐시 힌트(서버 6시간과 별개)
  const c = getRates();
  if (!c) return res.json({ base: 'KRW', rates: null, updatedAt: null });
  res.json(c);
});

module.exports = router;
