// PHASE 0 최소 부트스트랩 — 라우트·미들웨어는 PHASE 3(AGENT-SERVER)에서 추가한다.
const express = require('express');

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Bomnae Helper server listening on port ${PORT}`);
});
