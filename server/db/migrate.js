// 멱등 마이그레이션 · schema.sql(IF NOT EXISTS) + seed.sql(ON CONFLICT DO NOTHING).
// 실행: node db/migrate.js — 몇 번을 돌려도 결과 동일(완료 조건 검증 대상).
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./pool');
const mockReviews = require('./mockReviews'); // [V11] 목업 리뷰 100건(생성기 산출물)

// [V11] 목업 리뷰 100건 멱등 시드 · id 고정('rvm-001'..) + ON CONFLICT DO NOTHING · mock=true, user_id=NULL.
//   국적 분산·별점 분포는 mockReviews.js 상단 주석 참조. 재실행해도 중복 삽입 없음.
async function seedMockReviews(client) {
  for (const r of mockReviews) {
    // eslint-disable-next-line no-await-in-loop
    await client.query(
      `INSERT INTO reviews (id, user_id, author_label, country, course_label_key, rating, title, body, lang, mock, seed_likes, created_at)
       VALUES ($1, NULL, $2, $3::jsonb, $4, $5, $6, $7, $8, true, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.author_label, JSON.stringify(r.country), r.course_label_key, r.rating, r.title, r.body, r.lang, r.seed_likes, r.created_at],
    );
  }
}

// [V4] 시연 관리자 계정 멱등 시드 · PIN은 bcrypt 해시로만 저장(평문 금지).
//   username 충돌 시 DO NOTHING(재실행해도 재해시·중복 없음). name 갱신은 하지 않음(불변 시드).
async function seedAdminUser(client) {
  const pinHash = bcrypt.hashSync('mardoto!02', 10); // 매 실행 새 salt이나 삽입은 1회뿐(ON CONFLICT)
  await client.query(
    `INSERT INTO users (username, pin_hash, name) VALUES ('minwoo', $1, 'Minwoo')
     ON CONFLICT (username) DO NOTHING`,
    [pinHash],
  );
}

async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(schema);
    await client.query(seed);
    await seedAdminUser(client); // [V4] minwoo 관리자
    await seedMockReviews(client); // [V11] 목업 리뷰 100건
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
