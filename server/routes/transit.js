// 교통 프록시 · 지시 작업 4. 실패·키 미활성·비지원 조합은 { source:'fallback' } — 클라가 추정 표기 유지.
// 버스: 문서 근거 완전 구현(busService) · 열차: probe 채택 오퍼레이션(trainService).
// 지오 라벨: KAKAO_REST_KEY 있을 때만 활성(§39 — 부재 시 클라 "현재 위치" 고정 라벨).
const express = require('express');
const { queryBus } = require('../services/busService');
const { queryTrain } = require('../services/trainService');

const router = express.Router();

const fallback = (res, reason) => res.json({ source: 'fallback', reason });

router.get('/transit/bus', async (req, res) => {
  const { from = 'dongseoul', to = 'chuncheon-terminal', date } = req.query;
  try {
    const out = await queryBus(String(from), String(to), date ? String(date) : undefined);
    res.json(out);
  } catch (e) {
    console.error('[transit:bus] fallback:', e.message);
    fallback(res, e.message.slice(0, 120));
  }
});

router.get('/transit/train', async (req, res) => {
  const { from = 'yongsan', to = 'chuncheon-station', date } = req.query;
  try {
    const out = await queryTrain(String(from), String(to), date ? String(date) : undefined);
    res.json(out);
  } catch (e) {
    console.error('[transit:train] fallback:', e.message);
    fallback(res, e.message.slice(0, 120));
  }
});

router.get('/geo/label', async (req, res) => {
  const key = process.env.KAKAO_REST_KEY;
  if (!key) return fallback(res, 'no_kakao_key');
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat·lng 필수' });
  try {
    // 카카오 Local coord2address · 브라우저 직호출 금지(키 노출 방지 — PATTERNS §39)
    const r = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${encodeURIComponent(lng)}&y=${encodeURIComponent(lat)}`,
      { headers: { Authorization: `KakaoAK ${key}` } },
    );
    const json = await r.json();
    const doc = json?.documents?.[0];
    const label = doc?.address?.address_name ?? null;
    if (!label) return fallback(res, 'no_result');
    res.json({ source: 'live', label });
  } catch (e) {
    fallback(res, e.message.slice(0, 120));
  }
});

module.exports = router;
