# PROGRESS.md — Bomnae Helper 진행 상태

> 갱신 규칙: 각 프롬프트 완료 시 + 컨텍스트 85% 도달 시. 재시작 세션은 이 파일을 먼저 읽는다.

## 상태

| PHASE | 담당 | 상태 | 커밋 |
|---|---|---|---|
| 0 SETUP | 단독 | ✅ 완료 (2026-07-20) | 미커밋 — git 저장소 미초기화 |
| 1A 기반 | AGENT-1 | ✅ 완료 (2026-07-20) | 미커밋 — git 저장소 미초기화 |
| 1B Gate·Home | AGENT-2 (서브에이전트) | ✅ 완료 (2026-07-21) | 01606a6 [A2] |
| 1B Loop | AGENT-3 (서브에이전트) | ✅ 완료 (2026-07-21) | 1463f05 [A3] |
| 2 검증·조립 | AGENT-REVIEW (오케스트레이터) | ✅ 완료 (2026-07-21) | [AR] 커밋 예정 |
| 3 서버 | AGENT-SERVER | ⬜ 대기 (.env 필요 — 이번 세션 제외) | |

## 진행 중 작업

- 없음

## v4 GTS 피벗 (2026-07-21)

| 커밋 | 내용 |
|---|---|
| [D1] | GTS 시드 데이터 격리 세션: `data/gts/` 3파일 — hubs(§29 허브 6·도착점 2·템플릿 7, durMin 11건 전부 PLACEHOLDER), vehicles(§9.3 결정론 매칭 + 요금 5건 전부 DRAFT), venues(카테고리당 12 = 실명 11 + Mockup 25, 3언어 동형·목업 coord null). 창작 실명 0, 시각표·편명 0 |
| [D2] | 존 A4 셸: /gts 4라우트 + /gts(=setup), 리다이렉트 5종(/loop*→/gts, /hands-free·/gate/hands-free→/gts/setup, /pilot→/about), GtsContext(§31 파생 vehicle·가드 캐스케이드 실검증), 내비 3항목(헤더·독·푸터 동일), i18n gts 뼈대(freq 3키)+nav/meta 키, 구 loop 15파일 DEPRECATED(삭제 0) |
| [D3] | 존 B4 PLANNER: 양방향 플래너(토글 시 DOM 불변 실측), hubs.js 조회 전용 결과(임의 HH:MM 0, 빈 조합 EmptyState 5종), RouteTimeline §28 세로(GateJourney·CSS 완전 삭제, grep 0), 현위치 §21 동형 모달, gate.planner 3언어 +25키 |
| [D4] | 존 C4 BUILDER: setup 매칭(4케이스 규칙 일치·CarFront/Bus 실존 확인), build 3스텝(VenueGrid §30 — 2/3/4열·로테이션 중 선택 보존·cap 초과 자동 해제 없음·순서 배지), route ItineraryMap §32(번호핀·draw-on·fitBounds·목업 coord null 시 리스트 폴백), checkout §33(1뷰·하차 필수·프로토타입 Dialog·LoginGate·스탬프), Ticket GTS 모드, data/gts/api.js 목 창구(api.js 원본 미수정), gts 3언어 74키 |
| [DR] | 검수: 임의 시각 정규식 신규 코드 0 / DEPRECATED 라이브 참조 0(주석·CSS 재사용 3건은 판정 무해) / 3언어 527키 동형 / HEX·localStorage·select·이모지·blur 신규·font-normal 전부 0 / 매트릭스 320·1280·3840 가로 스크롤 0·캡 1800·그리드 2→4열 / E2E: 게이트 양방향 + setup→build→route→checkout→ticket 전 구간 브라우저 통과 / gateRoutes.js 소비자 0 → DEPRECATED 주석 |

### v4.1 크래프트 패스 (2026-07-21 · [E1] 커밋 대기)

- tokens.motion v4.1 동기화(easeOut/easeInOut/easeDrawer/spring + 120/180/160/280/360ms), tailwind 이징·지속 토큰 재편(ease-in 유틸리티 미생성), 구 320ms·ease-spring 전수 재매핑(시트→drawer/sheet, Dock 모핑·스탬프만 spring 존속).
- §34: .pressable(Button·IconButton·Chip·캘린더 셀·LineCard·VenueGrid 카드) 120ms/0.97 + 팝 5면(FieldSelect·LangMenu·CalendarField·StopPopup·Dialog) origin-aware 0.97→1 진입·@starting-style·usePopExit 퇴장 역재생.
- §17.1: 키보드 개시 팝(ArrowDown/Enter/Escape/detail 0 클릭)은 pop-instant 무애니메이션 — 브라우저 검증(키보드 즉시 1/Escape 즉시 unmount/마우스 진입·역재생).
- §35: Header·GlassDock .chrome(0.72+blur20 saturate180+빛 맺힘), 헤더 스크롤 엣지 페이드(마스크 점진 블러·스크롤 0 비표시), 접근성 3신호(motion/transparency/contrast) 분기.
- §36: BottomSheet 드래그 물리(motion 1개 의존 신규) — 1:1·오프셋 존중·러버밴드·모멘텀 투영·속도 인계 스프링·재터치 인터럽트·reduced 크로스페이드. 판정 산식 node 4케이스 검증.
- §17.5: 크기별 트래킹(-0.02/-0.01/0/+0.01)·행간(1.1/1.5) base 기본값, 전역 단일 letter-spacing 없음 확인.
- 검수 도구 발견 사항: Tailwind @layer 내 @starting-style 내부 규칙 복제 버그(레이어 밖 배치로 수리), 임베디드 프리뷰의 rAF·scroll 이벤트 미발화는 환경 아티팩트로 판정(실기기 무관).
- 미결: LinePreviewOverlay(DEPRECATED·미라우트)에는 §36 물리 미적용 — 재활성 시 BottomSheet 물리 재사용 전제. GTS 티켓 PNG 공유와 동일하게 재활성 세션 몫.

