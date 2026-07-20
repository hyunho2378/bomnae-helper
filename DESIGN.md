# DESIGN.md — Bomnae Helper · CHUNCHEON VIVID v3

이 문서는 디자인의 유일한 기준이다. 여기 없는 색·크기·효과는 존재하지 않는 값이다.
모든 수치의 실제 값은 `client/src/tokens.js`가 단일 진실이며, 이 문서는 그 사용 규칙을 정의한다.

---

## 0. 플랫폼 확정

- **B형 반응형 웹.** 정체성은 웹이다. 앱이 아니다. 앱 성격·모호한 디자인 금지.
- 대응 구간: **320px ~ 3840px (4K 32인치 포함).** 마스터 프롬프트의 2560 상한을 3840으로 확장한다.
- Mobile First로 작성하되, 데스크탑이 열등한 축소판이 되지 않게 한다 — lg 이상에서 지도·라인맵은 화면의 주인공이 된다.

## 1. 브랜드 무드 — CHUNCHEON VIVID

- 순백(#FFFFFF) 위에 고채도 라인 컬러가 지하철 노선도처럼 흐르는 인상. 배경은 침묵하고 라인이 말한다.
- **시그니처 요소(단 하나): 살아있는 라인 맵.** 시네마틱 3D 지도 위에 3개 라인이 컬러로 흐르고 셔틀 위치가 실시간 표시된다. 나머지 화면은 이 하나를 위해 절제한다.
- 캐릭터(봄내크루)는 라인의 얼굴이지만 **콘텐츠 이미지로만** 등장한다. 캐릭터의 파스텔 색을 UI 팔레트로 쓰지 않는다.
- 금지 무드: 웜톤 크림 배경, 파스텔 UI, 그라데이션 남용, "AI가 만든 것 같은" 기본값 룩.

## 2. 컬러 (tokens.colors)

| 토큰 | 값 | 역할 |
|---|---|---|
| bg | #FFFFFF | 페이지 배경. 전 페이지 공통 |
| primary | #009FE3 | 링크·활성 상태·CTA·Lake Line |
| navy | #27348B | 푸터 풀블리드, 강대비 면, 티켓 면 |
| yellow | #FFC400 | Potato Line 전용 + 경고성 배지 |
| spice | #FF4438 | Dakgalbi Line 전용 + 에러 |
| green | #00B865 | 성공/출발확정 상태 |
| magenta | #F0347C | 포인트 강조(페이지당 1회 이하) |
| ink / inkSec / inkMeta | #14172E / #4E5470 / #8B90A7 | 텍스트 3단계 |
| line | rgba(20,23,46,0.10) | 보더 |
| glass | rgba(255,255,255,0.66) | 글래스 면 (blur 예산 3곳 전용) |
| scrim | rgba(20,23,46,0.55) | 자막 밴드 + 히어로 스크림 |
| surface | #F5F6FA | 입력 배경·스켈레톤·지도 로딩면 |

규칙:
- HEX·rgb 직접 입력 전면 금지. Tailwind 클래스는 tokens에서 생성된 것만 사용.
- 고채도 서포트 4색(yellow/spice/green/magenta)은 **면적을 크게 쓰지 않는다.** 라인 스트로크, 배지, 마커, 스탬프 등 소면적 고밀도로.
- 글래스 위 텍스트는 ink 계열 선명 컬러만 (HIG Materials: 반투명 머티리얼 위에는 vibrant/선명 색상만 — 저대비 색 금지).
- WCAG 2.1 AA: 일반 텍스트 대비 4.5:1 이상, 대형 텍스트·UI 컴포넌트 3:1 이상. yellow 위 텍스트는 ink만 허용(white 금지).

## 3. 라인 컬러 매핑 (tokens.lineColors)

| 라인 | 토큰 | 코스 |
|---|---|---|
| Potato Line | yellow #FFC400 | 감자밭 → 소양강댐 → 소울로스터리 |
| Dakgalbi Line | spice #FF4438 | 통나무집 닭갈비 → 막국수체험박물관 → 구도심 |
| Lake/Culture Line | primary #009FE3 | 소양강스카이워크 → 화동2571 → 공지천 |

라인을 지칭하는 모든 UI(맵 스트로크, 정류장 스트립, 배지, 티켓, 스탬프)는 이 3색으로만 식별한다.

## 4. 타이포그래피

- **Kanit(300~700)**: 영문·숫자·디스플레이 전용. **한글 글리프가 없다 — 한글에 절대 지정 금지.**
- **Pretendard Variable**: 한글 전담 + 본문.
- 폰트 스택은 tokens.fonts만 사용: display 텍스트는 `fonts.display`, 본문은 `fonts.body`. 스택 순서 덕에 라틴/숫자는 Kanit, 한글은 Pretendard로 자동 폴백된다.
- CDN: Kanit = Google Fonts(300;400;500;600;700), Pretendard Variable = jsDelivr dynamic-subset. `index.html`에서 preconnect + link.

웨이트 위계(강제):
- Bold 700 — display, H1, 큰 숫자(가격·시간·예약코드)
- SemiBold 600 — H2, CTA 라벨
- Medium 500 — H3, 네비, 칩, caption
- Regular 400 — 본문
- Light 300 — 18px 이상에서만
- **한 화면 최소 3웨이트 공존. 인접 요소 동일 웨이트 나열 금지.**

Fluid 스케일 (tokens.typeScale): display `clamp(44px,6vw,104px)` / h1 `clamp(32px,4vw,56px)` / h2 `clamp(24px,2.5vw,36px)` / h3 20px / body 16px / small 14px / caption 12px·500.
- display는 4K에서도 104px 캡을 넘지 않는다 — 대형 화면 대응은 글자 확대가 아니라 여백 확대다.
- 자간: display/h1의 라틴 대문자는 letter-spacing `-0.01em ~ -0.02em`, caption 라틴 대문자 라벨(eyebrow)은 `+0.08em`.

## 5. 레이아웃 · 반응형 · 4K 전략

브레이크포인트 (tokens.breakpoints): sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536 / 3xl 1920.

컨테이너 (tokens.containers):
| 구간 | 규칙 |
|---|---|
| ~md | 좌우 마진 20px |
| md~lg | 좌우 마진 32px |
| lg~2xl | max-width 1200px + 마진 48px, 중앙 정렬 |
| 2xl~3xl | max-width 1400px |
| 3xl(1920)~**3840** | **max-width 1560px 캡 고정 + 여백. 콘텐츠 확장 금지** |

- **풀블리드 허용 3곳뿐: 히어로 / 지도(LoopMap) / 푸터.** 그 외 전부 컨테이너 안.
- 4K 32인치 대응 원칙: 캡+여백. 히어로는 `min-height: clamp(560px, 72vh, 960px)`로 위아래가 비지 않게, 지도는 뷰포트를 가득 채우고, 텍스트 콘텐츠는 1560 캡 안에서 좌우 대칭 여백으로 안정시킨다.
- 간격은 tokens.spacing 배수만 사용. 임의 px 금지.
- 그리드: 모바일 4컬럼 / md 8컬럼 / xl 12컬럼. 카드 그리드는 gap 16(모바일)→24(md)→32(xl).

**QA 뷰포트 매트릭스 (전 항목 필수 — AGENT-REVIEW가 실행):**
`320 / 390 / 640 / 768 / 1024 / 1280 / 1536 / 1920 / 2560 / 3840`
각 뷰포트에서: 가로 스크롤 없음, 콘텐츠 잘림 없음, 컨테이너 캡 준수, 풀블리드 3곳 외 전폭 요소 없음.

## 6. 내비게이션

**데스크탑 (lg+) — Header**
- 상단 고정. 로고 + 메뉴(Gate / Loop / Pilot) + LangToggle + 로그인 아이콘.
- 초기 높이 72px 투명 → 스크롤 시 glass(blur 예산 1/3) + 높이 56px로 수축. 전환 320ms spring.
- 현재 라우트 메뉴는 Medium 500 + primary 언더라인 2px.

**모바일 (<lg) — GlassDock**
- 중앙 하단 **리퀴드 글래스 모핑 필**(blur 예산 2/3, 그림자 예산 1/2).
- 접힘: 로고 + 현재 페이지명 + 점 3개. 높이 56px, pill radius.
- 탭 → 위로 부풀며 spring 320ms로 전체 메뉴 + 언어 토글 + 로그인 노출.
- 수축 트리거: 바깥 탭 / 스와이프 다운 / 라우트 변경. 확장 중 포커스 트랩 + Escape 닫기.
- **탭바·햄버거 금지.** 터치 타깃 최소 44×44px (HIG).

**푸터** — navy 풀블리드 웹 푸터. 라인 3색 스트라이프 1px 상단 보더. 팀/대회 크레딧, 언어, 법적 고지 자리.

## 7. 컴포넌트 스타일 규칙

- **버튼(CTA)**: SemiBold 600, radius pill, 높이 48(모바일)/44(데스크탑), primary 배경 + white 텍스트. 텍스트 버튼은 흐름 전진 CTA만("Find my route", "Reserve seats"). hover: 배경 navy 전환 160ms. focus-visible: 2px primary 아웃라인 offset 2px.
- **IconButton**: 반복 액션 전부(공유, 닫기, 언어, +/-). lucide 단일, aria-label 필수, 데스크탑 툴팁. 44×44 히트영역.
- **카드**: bg white, border line, radius md(16). hover(데스크탑): border primary + translateY(-2px), 160ms. **scale 금지.**
- **칩/배지**: Medium 500, caption 12px, pill. 상태 배지 색: 출발확정 green / 출발유력 yellow(+ink 텍스트) / 마감 inkMeta.
- **폼**: 입력 배경 surface, border line, focus 시 border primary. 라벨 small 14 Medium. 에러는 인라인(spice 텍스트 + 필드 border spice) — 팝업 금지. 에러 문구는 무엇이 잘못됐고 어떻게 고치는지(사과·모호함 금지).
- **모달리티 (HIG Modality 근거)**: 모바일 = BottomSheet(위로 슬라이드, blur 예산 3/3, 그림자 예산 2/2, 그랩바, 스와이프 다운 닫기), 데스크탑 = 중앙 Dialog(max-width 560px, 동일 glass 면). 모달은 예약 확인·로그인 게이트 등 완결 과업에만.
- **EmptyState**: unDraw 일러스트(프라이머리 단색 재컬러) + 한 문장 + 행동 CTA. 위치 제한: 빈 검색 결과, 404/500, 로그인 게이트.

## 8. 아이콘 라이브러리 (필수 규칙)

- 기본: **lucide-react** (https://lucide.dev) — 모든 인터페이스 아이콘은 여기서만.
- 보조(사용자 사전 승인 필요): Bootstrap Icons, react-icons, Heroicons. **AGENT 임의 도입 금지.**
- 한 페이지 내 라이브러리 혼용 금지.
- 사이즈 5단계만: 16 / 20 / 24 / 32 / 48px.
- 색상은 텍스트 토큰만: ink, inkSec, inkMeta, primary, white.
- **이모지 아이콘 전면 금지.**

## 9. 일러스트

- unDraw만. 위치: EmptyState / 로그인 게이트 / 404·500. 콘텐츠 페이지(라인 상세, 예약, 티켓) 사용 금지.
- 메인 컬러는 primary 또는 흑백으로 재지정 후 SVG로 `client/public/images/illustrations/` 저장. 다색 일러스트 금지.
- 일러스트 + 사진 한 화면 혼용 금지.

## 10. 모션 · 효과 예산

| 예산 | 허용 위치 |
|---|---|
| blur 3곳 | Header(스크롤) / GlassDock / BottomSheet·Dialog |
| 그림자 2곳 | GlassDock / BottomSheet·Dialog |
| 그라데이션 1곳 | 히어로 스크림(scrim → transparent) |
| scale 화이트리스트 2곳 | 예약 성공 스탬프 드롭 1.4→1.0 / 카드 리빌 0.96→1.0 |

- 스프링: `cubic-bezier(0.32,1.32,0.5,1)` 320ms. 일반 전환 160ms ease.
- 위 화이트리스트 외 **transform: scale 전면 금지** (마커·카드 hover 포함).
- 히어로 패럴랙스 금지. 스크롤 하이재킹 금지.
- `prefers-reduced-motion: reduce` 전면 대응 — 애니메이션·전환 제거, 스탬프는 즉시 표시.
- 모션은 의미가 있을 때만(HIG Motion): 상태 변화·공간 관계 전달 목적. 장식 모션 금지.

## 11. 지도 (MapLibre)

- **MapLibre GL + openfreemap liberty 타일만.** 구글·네이버맵 임베드 금지.
- 기본 카메라: tokens.map — center [127.735,37.885], zoom 11.5, pitch 58, bearing -18. 정류장 포커스 시 flyTo(zoom 15, pitch 63, 1500ms).
- 3D 건물: fill-extrusion, minzoom 13, 컬러 램프는 tokens.map.extrusion(중립 잉크 톤) — 건물은 침묵, 라인이 주인공.
- 라인 3개는 GeoJSON line 레이어, `lineColors` 스트로크, 폭 zoom 보간(11.5:3px → 15:7px), 흰색 케이싱 라인 아래 깔기.
- 정류장 마커: 커스텀 HTML 마커(라인 컬러 링 + 흰 코어). active 상태는 **scale이 아니라** 사이즈 스텝(22→28px) + 펄스 링으로.
- 셔틀 마커: 라인 컬러 채움 + 캐릭터 미니 아이콘 이미지. MVP는 시뮬레이션 이동(PATTERNS.md §4).
- 지도 컨트롤은 우하단, attribution compact 유지(오픈데이터 크레딧 의무).

## 12. 미디어

- 영상: `muted autoplay playsInline loop` + **상시 자막(always-on)**. 자막 17px 이상, 밴드 scrim `rgba(20,23,46,0.55)`, 하단 safe 영역 위.
- **이미지에 텍스트 굽기 금지** — 포스터형 이미지 금지, 모든 텍스트는 DOM에.
- 사진: aspect-ratio 고정, `loading="lazy"`, alt 필수. 히어로용 실사진은 텍스트 없는 실사만(현장탐방 촬영분).

## 13. 이중언어 (EN 기본 / KR 토글)

- 사전: `src/i18n/en.js` + `src/i18n/ko.js` — **키 완전 동형.** UI 하드코딩 문자열 0.
- 전 인터랙티브 라벨은 **LangSwap 패턴**(PATTERNS.md §1): 같은 grid 셀에 두 언어 겹침 + invisible → 전환 시 레이아웃 시프트 0. **EN 기준 폭 설계.**
- 언어 상태는 in-memory Context (localStorage 금지). 기본 EN.
- 카피 원칙: 시스템 구조가 아니라 사용자가 인식하는 행동으로 명명("Reserve seats", "Send my bags"). 버튼 라벨은 플로우 끝까지 동일 어휘 유지.

## 14. 접근성 (WCAG 2.1 AA)

- 대비 4.5:1(일반) / 3:1(대형·UI). 모든 이미지 alt, 모든 IconButton aria-label.
- 키보드 완전 지원: focus-visible 스타일 필수, Dock/Sheet 포커스 트랩, Escape 닫기.
- 지도는 키보드 대체 경로 제공 — 정류장 리스트가 지도와 동일한 선택을 수행한다(지도 없이도 전 기능 사용 가능).
- aria-live: 경로 결과·예약 상태 변경 영역에 polite.

## 15. 금지 종합

TypeScript(.ts/.tsx/interface/type) / localStorage·sessionStorage / 색·간격·폰트 하드코딩 / 이모지 / 탭바·햄버거 / 화이트리스트 외 scale / 패럴랙스 / 구글·네이버맵 / 포스터 이미지(텍스트 굽기) / 웜톤·파스텔 UI / Kanit에 한글 / 캐릭터 파스텔의 UI 사용 / generic sans-serif·system-ui 폰트 지정.
