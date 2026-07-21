// 멱등 마이그레이션 · schema.sql(IF NOT EXISTS) + seed.sql(ON CONFLICT DO NOTHING).
// 실행: node db/migrate.js — 몇 번을 돌려도 결과 동일(완료 조건 검증 대상).
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(schema);
    await client.query(seed);
    await client.query('COMMIT');
    const { rows } = await client.query(
      `SELECT (SELECT count(*) FROM reviews) AS reviews, (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM gts_bookings) AS bookings`,
    );
    console.log('[migrate] 완료 ·', rows[0]);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[migrate] 실패:', e.message);
    process.exit(1);
  });