### v4 검수 판정·미결 기록
- StopPopup 2줄 조건화(존 C4 보고): onViewLine 부재 시 버튼 비렌더 — Loop 호출부 영향 0 판정, 수용.
- ArrivalCard가 From Chuncheon 탭에서도 렌더(구조 동형 우선, 존 B4 결정) — 의미상 To 전용이 맞는지 사용자 판단 대기.
- 결제 완료 후 GtsContext reset 미호출(Booking 선례 동일) — 재조립 UX 확정 필요.
- Ticket GTS 모드 PNG 공유 미구현(§7은 라인 티켓 명세 — GTS 공유는 후속 결정).
- 서버 gts_bookings 확장은 다음 서버 세션 몫(§9.6.4 스키마 메모만 존재).

## 다음 작업

- CC_PROMPT_5_AGENT_SERVER 실행 (전제: .env — Google OAuth ID/Secret + Neon DATABASE_URL)
- 사용자 결정 대기 항목: PROGRESS "오케스트레이션 결정 사항" 참조

## v3.1 리디자인 (2026-07-21 · 오케스트레이터 + 존 B/C 서브에이전트)

| 커밋 | 내용 |
|---|---|
| db9ac4f [B1] | 파운데이션: i18n 3언어(en/ko/th) 네임스페이스 분할(365키 동형), Header(메뉴4·액티브 primary·상시 불투명)·LangMenu·FieldSelect·Footer(primary 4컬럼·법적 새 탭)·GlassDock 개정, 무보더 스윕(§16 4패턴 0), 줄표 스윕(주석·사전 전부, api/data는 주석만 — 승인 조건), 법적 페이지 2종, radius/shadow/blur v3.1 토큰 |
| 806a331 [B2] | 존 B: HeroCarousel(3장 크로스페이드·도트)·GateJourney·FieldSelect 3종(시간 24h 사전 라벨)·HandsFree 2컬럼+FAQ |
| 404acba [B3] | 존 C: 3레이어 라인+draw-on·셔틀 lerp 스무딩·StopPopup·글래스 라인 카드(마진 안)·LinePreviewOverlay·StickyBookPanel·Booking 단일 확인 페이지·About 11섹션(BRAND_COPY 이식)·Pilot 삭제 + 라우트 v3.1(/hands-free·/about·리다이렉트 2) |
| [BR] | 검수: 터미널 라벨 3언어 겹침(트리거 시프트 0), 구 hero.jpg 고아 제거, 매트릭스 10뷰포트×10라우트 100/100 |

### v3.1 검수 판정 기록
- EN↔KO 시프트: 홈·게이트·핸즈프리 0 / About는 가로 0·본문 높이 캐스케이드만(PATTERNS §1 장문 허용 영역).
- EN↔TH: :lang(th) Kanit 스택(§18 명세)이 전체 서체 메트릭을 바꿔 폭 변동 발생 — 명세 간 상충의 구조적 결과로 허용 판정.
- max-w 잔존 4건은 전부 카드·일러스트 폭(텍스트 측정폭 아님): Ticket 카드 2, Booking 성공 래퍼 1, EmptyState 일러스트 1.
- 데이터 문자열 줄표 9건 잔존(gateRoutes 4·stops 5) — 사용자 조건(문자열 불변) 준수, 실촬영·확정 카피 교체 시 정리 대상.
- FieldSelect primary는 문자열 기본 + 겹침 렌더 노드 허용(날짜·터미널) — 계약 문서화 예외.
- StickyBookPanel sticky top은 §15의 top-24를 픽셀 스케일 환산(top-96 = 헤더 72+24)으로 적용.

## v3.2 리디자인 (2026-07-21 2차 크리틱 · 오케스트레이터 + 존 B2/C2 서브에이전트)

