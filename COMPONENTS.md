# COMPONENTS.md — Bomnae Helper 컴포넌트 인벤토리 v3

전 컴포넌트 JSX(JavaScript). 여기 없는 컴포넌트는 만들지 않는다.
props 계약은 병렬 에이전트 간 인터페이스다 — **임의 변경 금지, 변경 필요 시 질문 후 대기.**
반응형 표기: 모든 컴포넌트는 320~3840 대응이 기본이며, 별도 표기는 변형이 있는 경우만.

## A. 기반 (AGENT-1)

### A1. 컨텍스트 · i18n
| 파일 | 스펙 |
|---|---|
| `src/tokens.js` | 루트의 tokens.js를 그대로 복사 배치. 수정 금지 |
| `src/i18n/en.js` `src/i18n/ko.js` | 사전. 키 완전 동형. 중첩 객체(`nav.gate`, `booking.cta` …) |
| `src/i18n/LangContext.jsx` | `LangProvider`, `useLang()` → `{ lang:'en'|'ko', setLang, t(key) }`. in-memory, 기본 'en'. t는 키 미존재 시 키 문자열 반환 + console.warn |
| `src/i18n/LangSwap.jsx` | props: `k`(사전 키), `as`(태그, 기본 span), `className`. 두 언어를 같은 grid 셀에 겹쳐 렌더, 비활성 언어 `invisible` — 레이아웃 시프트 0 (PATTERNS §1) |
| `src/context/AuthContext.jsx` | `AuthProvider`, `useAuth()` → `{ user:null|{name,email}, login(), logout() }`. PHASE 1은 목(login = 목 유저 세팅). PHASE 3에서 서버 연동으로 내부만 교체(인터페이스 불변) |
| `src/context/BookingContext.jsx` | 게스트 예약 초안 in-memory: `{ draft, setDraft, reset }`. draft = `{lineId, date, time, adults, children}` |

### A2. 데이터 (전부 목 — PHASE 3에서 API로 교체, shape 불변)
| 파일 | 스펙 |
|---|---|
| `src/data/lines.js` | IA §4 shape. 3개 라인. 가격 DRAFT 주석 |
| `src/data/stops.js` | 라인별 3개 정류장 + 미팅포인트 2개(춘천역·남춘천역). **전 좌표 `// PLACEHOLDER — verify on site`** |
| `src/data/departures.js` | `getDepartures(lineId, date)` → 회차 3개(10:00/13:00/16:00), capacity 12, booked_count 랜덤 고정 시드, status 규칙: booked≥6 confirmed, ≥3 likely, 만석 closed |
| `src/data/gateRoutes.js` | `planGate({terminal, date, time})` → 옵션 배열. 룰: 도착시각+60분 버퍼 후 첫 탑승 편 계산. 시간표 DRAFT 상수 + PLACEHOLDER 주석 |
| `src/data/stories.js` | 감자밭(이미소·이청강 서사 요약) 포함 정류장별 스토리 메타 |
| `src/data/pilot.js` | 지표 3개 + 갤러리 항목. PLACEHOLDER |
| `src/data/api.js` | 데이터 접근 단일 창구: `getLines()`, `getLine(id)`, `getStops(lineId)`, `getDepartures()`, `createBooking(payload)`(목: 6자 코드 생성 후 in-memory 저장), `getBooking(id)`, `createHandsFree(payload)`. **모든 페이지는 api.js만 호출** — PHASE 3 교체 지점 |

### A3. 레이아웃 · 내비
| 파일 | props / 스펙 |
|---|---|
| `src/components/layout/PageLayout.jsx` | Header + `<Outlet/>` + GlassDock(<lg) + Footer. `/loop`에서 Footer 숨김 |
| `src/components/layout/Container.jsx` | `size:'lg'\|'2xl'\|'3xl'`(기본 자동: DESIGN §5 캡 규칙), children. 마진 규칙 내장 |
| `src/components/layout/Section.jsx` | `id`, `eyebrow`(사전 키), `title`(사전 키), children. eyebrow=caption 500 대문자 자간+, title=h2 |
| `src/components/nav/Header.jsx` | lg+ 전용. 스크롤 glass 72→56 (PATTERNS §2). 메뉴 3 + LangToggle + 로그인 IconButton(user 있으면 이니셜 원형) |
| `src/components/nav/GlassDock.jsx` | <lg 전용. DESIGN §6 + PATTERNS §3 명세 그대로. 접힘 56px pill / 확장 메뉴+언어+로그인. 포커스 트랩, Escape, 라우트 변경 수축 |
| `src/components/nav/Footer.jsx` | navy 풀블리드. 상단 1px 라인 3색 스트라이프. 크레딧·언어·법적 고지 |
| `src/components/nav/LangToggle.jsx` | EN/KR 세그먼트. 44px 타깃 |

