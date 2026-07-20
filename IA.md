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
/                       Home — 히어로 캐러셀 + 두 문제 선언 + Gate 진입 + 라인 3개
/gate                   Gate 플래너 — 공항→춘천 오늘의 최적 경로 (GateJourney 인터랙션)
/hands-free             Hands-Free — 짐 먼저 보내기 (v3.1 최상위 승격: 성격·과금이 달라 독립)
/loop                   Loop — 라이브 라인 맵 (시그니처 화면, 오버레이 프리뷰)
/loop/:lineId           라인 상세 — 좌 콘텐츠 + 우 스티키 예약 패널(G-Local 이식)
/loop/:lineId/book      예약 확인 단일 페이지 (v3.1: 3스텝 폐지)
/ticket/:bookingId      티켓 / 예약 확정
/about                  브랜드 상세 페이지 (v3.1: Pilot 대체. 파일럿 증빙은 §Proof 섹션으로 흡수)
/legal/privacy          개인정보처리방침 (새 탭 진입)
/legal/terms            이용약관 (새 탭 진입)
*                       404
```

내비게이션 노출: **Gate / Loop / Hands-Free / About** (4개). Home은 로고. 상세·예약·법적 페이지는 플로우·푸터 진입. `/gate/hands-free`와 `/pilot`은 각각 `/hands-free`·`/about`으로 replace 리다이렉트(구 링크 생존).

## 2. 페이지별 구조

### 2.1 Home `/`
1. **Hero (v3.1 캐러셀)**: 풀블리드 **HeroCarousel** — 실사진 3장(호수·라인 풍경, `public/images/hero-1..3.jpg`, 촬영 전까지 무료 스톡 자연 사진으로 채움) 크로스페이드 6초(opacity 400ms, scale 금지, reduced-motion 시 1장 고정) + scrim + 하단 도트 인디케이터. display 타이포 "You can't visit what you can't reach." 서브: "Airport to Chuncheon, and everywhere inside it." CTA 2개: "Find my route"(→/gate), "See the lines"(→/loop).
2. **Problem strip**: 팀 리서치 근거 한 문장 — "4 of 5 researchers, independently, reached the same conclusion: the problem isn't content — it's reach." (숫자 Kanit Bold)
3. **Gate entry card**: 터미널·시간 미니 입력 → 제출 시 /gate로 쿼리 전달.
4. **Lines preview (v3.1)**: 라인 카드 3장 — 사진 자리 대신 **lucide 아이콘 배지**(라인 컬러 소프트 배경 원 + 아이콘: potato=`Sprout`, dakgalbi=`Flame`, lake=`Waves`) + 3개 정류장 + 소요·가격 → /loop/:lineId. 무보더+shadow.sm.
5. **How it works**: 3단계(Reserve a seat → We pre-order ahead → Arrive, it's ready). 선주문 대행이 핵심 차별점임을 여기서 명시.
6. **Proof strip**: 실운행 썸네일 + "We already ran it." → **/about#proof** (v3.1: Pilot 페이지 흡수).
7. Footer.

### 2.2 Gate `/gate`
1. **헤드 카피 아래 GateJourney (v3.1 시그니처 인터랙션)**: 좌측 lucide `Plane`(공항) 원형 배지, 우측 `Building2`(춘천) 원형 배지, 그 사이 수평 트랙 선. 선택된 모드에 따라 `TrainFront` 또는 `Bus` 아이콘이 좌→우로 **천천히(약 8s linear 무한, reduced-motion 정지)** 이동. 모드 카드 선택과 양방향 동기. PATTERNS §12.
2. 입력: 터미널(ICN T1 / T2 / GMP) + 도착 시각 + 날짜 — **전부 FieldSelect**(DESIGN §7, Skyscanner 패턴): 클릭 시 아이콘+장소/시간 리스트 드롭 카드, 시간 라벨은 사전 키(en에서 오전/오후 누수 금지). 제출 → 결과 aria-live 갱신.
3. 결과: **경로 옵션 카드 2~3개** (룰 기반 정적 시간표 — MVP는 실시간 API 없음):
   - A. Rail: AREX → Seoul Stn → Yongsan → ITX-Cheongchun → Namchuncheon
   - B. Direct bus: 공항 → 춘천시외버스터미널
   - 각 카드: 총 소요·요금·환승 수·첫 탑승 가능 편(도착시각 + 입국수속 버퍼 60분 반영).
4. 선택 시 **단계별 리스트**: leg마다 사진 1장 + 방향 문장 + 소요. (사진은 PLACEHOLDER → 현장 촬영으로 교체)
5. **Hands-Free 크로스셀 카드**: "Send your bags ahead. Travel with just your body." → **/hands-free**. 일본 테부라(手ぶら観光) 표준 언급은 카피 한 줄로.

### 2.3 Hands-Free `/hands-free` (v3.1 독립 페이지 — 헤더 노출)
1. **페이지 헤드라인 섹션**: h1 "Send your bags ahead." + 서브 카피(공항 카운터에서 짐을 부치면 춘천 숙소에 먼저 도착한다, 기존 수하물 딜리버리 사업자 제휴, 우리는 춘천 구간 예약 레이어라는 점을 정직하게) + 3단계 미니 스트립(Drop at airport / We carry to Chuncheon / Meet it at your stay, lucide 아이콘).
   레이아웃 v3.1: **모바일 고정폭 느낌 폐지** — lg+에서 `1fr_380px` 2컬럼(좌 설명·단계·FAQ 2~3개, 우 폼 카드), 컨테이너 마진 정상 준수.
2. 폼: 수하물 개수(Stepper) / 도착 터미널·날짜 / 춘천 숙소 주소 / 연락 이메일.
3. 요금 표시(개당, DRAFT) → 확인 = 로그인 게이트 → 접수 완료 화면(접수 코드).

### 2.4 Loop `/loop` — 시그니처
1. **풀블리드 MapLibre 맵**: 맵만 마진 무시 전폭·전고(헤더 아래 100%). 3레이어 라인 + draw-on + 정류장 마커 + 부드러운 셔틀(DESIGN §11). 헤더는 여기서도 불투명(DESIGN §6).
2. **지도 위 라인 카드 (v3.1 — 네이버맵 패턴)**: 별도 사이드 컬럼 폐지. 라인 3장은 **컨테이너 마진 안쪽, 지도 위에 뜨는 글래스 카드**(blur 허용면, radius lg, shadow lg) — 데스크탑 좌측 세로 스택(폭 340px), 모바일 하단 가로 스크롤 스냅 카드. 카드: 아이콘 배지 + 라인명 + 소요·가격 + 정류장 3개 미니 리스트 + "View line". 선택 → flyTo + 타 라인 40% 투명. 정류장 리스트는 키보드 완전 지원(지도 대체 경로).
3. **StopPopup**: 마커/리스트 선택 시 해당 정류장 위 white 카드 팝업(이름·한 줄·체류시간·View line). DESIGN §11.
4. **LinePreviewOverlay (v3.1 — 페이지 이탈 없는 미리보기)**: "View line" 클릭 시 라우팅하지 않는다. 지도가 scrim 40%로 어두워지고 그 위 **리퀴드 글래스 패널**(우측 고정 폭 420px, 모바일 풀시트)이 spring으로 등장: LineHero 요약(아이콘·라인명·소요·가격) + 정류장 수직 미니 노선도 + 선주문 한 줄. **Stories·Departures·호스트·Reserve seats 블록은 넣지 않는다** — 그건 상세 페이지의 일. 하단 CTA 단 하나: "Book and see details" → /loop/:lineId. 닫기 = 바깥 탭·Escape·X.

### 2.5 라인 상세 `/loop/:lineId` (v3.1 — G-Local 레이아웃 이식)
전체 레이아웃: lg+ `grid-cols-[1fr_380px] gap-12`. **좌측 = 콘텐츠 스크롤, 우측 = 스티키 예약 패널(`sticky top-24`, 스크롤 내내 동행)**. 모바일: 콘텐츠 아래 하단 고정 CTA 바 → 탭 시 BottomSheet로 패널 내용.
1. **Line hero**: 라인 컬러 소프트 면 + 캐릭터 이미지(콘텐츠로만) + 라인명(Kanit Bold) + 소요·정류장 수·가격.
2. **Stop strip**: 수직 노선도(라인 컬러 세로선 + 정류장 노드). 정류장마다: 사진, 이름(EN/KR), 체류 시간, **선주문 대행 내용**("Your gamja-bbang is ready when you arrive" / "Grill pre-heated 15 min before arrival").
3. **Story clips**: 차내에서 보게 될 사장님 스토리 미리보기(썸네일 + 20자 요약). 감자밭 스토리가 대표 자산. 클립은 자막 상시.
4. **우측 스티키 예약 패널 (StickyBookPanel)**: 가격(Kanit Bold)/기준 표기 → DepartureCalendar(가격 인라인 + 상태 배지: 출발확정 green / 출발유력 yellow / 마감 — yountravel 검증 패턴) → 회차 Chip(10:00/13:00/16:00 DRAFT) + 남은 좌석 → Adult/Child Stepper → 디바이더 → 실시간 합계 → "좌석 = 매칭" 한 줄("You'll ride with N other travelers") + 호스트 이름 → CTA "Reserve seats". **캘린더·인원·합계가 전부 이 패널 안** — 좌측 본문에 중복 배치 금지.
5. CTA → /loop/:lineId/book?date=&time=&adult=&child= (선택값 전부 쿼리 전달).

### 2.6 예약 확인 `/loop/:lineId/book` (v3.1 — 단일 페이지, 3스텝 폐지)
선택은 이미 상세 스티키 패널에서 끝났다. 이 페이지는 **확인 한 화면**:
1. 좌측: 요약 카드 — 라인·날짜·회차·미팅포인트·인원·동승 인원·호스트·선주문 안내. 각 항목 옆 "Edit" 텍스트 버튼 → 상세 페이지로 복귀(쿼리 보존).
2. 우측(lg+) 또는 하단: 합계 + 확정 CTA. **확정 버튼에서만 로그인 게이트**(Google, 모달) → POST → /ticket/:id.
3. 성공: **라인 스탬프 드롭 애니메이션(scale 화이트리스트 1/2)**.
- 쿼리 미비(날짜·회차 없음) 진입 시 상세로 replace 리다이렉트. 게스트 상태는 쿼리+in-memory Context(localStorage 금지).
- 결과: 상세(선택) → 확인(1페이지) → 티켓. 사용자가 만나는 화면 총 2장.

### 2.7 티켓 `/ticket/:bookingId`
- navy 면 티켓 카드: 라인 컬러 스트라이프, **예약 코드 6자(Kanit Bold, 큰 숫자)**, 날짜·회차, 미팅포인트(지도 미니 링크), 인원, 호스트, "What you'll watch on board" 클립 1개.
- 공유: `navigator.share({files})` → 실패 시 다운로드 폴백. QR은 로드맵(라이브러리 추가 금지).
- 하단: "2 lines left to complete Chuncheon." — 남은 라인이 곧 재방문 이유(CJM Revisit 구조 내장).

### 2.8 About `/about` (v3.1 — 브랜드 상세 페이지, Pilot 흡수·대체)
목적: 대회 모의 크라우드펀딩 대응 롱폼. 레퍼런스: Return Hound(문제 넘버링·Before/After·단계 스트립·신뢰 지표), 제품 상세페이지 3종(긴 스크롤 스토리텔링). **카피 전문은 BRAND_COPY.md — 지어내지 말고 그대로 사전에 이식.** 섹션 순서 고정:
1. Brand hero: 로고 + "We move you to the story." + 실사 배경.
2. Problem, before you arrive: 넘버링 카드 3(환승 미로·수하물·정보 단절).
3. Problem, after you arrive: 넘버링 카드 3(라스트마일·대기줄·이야기 없는 소비).
4. What we run: 3필러 카드(Gate / Loop / Hands-Free) — 아이콘 배지, 각 페이지 링크.
5. How a day works: 수평 단계 스트립 5(Reserve → We pre-order → Ride with stories → Arrive, it's ready → Stamp the line).
6. **Proof (`#proof`, 구 Pilot 전체 흡수)**: 실운행 영상(자막 상시) + 지표 3(Kanit Bold, 실측 PLACEHOLDER) + 갤러리 + "This wasn't a mockup. We ran the line."
7. Local stories: 사장님·정류장 스토리 카드(감자밭 대표).
8. Stay longer: 1일 → 1박2일 → 롱스테이 확장 로드맵 타임라인.
9. Business model: BMC 9블록 그리드(무보더 카드, 요약 문구) + 수익 구조 한 줄(좌석 마진 + Hands-Free 수수료 + 지역 제휴).
10. Sustainability and beyond: 지역 상생·글로벌 확장(태국어 지원이 그 증거) 카피.
11. CTA 밴드: "Back the first line." → /loop + 크라우드펀딩 예정 문구.

### 2.9 404
- unDraw(단색) + "This stop doesn't exist." + Home CTA.

## 3. 핵심 플로우

1. **Gate**: 입력 → 옵션 비교 → 단계 안내 → (선택) Hands-Free.
2. **Hands-Free**: 폼 → 로그인 게이트 → 접수 코드.
3. **Loop 예약 (v3.1)**: 맵 탐색 → LinePreviewOverlay(페이지 이탈 없음) → 상세(스티키 패널에서 날짜·회차·인원까지) → 확인 1페이지 → 로그인 게이트 → 티켓 → 공유. 화면 수 2.
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
