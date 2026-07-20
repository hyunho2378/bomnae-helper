# IA.md — Bomnae Helper 정보 구조 v3

## 0. 서비스 한 줄 정의

**"도달할 수 없는 추천은 그림일 뿐이다."**
Bomnae Helper는 두 개의 교통 문제를 하나의 헬퍼로 해결한다:
- **Gate** — 한국 공항에 내린 순간부터 춘천까지 (경로 + Hands-Free 짐 보내기)
- **Loop** — 춘천 안 외곽 분산 명소를 캐릭터 브랜딩 고정 순환 라인 3개로 (좌석 예약 + 선주문 대행 + 차내 스토리)

MVP 범위 = **예약·라인맵 플랫폼(만들 수 있는 것) + 파일럿 1회 운행 증빙(증명할 수 있는 것).**
플랫폼은 우리가 짓고, 운행은 전세버스·여행상품 등록·DRT 제휴 — 우리는 운수회사가 아니라 플랫폼+상품 기획사다.

## 1. 사이트맵

```
/                       Home — 두 문제 선언 + Gate 진입 + 라인 3개 + 파일럿 증빙
/gate                   Gate 플래너 — 공항→춘천 오늘의 최적 경로
/gate/hands-free        Hands-Free — 짐 먼저 보내기 예약
/loop                   Loop — 라이브 라인 맵 (시그니처 화면)
/loop/:lineId           라인 상세 (potato | dakgalbi | lake)
/loop/:lineId/book      좌석 예약 플로우
/ticket/:bookingId      티켓 / 예약 확정
/pilot                  파일럿 증빙 (실운행 영상·사진·지표)
*                       404
```

내비게이션 노출: Gate / Loop / Pilot (3개). Home은 로고. hands-free·상세·예약은 플로우 내부 진입.

## 2. 페이지별 구조