| 커밋 | 내용 |
|---|---|
| 8f471fd [C1] | 파운데이션: primary #0073EC·니어블랙 3단·SUIT Variable(Pretendard 폐지)·컨테이너 확폭(1320/1560/1800·마진 16/24/40)·헤더 80/64·17px 600·About 최좌측·모바일 상단 헤더 신설·모바일 독 깨짐 수리·푸터 2단 202px·표시명 교체(§16.7)·Button secondary·CalendarGrid·scroll-quiet·법적 위치 조항 3언어 |
| fade3ca [C2] | Getting Here: 현위치 옵션+최근접 공항 매칭+무음 폴백·CalendarField(§19)·크로스셀 삭제·Optional 배지·ArrivalWatcher 상태기 7종(§21 · 사전 설명 모달 선행, 2연속 판정, 좌표 비노출)·ArrivalProvider 전역 배선 |
| 5ab8d3f [C3] | City Lines: 초기 라인 0+칩 3(§24)·§23 지도 수술 6항목(줌 20회 무아티팩트)·hover 즉시 팝업(200ms 유지)·POI 앵커 3·scroll-quiet·모바일 카드 ≤132px·2개월 캘린더+원색 도트 범례+회차 전부 펼침(§20)·GateToLinesTransition(§22 · Escape 스킵) |
| [CR] | 검수: navy 잔재 3건 수리(Button hover·PilotStrip 면)·StoryClips 구 마진 4px 오버플로 수리·매트릭스 100/100·3언어 구조 동형 확인 |

### v3.2 검수 판정 기록
- 3언어 레이아웃 동형(§16.6): 4개 라우트에서 요소 수·태그 시퀀스 3언어 완전 동일, EN↔KO 좌표 0(About는 장문 세로 캐스케이드만·가로 0), TH x변동은 §18 Kanit 스택 메트릭 파생으로 허용(요소 재배치·조건부 노출 없음).
- 확정 판정: §20 gap-12 채택 / C2 패널 브래킷 2곳(산식 조합) / 전환 라벨 850ms 연출+1.5s 비차단 잔존 / 도착 모달은 Modal 래퍼(모바일 대응·COMPONENTS A4 정합) / denied "설정 다시 보기"=사전 설명 모달 재노출 / LineDetail 날짜 기본값 오늘.
- 도착 모달 본문 2문장은 IA 미지정으로 최소 창작(확정 카피 교체 대상), 크로스셀 키 3언어 제거.

## 사용자 준비물 (v3.1 추가)

- [ ] 히어로 실사진 3장 교체 (`client/public/images/hero-1..3.jpg` — 현재 무료 스톡)
- [ ] About Proof 지표 3종 실측값 (`[PLACEHOLDER]`)
- [ ] 태국어(th) 사전 전체 네이티브 검수 (기계 번역 초안 상태)
- [ ] 법적 문안 전문가 검토 (LEGAL_COPY 학생 초안 고지)

## 오케스트레이션 결정 사항 (PHASE 1B·2에서 확정 — 이견 시 되돌릴 것)

- i18n 사전은 공유 파일이라 서브에이전트가 fragment(소유 구역 내 임시 파일)로 납품 → 오케스트레이터가 병합 후 삭제. 최종 162키 en/ko 동형.
- 데이터 유래 텍스트(라인·정류장·미팅포인트명, 언어별 포맷 문자열)의 fit-content 렌더가 EN↔KR 시프트를 만들던 지점 12곳을 PATTERNS §1 겹침 마크업으로 수리(전 화면 시프트 0 달성). 신규 공용 컴포넌트는 만들지 않음(사용자 규칙).
- stories/pilot 데이터는 api.js에 접근자가 없어 페이지가 직접 import(사용자 "api.js 수정 금지" 규칙 우선; PHASE 3 API 목록에 stories/pilot 없음 — 정적 데이터 유지라 이관 영향 없음).
- 미팅포인트는 춘천역(첫 항목) 고정, 주말 가산은 성인·아동 좌석당 동일 적용(전부 DRAFT).
- 문서화된 명세값 예외 3곳: VideoPlayer text-[17px](DESIGN §12), Loop 패널 lg:w-[360px](IA §2.4), HeroSection min-height 인라인(DESIGN §5). LoopMap.css의 #fff 1곳은 PATTERNS §4 기준 구현.

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
- [ ] og-image.png (1200x630) 제작·배치 (`client/public/og-image.png` — index.html og:image가 이미 참조 중), 배치 후 카카오 캐시 초기화 도구로 갱신
- [ ] apple-touch-icon.png (180x180, 흰 배경 위 logo.svg 중앙 배치) 제작·배치 후 index.html 주석 해제
- [ ] GTS 허브 소요시간(durMin 11건)·배차 실측 검증 (`data/gts/hubs.js` — 전건 PLACEHOLDER)
- [ ] GTS 요금표 확정 (`data/gts/vehicles.js` — base/perPerson/luggageFee 5건 전부 DRAFT)
- [ ] GTS 실명 로컬 브랜드 추가 확보 — 목업 25슬롯(meal 11·foodspace 9·activity 5) 교체 + 실명 11곳 좌표 현장 검증 (`data/gts/venues.js`)

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
