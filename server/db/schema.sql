-- 스키마 v4 · IA §9.6(gts_bookings) + §10.8(reviews·review_likes) + users.
-- 전부 IF NOT EXISTS — migrate.js가 반복 실행해도 멱등.

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  google_sub  TEXT UNIQUE,            -- 데모 유저는 NULL 허용
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  avatar      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gts_bookings (
  id           SERIAL PRIMARY KEY,
  code         CHAR(6) NOT NULL UNIQUE,
  user_id      INTEGER REFERENCES users(id),
  party        INTEGER NOT NULL CHECK (party BETWEEN 1 AND 12),
  luggage      BOOLEAN NOT NULL DEFAULT false,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('taxi', 'van')),
  meal_plan    TEXT NOT NULL CHECK (meal_plan IN ('none', 'lunch', 'lunchDinner')),
  picks        JSONB NOT NULL,        -- §9.6: 순서 보존 배열(meals+picks 방문 순서 · itinerary)
  dropoff_text TEXT NOT NULL,
  pay_method   TEXT,
  total        INTEGER NOT NULL,      -- 서버 재계산 값(클라 총액 신뢰 금지)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- reviews.id 는 TEXT: 시드('rv-01'..)와 신규('rv-xxxxxx')가 같은 키 공간 — 시드 멱등 upsert 근거.
-- title·seed_likes 는 지시 스키마 외 최소 추가(명세 밖 결정 · 보고):
--   title = 시드 문안 그대로 이관 계약에 필요, seed_likes = 시드 likes 카운트 보존(집계 = seed_likes + count(review_likes)).
CREATE TABLE IF NOT EXISTS reviews (
  id               TEXT PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id),  -- 시드는 NULL
  author_label     TEXT NOT NULL,                 -- 이니셜(예: 'S.W.')
  country          JSONB NOT NULL,                -- {en,ko,th} 표기 객체(클라 데이터 모양 그대로)
  course_label_key TEXT NOT NULL,                 -- i18n reviews.course.* 키
  rating           INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title            TEXT NOT NULL DEFAULT '',
  body             TEXT NOT NULL,
  lang             TEXT NOT NULL,
  mock             BOOLEAN NOT NULL DEFAULT false,
  seed_likes       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS review_likes (
  review_id   TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (review_id, session_key)
);

CREATE INDEX IF NOT EXISTS idx_gts_bookings_code ON gts_bookings(code);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- [V1] 여정 트래킹 · 검증 스프린트(증거 엔진)
CREATE TABLE IF NOT EXISTS journey_events (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  session_id  UUID NOT NULL,
  step        TEXT NOT NULL CHECK (step IN ('login','setup','meal_plan','meals','picks','route_confirm','pay_method','complete')),
  payload     JSONB NOT NULL DEFAULT '{}',
  duration_ms INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS journey_events_user_idx ON journey_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS journey_events_created_idx ON journey_events (created_at DESC);

-- [V3] 빌더 여행 날짜(당일 허용 · 클라 CalendarField §19) — 멱등
ALTER TABLE gts_bookings ADD COLUMN IF NOT EXISTS travel_date DATE;

-- [V3] journey_events.step 에 log_template 추가(Travel Log 템플릿 적용 계측) —
-- 인라인 CHECK 재정의: DROP 후 ADD(매 migrate 실행 시 동일 결과 · 멱등 효과)
ALTER TABLE journey_events DROP CONSTRAINT IF EXISTS journey_events_step_check;
ALTER TABLE journey_events ADD CONSTRAINT journey_events_step_check
  CHECK (step IN ('login','setup','meal_plan','meals','picks','route_confirm','pay_method','complete','log_template'));

-- [V4] ID/PIN 계정 병행 · 구글 유저(email 有)와 ID 유저(username+pin) 공존 — 전부 멱등.
--   email NOT NULL 해제: ID 유저는 email NULL 허용(구글 유저는 여전히 값 有).
--   username UNIQUE(부분 인덱스 아님 · NULL 다중 허용은 표준 UNIQUE 동작) · pin_hash = bcrypt 문자열만.
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- [V5-frictionless] 검증용 무마찰 결제: 하차 지점 미입력 허용 → dropoff_text NULL 저장 가능(멱등).
--   pay_method는 이미 nullable. 재필수화는 서버 REQUIRE_DROPOFF/REQUIRE_PAYMETHOD env로 복원(스키마 불변).
ALTER TABLE gts_bookings ALTER COLUMN dropoff_text DROP NOT NULL;

-- [V7] 시간제 이용권 요금 체계 · 전부 멱등. 기존 행은 pass_type NULL 허용(티켓 "Not specified").
--   consent_at = 환불 규정 동의 시각(동의 없으면 예약 불가라 신규 행은 항상 값 有).
ALTER TABLE gts_bookings ADD COLUMN IF NOT EXISTS pass_type TEXT;
ALTER TABLE gts_bookings ADD COLUMN IF NOT EXISTS pass_amount INTEGER;
ALTER TABLE gts_bookings ADD COLUMN IF NOT EXISTS luggage_amount INTEGER;
ALTER TABLE gts_bookings ADD COLUMN IF NOT EXISTS total_amount INTEGER;
ALTER TABLE gts_bookings ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key') THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;
