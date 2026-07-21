// pg Pool 단일 인스턴스 · DATABASE_URL(Neon)은 URL에 sslmode 포함 전제.
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon 등 관리형 PG: URL sslmode와 무관하게 TLS 강제(로컬 PG면 PGSSLMODE=disable로 우회 가능)
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  max: 5,
});

module.exports = pool;