### A4. UI 프리미티브
| 파일 | props / 스펙 |
|---|---|
| `src/components/ui/Button.jsx` | `variant:'primary'\|'ghost'`, `size:'md'\|'lg'`, `as`(Link 지원), `disabled`. DESIGN §7 |
| `src/components/ui/IconButton.jsx` | `icon`(lucide 컴포넌트), `label`(사전 키 — aria-label+툴팁), `size:16\|20\|24`, `onClick`. 44px 히트영역 |
| `src/components/ui/Chip.jsx` | `active`, `onClick`, children. 필터/탭용 |
| `src/components/ui/StatusBadge.jsx` | `status:'confirmed'\|'likely'\|'closed'`. 색: green / yellow+ink / inkMeta. 라벨 사전 키 `status.*` |
| `src/components/ui/Stepper.jsx` | `value`, `min`, `max`, `onChange`, `label`(사전 키). IconButton(-,+) + 숫자 Kanit 600 |
| `src/components/ui/BottomSheet.jsx` | `open`, `onClose`, `title`, children. <lg 전용. blur 3/3, shadow 2/2, 그랩바, 스와이프다운·바깥탭·Escape 닫기, 포커스 트랩 |
| `src/components/ui/Dialog.jsx` | 같은 props. lg+ 전용, 중앙 max-w 560. **Sheet/Dialog 선택은 `src/components/ui/Modal.jsx` 래퍼가 뷰포트로 자동 분기** — 페이지는 Modal만 사용 |
| `src/components/ui/EmptyState.jsx` | `illustration`(파일명), `titleKey`, `bodyKey`, `cta:{labelKey,to}` |
| `src/components/ui/VideoPlayer.jsx` | `src`, `poster`, `captionKey`. muted autoplay playsInline loop + 상시 자막 밴드(DESIGN §12) |
| `src/components/ui/Skeleton.jsx` | `className`. surface 배경 펄스(reduced-motion 시 정지) |
| `src/components/ui/LoginGate.jsx` | Modal 내부: unDraw 단색 + "Sign in to confirm" + Google 버튼(useAuth.login). 성공 시 `onSuccess` 콜백 |

## B. Gate · Home (AGENT-2)

| 파일 | 스펙 |
|---|---|
| `src/pages/Home.jsx` | IA §2.1 섹션 순서 고정. 섹션 컴포넌트는 `src/components/home/` 하위 |
| `src/components/home/HeroSection.jsx` | 풀블리드, display 타이포, scrim(그라데이션 예산 1/1), CTA 2. min-height clamp(560px,72vh,960px) |
| `src/components/home/ProblemStrip.jsx` | 숫자 "4 / 5" Kanit Bold display + 리서치 문장 |
| `src/components/home/GateEntryCard.jsx` | 터미널 select + 시간 input → navigate(`/gate?…`) |
| `src/components/home/LinesPreview.jsx` | LineCard ×3 그리드(1→2→3열) |
| `src/components/home/LineCard.jsx` | props `line`. 라인 컬러 상단 스트라이프 4px, 캐릭터 이미지, 정류장 3, 소요·가격. hover 보더 primary + translateY(-2px) |
| `src/components/home/HowItWorks.jsx` | 3스텝. 번호는 실제 순서이므로 숫자 마커 허용 |
| `src/components/home/PilotStrip.jsx` | 썸네일 + 카피 + Link |
| `src/pages/Gate.jsx` | IA §2.2. 쿼리 프리필. 결과 영역 aria-live="polite" |
| `src/components/gate/GateForm.jsx` | terminal/date/time. 제출 → `planGate` 호출 결과 상위로 |
| `src/components/gate/RouteOptionCard.jsx` | props `option`, `selected`, `onSelect`. 총 소요·요금·환승 수·첫 탑승 편 |
| `src/components/gate/RouteStepList.jsx` | props `legs`. leg = 사진 + 방향 문장 + 소요. 수직 타임라인(라인 컬러 아님 — primary) |
| `src/components/gate/HandsFreeCard.jsx` | 크로스셀 → /gate/hands-free |
| `src/pages/HandsFree.jsx` | IA §2.3. 폼 → 요금 합계 → 확정(LoginGate) → `createHandsFree` → 접수 코드 화면 |