### 2.1 Home `/`
1. **Hero** (풀블리드): display 타이포 "You can't visit what you can't reach." + 실사진 배경(텍스트 없는 실사) + scrim. 서브: "Airport to Chuncheon, and everywhere inside it." CTA 2개 — "Find my route"(→/gate), "See the lines"(→/loop).
2. **Problem strip**: 팀 리서치 근거 한 문장 — "4 of 5 researchers, independently, reached the same conclusion: the problem isn't content — it's reach." (숫자 Kanit Bold)
3. **Gate entry card**: 터미널·시간 미니 입력 → 제출 시 /gate로 쿼리 전달.
4. **Lines preview**: 라인 카드 3장(라인 컬러 + 캐릭터 이미지 + 3개 정류장 + 소요·가격) → /loop/:lineId.
5. **How it works**: 3단계(Reserve a seat → We pre-order ahead → Arrive, it's ready). 선주문 대행이 핵심 차별점임을 여기서 명시.
6. **Pilot proof strip**: 실운행 썸네일 + "We already ran it." → /pilot.
7. Footer.

### 2.2 Gate `/gate`
1. 입력: 터미널(ICN T1 / T2 / GMP) + 도착 시각 + 날짜. 제출 → 결과 aria-live 갱신.
2. 결과: **경로 옵션 카드 2~3개** (룰 기반 정적 시간표 — MVP는 실시간 API 없음):
   - A. Rail: AREX → Seoul Stn → Yongsan → ITX-Cheongchun → Namchuncheon
   - B. Direct bus: 공항 → 춘천시외버스터미널
   - 각 카드: 총 소요·요금·환승 수·첫 탑승 가능 편(도착시각 + 입국수속 버퍼 60분 반영).
3. 선택 시 **단계별 리스트**: leg마다 사진 1장 + 방향 문장 + 소요. (사진은 PLACEHOLDER → 현장 촬영으로 교체)
4. **Hands-Free 크로스셀 카드**: "Send your bags ahead. Travel with just your body." → /gate/hands-free. 일본 테부라(手ぶら観光) 표준 언급은 카피 한 줄로.

### 2.3 Hands-Free `/gate/hands-free`
1. 설명 헤더: 공항 카운터에서 짐을 부치면 춘천 숙소에 먼저 도착. 기존 수하물 딜리버리 사업자 제휴 — 우리는 춘천 구간 예약 레이어(정직하게 표기).
2. 폼: 수하물 개수(Stepper) / 도착 터미널·날짜 / 춘천 숙소 주소 / 연락 이메일.
3. 요금 표시(개당, DRAFT) → 확인 = 로그인 게이트 → 접수 완료 화면(접수 코드).

### 2.4 Loop `/loop` — 시그니처
1. **풀블리드 MapLibre 맵**: 3D 시네마틱 + 라인 3개 스트로크 + 정류장 마커 + 셔틀 마커(시뮬레이션 이동).
2. **라인 패널**: 데스크탑 = 좌측 글래스 패널 아님 — 좌측 일반 white 패널(blur 예산 초과 금지), 모바일 = 하단 시트형 리스트. 라인 3개 탭 → 지도 flyTo + 해당 라인만 강조(타 라인 40% 투명).
3. 정류장 리스트 = 지도 대체 접근 경로(키보드 완전 지원).
4. 각 라인 항목에 "View line" → /loop/:lineId.

### 2.5 라인 상세 `/loop/:lineId`
1. **Line hero**: 라인 컬러 배경 스트라이프 + 캐릭터 이미지(콘텐츠로만) + 라인명(Kanit Bold) + 소요·정류장 수·가격.
2. **Stop strip**: 수직 노선도(라인 컬러 세로선 + 정류장 노드). 정류장마다: 사진, 이름(EN/KR), 체류 시간, **선주문 대행 내용**("Your gamja-bbang is ready when you arrive" / "Grill pre-heated 15 min before arrival").
3. **Story clips**: 차내에서 보게 될 사장님 스토리 미리보기(썸네일 + 20자 요약). 감자밭 스토리가 대표 자산. 클립은 자막 상시.
4. **Departure calendar**: 날짜 그리드에 **가격 인라인 + 상태 배지(출발확정 green / 출발유력 yellow / 마감)** — yountravel 검증 패턴 채택. 날짜 선택 → 회차(10:00/13:00/16:00 DRAFT) + **남은 좌석 수 노출**.
5. **좌석 = 매칭**: "You'll ride with 7 other travelers on this departure." 프로필 매칭 없음 — 좌석이 곧 매칭. 호스트(버디) 이름·한 줄 소개 표시.
6. CTA "Reserve seats" → /loop/:lineId/book.

### 2.6 예약 `/loop/:lineId/book`
스텝 3 + 확정. 게스트로 전 과정 진행, **확정 버튼에서만 로그인 게이트**(Google).
1. Step 1 — 출발: 날짜 + 회차 (캘린더에서 넘어오면 프리필).
2. Step 2 — 인원: Adult / Child Stepper (yountravel 패턴). 합계 금액 실시간.
3. Step 3 — 요약: 라인·회차·미팅포인트·동승 인원·호스트·선주문 안내·합계. 확정 → 로그인 게이트(모달) → POST → /ticket/:id.
4. 성공: **라인 스탬프 드롭 애니메이션(scale 화이트리스트 1/2)**.
- 게스트 진행 상태는 in-memory BookingContext (localStorage 금지). 새로고침 시 소실 — Step 1부터, 명시적 안내 불필요(플로우 3스텝이라 짧다).

### 2.7 티켓 `/ticket/:bookingId`
- navy 면 티켓 카드: 라인 컬러 스트라이프, **예약 코드 6자(Kanit Bold, 큰 숫자)**, 날짜·회차, 미팅포인트(지도 미니 링크), 인원, 호스트, "What you'll watch on board" 클립 1개.
- 공유: `navigator.share({files})` → 실패 시 다운로드 폴백. QR은 로드맵(라이브러리 추가 금지).
- 하단: "2 lines left to complete Chuncheon." — 남은 라인이 곧 재방문 이유(CJM Revisit 구조 내장).

### 2.8 Pilot `/pilot`
1. 실운행 영상(자막 상시): 차내 스토리 시청 장면 / 도착 즉시 나오는 감자빵.
2. 지표 3개(Kanit Bold 숫자): 운행 코스 수, 탑승 인원, 외국인 탑승자 수 — 3~4일차 실측값으로 교체.
3. 갤러리 + "This wasn't a mockup. We ran the line." 카피.

### 2.9 404
- unDraw(단색) + "This stop doesn't exist." + Home CTA.

## 3. 핵심 플로우

1. **Gate**: 입력 → 옵션 비교 → 단계 안내 → (선택) Hands-Free.
2. **Hands-Free**: 폼 → 로그인 게이트 → 접수 코드.
3. **Loop 예약**: 라인 탐색(맵) → 상세 → 캘린더 → 3스텝 → 로그인 게이트 → 티켓 → 공유.
- 읽기 전 구간 게스트. **쓰기(예약·접수 확정)에서만 로그인** — Guest-first.

## 4. 데이터 IA

```
lines        id(potato|dakgalbi|lake), name_en/ko, color_token, duration_min,
             price_adult, price_child, price_weekend_delta, host_name, character_img
stops        id, line_id, order, name_en/ko, lng, lat, stay_min,
             preorder_en/ko(선주문 대행 문구), photo, story_id?
stories      id, title_en/ko, summary_en/ko, video_url?, thumb
departures   id, line_id, date, time, capacity(12), booked_count, status(confirmed|likely|closed)
bookings     id, code(6자), departure_id, user_id, adults, children, total, status
handsfree    id, code, user_id, terminal, date, bags, address, total, status
users        id, google_sub, email, name
gate_routes  (정적 데이터 파일) option, legs[], duration, fare, first_available 규칙
```
- PHASE 1은 전부 `src/data/*.js` 목데이터. PHASE 3에서 서버 이관(스키마 동일).
- **좌표는 전부 APPROX 플래그** — 3~4일차 현장탐방에서 GPS 실좌표 수집 후 교체(RUNBOOK 과제).
- 가격은 DRAFT — 택시 대비 반값이 세일즈 포인트. 초안: Adult ₩18,000 / Child ₩12,000 / 주말 +₩3,000, Hands-Free ₩25,000/개. 5일차 BM 검토에서 확정.

## 5. 레퍼런스 Teardown — 대전 빵티칸 순례버스 (yountravel.com/master/59425)

빵아저씨 모델의 실제 판매 페이지. 우리 설계에 반영한 것:

**채택한 검증 패턴**
- 날짜 캘린더에 **가격 인라인**(주중 4.0만/주말 4.5만 차등) + **출발확정/출발유력** 상태 → DepartureCalendar에 그대로.
- 성인/아동/유아 **인원 스테퍼** + 실시간 합계 → 예약 Step 2.
- 미팅포인트 고정(대전역 1번출구) + 사전 단톡방 → 미팅포인트 명시 + 호스트 연락 구조.
- "순례 인증서" 발급 → 라인 스탬프·완주 카드(CJM Spread)와 동일 장치, 선례 확인됨.
- **법적 구조**: 여행사(통신판매 등록) 경유 국내여행 특별약관 상품으로 판매 — 우리가 선언한 "여행상품 등록" 경로의 살아있는 선례. 피칭에서 인용.

**실패 지점 (실사용자 리뷰 — 우리 차별화의 근거)**
- 45인 대형버스 → 소규모 가게에 단체가 몰려 **대기줄이 오히려 길어지고 인기 품목 품절**. 사용자 스스로 "20인 미니버스" 제안, 운영자도 40인 미만으로 축소 운영 중이라고 답변.
- → Bomnae Helper: **12인 밴 + 선주문 대행**이 정확히 이 지점을 해결. "도착하면 웨이팅 없이 나와 있다"는 대형버스 모델이 구조적으로 못 하는 약속이다. 피칭 슬라이드 1장 감.

## 6. CJM 루프 매핑

Discover(예약 가능한 춘천이 처음으로 영어 채널에 존재) → Encounter(Gate가 도달 장벽 제거) → Experience(Loop + 차내 스토리) → Revisit(3개 라인 중 1개만 탔다 — 티켓 하단 "2 lines left") → Spread(동승 사진 + 라인 완주 스탬프 공유).

## 7. PLACEHOLDER 목록 (코드에 `// PLACEHOLDER — verify on site` 주석 필수)

정류장 GPS 좌표 전부 / Gate 시간표·요금 / 라인 가격 / 회차 시각 / 히어로 실사진 / 스토리 클립 영상 / 파일럿 지표 / 호스트 이름 / 봄내크루 캐릭터 에셋(배경 제거본).
