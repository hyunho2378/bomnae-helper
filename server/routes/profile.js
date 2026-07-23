// [V10] 프로필 · 프로필 사진 Vercel Blob 업로드(서버 경유 · 토큰 비노출).
//   클라는 이미지 원본 바이트를 raw body로 POST — express.raw로 Buffer 수신(multer 등 추가 의존 회피).
//   5MB 상한 · image/* 4종만 허용 · 업로드 후 users.avatar 갱신(구글 picture와 동일 컬럼 재사용).
const express = require('express');
const { put } = require('@vercel/blob');
const pool = require('../db/pool');
const { readUserId } = require('../lib/session');

const router = express.Router();

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

// express.raw · 이미지 4종만 파싱(그 외 content-type은 여기서 body 미파싱 → 아래 415).
//   limit 초과분은 body-parser가 413으로 선차단(클라도 업로드 전 5MB 선검증 — 이건 백스톱).
const rawImage = express.raw({ type: Object.keys(EXT), limit: MAX_BYTES });

router.post('/profile/avatar', rawImage, async (req, res) => {
  try {
    const uid = readUserId(req);
    if (!uid) return res.status(401).json({ error: 'unauthorized' });
    const contentType = req.headers['content-type'];
    const ext = EXT[contentType];
    if (!ext) return res.status(415).json({ error: 'unsupported_type' }); // 이미지 아님
    if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'empty' });
    if (req.body.length > MAX_BYTES) return res.status(413).json({ error: 'too_large' });
    if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({ error: 'blob_unconfigured' });
    const blob = await put(`avatars/user-${uid}.${ext}`, req.body, {
      access: 'public',
      contentType,
      addRandomSuffix: true, // 유저별 재업로드 충돌·CDN 캐시 무효화
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [blob.url, uid]);
    return res.json({ avatar: blob.url });
  } catch (e) {
    console.error('[profile] avatar 실패:', e.message);
    return res.status(500).json({ error: 'upload_failed' });
  }
});

module.exports = router;