## C. Loop (AGENT-3)

| 파일 | 스펙 |
|---|---|
| `src/pages/Loop.jsx` | 풀블리드 LoopMap + LinePanel(데스크탑 좌측 white 패널 360px / 모바일 하단 시트형 고정 리스트). 패널이 지도 대체 접근 경로 |
| `src/components/map/LoopMap.jsx` | PATTERNS §4 포팅 그대로. props: `focusLineId`, `focusStopId`, `onSelectStop`. 라인 GeoJSON + 정류장 마커 + 셔틀 시뮬레이션 |
| `src/components/map/useShuttleSim.js` | 라인 좌표 배열 따라 rAF 보간 이동 훅. reduced-motion 시 정지 위치 |
| `src/components/loop/LinePanel.jsx` | 라인 3개 리스트 + 정류장 하위 리스트. 선택 → LoopMap focus |
| `src/pages/LineDetail.jsx` | IA §2.5 순서 고정 |
| `src/components/loop/LineHero.jsx` | 라인 컬러 면 + 캐릭터 + 라인명 + 메타 |
| `src/components/loop/StopStrip.jsx` | 수직 노선도. 노드 = 라인 컬러 링. 정류장별 사진·선주문 문구 |
| `src/components/loop/StoryClips.jsx` | 썸네일 카드 가로 스크롤(모바일) / 3열(lg). VideoPlayer 사용 |
| `src/components/loop/DepartureCalendar.jsx` | props `lineId`, `onPick({date,time})`. 날짜 그리드 + 가격 인라인 + StatusBadge + 회차 선택 + 남은 좌석 |
| `src/pages/Booking.jsx` | 3스텝(IA §2.6). BookingContext 사용. 확정 → LoginGate → `createBooking` → navigate ticket |
| `src/components/booking/PartyStep.jsx` | Stepper ×2 + 합계 |
| `src/components/booking/SummaryStep.jsx` | 전체 요약 + 동승 인원 문장 + 호스트 |
| `src/components/booking/SuccessStamp.jsx` | 라인 스탬프 드롭 1.4→1.0 (scale 화이트리스트 1/2, reduced-motion 즉시 표시) |
| `src/pages/Ticket.jsx` | IA §2.7. navy 티켓 + 예약 코드 + 공유(PATTERNS §7) + "2 lines left" |
| `src/pages/Pilot.jsx` | IA §2.8 |
| `src/pages/NotFound.jsx` | EmptyState 사용 |

## D. 서버 (AGENT-SERVER, PHASE 3)

| 파일 | 스펙 |
|---|---|
| `server/index.js` | Express 부트스트랩, CORS(클라이언트 오리진), cookie-parser, JSON |
| `server/db.js` | `pg` Pool — `process.env.DATABASE_URL`(Neon) |
| `server/schema.sql` `server/seed.sql` | IA §4 스키마 + 라인/정류장/회차 시드 |
| `server/routes/auth.js` | Google OAuth 코드 플로우: `/api/auth/google` → 리다이렉트, `/api/auth/callback` → 토큰 교환 → 유저 upsert → **httpOnly 세션 쿠키**. `/api/me`, `/api/logout` |
| `server/routes/lines.js` | GET `/api/lines`, `/api/lines/:id`, `/api/lines/:id/departures?date=` |
| `server/routes/bookings.js` | POST `/api/bookings`(인증 필수, 좌석 잔여 검증 트랜잭션), GET `/api/bookings/:id` |
| `server/routes/handsfree.js` | POST `/api/handsfree`(인증 필수) |
| 클라이언트 | `src/data/api.js` 내부만 fetch로 교체 — 페이지 코드 무변경이 완료 조건 |
