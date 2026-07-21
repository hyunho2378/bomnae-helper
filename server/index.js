// 서버 v1 · [G1] — Auth(데모 모드)·GTS 예약·리뷰·교통 프록시.
// CORS: CLIENT_ORIGIN + http://localhost:5173 만, credentials(지시 작업 6).
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { router: authRouter } = require('./routes/auth');
const gtsRouter = require('./routes/gts');
const reviewsRouter = require('./routes/reviews');
const transitRouter = require('./routes/transit');

const app = express();
app.set('trust proxy', 1); // Render 등 프록시 뒤 secure 쿠키

const allowed = new Set(['http://localhost:5173', process.env.CLIENT_ORIGIN].filter(Boolean));
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowed.has(origin)),
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRouter);
app.use('/api', gtsRouter);
app.use('/api', reviewsRouter);
app.use('/api', transitRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Bomnae Helper server listening on port ${PORT}`);
  // TAGO ID 캐시 워밍(지시 2: 기동 시 1회 · 실패해도 서버는 산다 — 해당 기능만 fallback)
  try {
    const { ensureIds } = require('./services/busService');
    await ensureIds();
  } catch (e) {
    console.error('[tago:bus] ID 캐시 실패(버스는 fallback):', e.message);
  }
  try {
    const { ensureTrainIds } = require('./services/trainService');
    await ensureTrainIds();
  } catch (e) {
    console.error('[tago:train] ID 캐시 실패(열차는 fallback):', e.message);
  }
});
