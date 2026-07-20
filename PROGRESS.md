# PROGRESS.md — Bomnae Helper 진행 상태

> 갱신 규칙: 각 프롬프트 완료 시 + 컨텍스트 85% 도달 시. 재시작 세션은 이 파일을 먼저 읽는다.

## 상태

| PHASE | 담당 | 상태 | 커밋 |
|---|---|---|---|
| 0 SETUP | 단독 | ✅ 완료 (2026-07-20) | 미커밋 — git 저장소 미초기화 |
| 1A 기반 | AGENT-1 | ✅ 완료 (2026-07-20) | 미커밋 — git 저장소 미초기화 |
| 1B Gate·Home | AGENT-2 | ⬜ 대기 | |
| 1B Loop | AGENT-3 | ⬜ 대기 | |
| 2 검증·조립 | AGENT-REVIEW | ⬜ 대기 | |
| 3 서버 | AGENT-SERVER | ⬜ 대기 | |

## 진행 중 작업

- 없음

## 다음 작업

- git init + [A0]·[A1] 커밋 (사용자 승인 대기)
- CC_PROMPT_2_AGENT2_GATE / CC_PROMPT_3_AGENT3_LOOP 실행 (1A 완료로 병렬 가능)

## AGENT-1 인수인계 노트 (AGENT-2/3 필독)

- api.js는 전부 async — 페이지에서 항상 await로 호출할 것(PHASE 3 fetch 교체 대비).
- api.js에 `getMeetingPoints()` 추가됨(티켓 미팅포인트 접근용 — 계약 외 추가라 사용자 확인 대기).
- Chip에 `disabled` prop 있음(PATTERNS §5 만석 회차 근거). IconButton에는 disabled 없음 — Stepper는 클램프로 처리.
- StatusBadge: WCAG AA 때문에 green/yellow 배경 + ink 텍스트, closed는 surface+inkMeta로 구현.
- 명세 고정 치수(44/56/72px, dialog 560px, 컨테이너 캡)는 전부 tailwind.config.js에서 클래스로 제공
  (h-44/h-56/h-72, max-w-lg=1200/max-w-2xl=1400/max-w-3xl=1560/max-w-dialog=560, h-px=1px).
  컴포넌트 파일에 px 직입력 금지 유지. 예외 1곳: VideoPlayer 자막 text-[17px](DESIGN §12 명세값, PATTERNS §10 기준 구현).
- gateRoutes terminal 키: 't1'|'t2'|'gmp' — GateForm select value 동일하게 맞출 것.

## 사용자 준비물 (블로커 — 코드 진행과 무관하게 병행)

- [ ] 봄내크루 원본 에셋 (배경 제거본) → `client/public/images/crew/`
- [ ] Google OAuth 클라이언트 ID/Secret (PHASE 3 전까지)
- [ ] Neon DATABASE_URL (PHASE 3 전까지)
- [ ] 히어로 실사진 — 텍스트 없는 실사 (3~4일차 촬영)
- [ ] 사장님 스토리 클립 (3~4일차 촬영)
- [ ] 파일럿 운행 촬영 — 차내 클립 시청 장면 / 도착 즉시 감자빵 (3~4일차)
- [ ] 정류장 GPS 실좌표 수집 (3~4일차 현장에서 핀 찍기 → stops.js 교체)
- [ ] 라인 가격·회차 확정 (5일차 BM 검토)
- [ ] 서비스명 영문 표기 최종 확정 (Bomnae Helper 유지 여부)
- [ ] unDraw 일러스트 3종(login/404/빈결과) primary 단색 재컬러 SVG → `client/public/images/illustrations/` (현재 img 경로만 참조 중)

## 사고 이력 / 교훈

- (이전 창 계승) CC 프롬프트 전체를 한 번에 붙이면 에이전트가 범위를 섞는다 — 반드시 한 프롬프트씩.
- (이전 창 계승) 세션 정체성(어느 AGENT인지) 프롬프트에 명시.
- (이전 창 계승) 스텁은 "확장(교체 아님), 기준은 명세 문서" 단서 필수.
- (v3) 구 sloverthon 마커의 scale hover는 화이트리스트 위반 — 사이즈 스텝+펄스 링으로 대체함 (PATTERNS §4).
- (PHASE 0) @vitejs/plugin-react@6은 vite@8 요구 → vite@^5 + plugin-react@^4로 고정함.
- (PHASE 0) express는 무버전 스펙이라 5.x가 설치됨 — PHASE 3 라우트 작성 시 Express 5 문법 기준(와일드카드 라우트 등 4와 다름).
- (PHASE 0) tailwind colors를 tokens로 전면 교체하면서 white/transparent 2값만 명세 근거(DESIGN §6·§7·§8, PATTERNS §10)로 추가함.
- (1A) 임베디드 브라우저 페인은 ① 프로그래매틱/키보드 스크롤이 scroll 이벤트를 발화하지 않고 ② 격리 월드 dispatch가 페이지 리스너에 닿지 않으며 ③ 비활성 시 rAF가 실행되지 않는다 — 스크롤/rAF 계열 검증은 페이지 월드 script 주입 + rAF 심으로 수행할 것. 코드 자체는 PATTERNS §2 rAF 스로틀 유지(실브라우저 표준 동작).
- (1A) departures 시드는 3~12 범위로 고정해 명세 미정의 구간(booked<3)을 만들지 않음. 폴백은 likely.
