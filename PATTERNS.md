# PATTERNS.md — Bomnae Helper 반복 UI 패턴 v3

패턴은 그대로 사용한다. 임의 변형 금지. 코드 블록은 기준 구현이며 토큰 참조 방식만 프로젝트 유틸에 맞게 연결한다.

## §1. LangSwap — 레이아웃 시프트 0 이중언어

같은 grid 셀에 EN/KR을 겹치고 비활성 언어를 invisible 처리. 폭은 항상 두 언어 중 큰 쪽(대개 EN)으로 확보되어 전환 시 시프트가 0이다.

```jsx
// src/i18n/LangSwap.jsx
import { useLang } from './LangContext';
import en from './en'; import ko from './ko';

const pick = (dict, key) => key.split('.').reduce((o, k) => o?.[k], dict);

export default function LangSwap({ k, as: Tag = 'span', className = '' }) {
  const { lang } = useLang();
  const textEn = pick(en, k) ?? k;
  const textKo = pick(ko, k) ?? k;
  return (
    <Tag className={`grid ${className}`}>
      <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>{textEn}</span>
      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{textKo}</span>
    </Tag>
  );
}
```
- 모든 인터랙티브 라벨(버튼·메뉴·칩·배지)은 LangSwap 필수. 본문 장문은 `t(key)` 직접 렌더 허용(시프트 허용 영역).
- EN 기준 폭 설계: 버튼 min-width는 EN 라벨 기준으로 잡는다.

## §2. Header 스크롤 수축

- scrollY > 8 → `is-scrolled`: 높이 72→56px, 배경 transparent→glass + blur(예산 1/3), border-bottom line 표시. transition 320ms spring.
- rAF 스로틀. reduced-motion 시 즉시 상태 전환(트랜지션 제거).

## §3. GlassDock 모핑 필

- 위치: `fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2`, z tokens.z.dock.
- 접힘: 높이 56px pill, 내용 = 로고 20px + 현재 페이지명(LangSwap) + 점 3개(inkMeta). 전체가 하나의 button, `aria-expanded`.
- 확장: 같은 요소가 위로 부풀어(height/width 전환, spring 320ms — **scale 아님**) 메뉴 3항목 + LangToggle + 로그인 행 노출. `role="dialog"` + `aria-modal` + 포커스 트랩.
- 수축: 바깥 탭(백드롭 투명 fixed), 스와이프 다운(touchstart/move Δy>48), Escape, 라우트 변경.
- 44px 타깃, blur 예산 2/3, shadow 예산 1/2. reduced-motion: 높이 전환 즉시.

## §4. MapLibre 시네마틱 맵 (sloverthon 포팅)

원본 레포에서 검증된 로직. **변경점 2가지 주의**: ① extrusion 컬러를 tokens.map.extrusion(중립)으로 재토큰 ② 원본 마커의 `transform: scale(1.45)` hover는 scale 화이트리스트 위반 → 사이즈 스텝 + 펄스 링으로 대체.

```jsx
// src/components/map/LoopMap.jsx (핵심 골격)
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { map as M, lineColors } from '../../tokens';

useEffect(() => {
  if (!node.current || ref.current) return;
  const map = new maplibregl.Map({
    container: node.current, style: M.styleUrl,
    center: M.center, zoom: M.zoom, pitch: M.pitch, bearing: M.bearing,
    antialias: true, attributionControl: false,
  });
  ref.current = map;
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  map.on('load', () => {
    const labelLayer = map.getStyle().layers?.find(l => l.type === 'symbol' && l.layout?.['text-field']);
    try {
      map.addLayer({
        id: 'bh-3d-buildings', source: 'openmaptiles', 'source-layer': 'building',
        type: 'fill-extrusion', minzoom: M.extrusionMinZoom,
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'render_height'],
            0, M.extrusion.low, 40, M.extrusion.mid, 120, M.extrusion.high],
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 5],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.88,
        },
      }, labelLayer?.id);
    } catch { /* base style may already provide 3D buildings */ }

    // 라인 3개: 케이싱(흰) → 컬러 순으로 addLayer
    Object.entries(lineGeojson).forEach(([id, geojson]) => {
      map.addSource(`line-${id}`, { type: 'geojson', data: geojson });
      map.addLayer({ id: `line-${id}-casing`, type: 'line', source: `line-${id}`,
        paint: { 'line-color': '#FFFFFF', 'line-width': ['interpolate', ['linear'], ['zoom'], 11.5, 5, 15, 10] } }, labelLayer?.id);
      map.addLayer({ id: `line-${id}`, type: 'line', source: `line-${id}`,
        paint: { 'line-color': lineColors[id], 'line-width': ['interpolate', ['linear'], ['zoom'], 11.5, 3, 15, 7] } }, labelLayer?.id);
    });
    setReady(true);
  });
  return () => { map.remove(); ref.current = null; };
}, []);

// 포커스: map.flyTo({ center, zoom: 15, pitch: M.pitchFocus, bearing: -22, duration: M.flyDuration, essential: true })
// 라인 강조: 비활성 라인 setPaintProperty('line-opacity', 0.4)
```

정류장 마커 CSS(스케일 금지 버전):
```css
.stop-marker{width:22px;height:22px;border-radius:50%;background:#fff;
  border:4px solid var(--line-color);cursor:pointer;padding:0;transition:width 160ms,height 160ms,border-width 160ms}
.stop-marker.active{width:28px;height:28px;border-width:6px;position:relative}
.stop-marker.active::after{content:"";position:absolute;inset:-8px;border:2px solid var(--line-color);
  border-radius:50%;animation:bh-pulse 1.8s infinite}
@keyframes bh-pulse{from{opacity:1;inset:-4px}to{opacity:0;inset:-12px}}
@media(prefers-reduced-motion:reduce){.stop-marker.active::after{animation:none;opacity:.5}}
```
- `--line-color`는 마커 생성 시 인라인 CSS 변수로 주입(값은 tokens.lineColors에서).
- 셔틀 시뮬레이션(useShuttleSim): 라인 좌표 배열을 rAF로 선형 보간, 1루프 ≈ 90초. Marker.setLngLat만 갱신. reduced-motion 시 첫 정류장 고정.

## §5. DepartureCalendar

- 날짜 셀: 숫자(Kanit 500) + 가격 인라인 caption(₩ 축약 "18k") + StatusBadge 점. 선택 셀 border primary 2px.
- 날짜 선택 → 하단 회차 Chip 3개(시각 + 남은 좌석 "5 seats left"). 만석 Chip disabled + `status.closed`.
- 키보드: 셀 grid는 화살표 이동, Enter 선택 (roving tabindex).

## §6. 폼 · 에러 · 로딩 · 빈 상태

- 에러: 인라인만. 필드 border spice + 아래 small 텍스트(spice) "무엇이 잘못 + 어떻게 고침". 팝업/alert 금지.
- 제출 중: 버튼 라벨 유지 + 우측 16px 스피너(lucide Loader2 회전 — reduced-motion 시 정지 점), 버튼 disabled.
- 로딩: 데이터 영역은 Skeleton(콘텐츠 실루엣과 동일 형태). 스피너 단독 화면 금지.
- 빈 상태: EmptyState 컴포넌트만. 위치 제한은 DESIGN §7.

## §7. 공유 (Ticket)

```js
async function shareTicket(cardBlob, text) {
  const file = new File([cardBlob], 'bomnae-ticket.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return; } catch { /* 사용자 취소 */ }
  }
  const url = URL.createObjectURL(file);           // 폴백: 다운로드
  const a = Object.assign(document.createElement('a'), { href: url, download: 'bomnae-ticket.png' });
  a.click(); URL.revokeObjectURL(url);
}
```
- 티켓 카드 → PNG는 DOM 캡처 라이브러리 추가 금지: `<canvas>`에 직접 그린다(navy 면 + 라인 컬러 스트라이프 + 코드 텍스트 — 단순 도형이라 canvas 직접 렌더가 더 가볍다).

## §8. 카드 리빌

- IntersectionObserver(1회) → opacity 0→1 + scale 0.96→1.0 (scale 화이트리스트 2/2) + 240ms ease. 그리드 내 stagger 60ms, 최대 4개까지만 지연.
- reduced-motion: 즉시 표시.

## §9. 예약 성공 스탬프

- 라인 컬러 원형 스탬프(캐릭터 실루엣 or 라인 이니셜 Kanit Bold)가 scale 1.4→1.0 + opacity 0→1, spring 320ms(화이트리스트 1/2). 착지 시점에 아래 텍스트 페이드 인.
- reduced-motion: 즉시 표시.

## §10. 영상 자막

```jsx
<div className="relative">
  <video src={src} muted autoPlay playsInline loop className="w-full aspect-video object-cover" />
  <p className="absolute inset-x-0 bottom-0 bg-scrim text-white text-[17px] leading-snug px-4 py-3">
    {t(captionKey)}
  </p>
</div>
```
- 자막은 항상 DOM 텍스트(언어 토글 연동). 소스 영상에 자막 굽기 금지.

---

# v3.1 신규 패턴

## §11 FieldSelect (Skyscanner식 커스텀 셀렉트)
동작: 닫힘 = surface면 버튼(라벨 caption + 값/플레이스홀더). 클릭·Enter → 아래 옵션 카드(white, radius lg, shadow md, 최대 높이 320 스크롤). 옵션 행 = lucide 아이콘(inkMeta) + primary 텍스트(주) + secondary(inkMeta, 코드·부가). hover/active 행 bg surface. 선택 → 닫힘 + onChange. 접근성: 트리거 `aria-haspopup="listbox"` `aria-expanded`, 리스트 `role="listbox"`, 행 `role="option" aria-selected`, ↑↓ 이동·Enter 선택·Escape 닫기·바깥 클릭 닫기. 열림 애니메이션: opacity+translateY(4px→0) 160ms(브젯 내 transition, scale 아님).
시간 옵션 데이터: `{ id:'0930', primary: t('gate.time.0930') }` 식으로 **라벨 전부 사전 경유** — 네이티브 time input 미사용이 오전/오후 누수의 유일한 완치다.

## §12 GateJourney (공항→춘천 주행 인터랙션)
구조: 좌 `Plane` 원형 배지(surface bg, shadow sm) + 트랙(높이 2px, colors.line, 위에 primary 진행선 없음) + 우 `Building2` 배지. 트랙 위에 절대배치 vehicle 래퍼.
```css
@keyframes journey { from { left: 0% } to { left: calc(100% - 28px) } }
.vehicle { position:absolute; top:50%; translate:0 -50%; animation: journey 8s linear infinite; }
@media (prefers-reduced-motion: reduce){ .vehicle { animation:none; left:calc(50% - 14px);} }
```
vehicle 내부 아이콘은 모드 상태로 `TrainFront`/`Bus` 스왑(28px, primary). 모드 카드 선택 ↔ Journey 아이콘 동기(단일 state). transform 아닌 left 애니메이션은 GPU 비용이 있으나 요소 1개·8s linear라 허용, 단 `will-change:left` 금지하고 그대로 둔다(과최적화 불필요). 데스크탑 트랙 폭 = 콘텐츠 폭, 모바일 100%.

## §13 지도 v3.1 (3레이어·draw-on·셔틀 스무딩)
레이어 추가 순서(라인별): glow → casing → main. 예:
```js
map.addSource(`line-${id}`, { type:'geojson', lineMetrics:true, data: geojson });
const w = (a,b)=>['interpolate',['linear'],['zoom'],11.5,a,15,b];
map.addLayer({ id:`${id}-glow`, type:'line', source:`line-${id}`,
  paint:{ 'line-color':color, 'line-opacity':0.22, 'line-width':w(12,18) },
  layout:{ 'line-cap':'round','line-join':'round' } }, labelLayerId);
map.addLayer({ id:`${id}-casing`, ... 'line-color':'#FFFFFF','line-width':w(7,10) ...
map.addLayer({ id:`${id}-main`, ... 'line-color':color,'line-width':w(4.5,7) ...
```
draw-on: rAF로 p를 0→1 이징(720ms, ease). 매 프레임:
```js
map.setPaintProperty(`${id}-main`,'line-gradient',
 ['step',['line-progress'], color, Math.max(p,0.001), 'rgba(0,0,0,0)']);
```
casing·glow도 동일 step 적용(색만 각자). 완료 시 gradient 제거하고 단색 복귀. reduced-motion: 즉시 단색.
셔틀 스무딩: 목표 좌표는 누적거리 기반 등속 파라미터 t로 산출(정점 간 lerp), 표시 좌표는 지수 추종:
```js
disp.lng += (target.lng - disp.lng) * Math.min(1, dt*3);
disp.lat += (target.lat - disp.lat) * Math.min(1, dt*3);
marker.setLngLat(disp);
```
마커 옵션 `{ pitchAlignment:'map', rotationAlignment:'map' }`, 엘리먼트 `will-change:transform`. setLngLat는 rAF당 1회.
StopPopup: `new maplibregl.Popup({ closeButton:false, offset:18, className:'stop-popup' })` — .stop-popup .maplibregl-popup-content을 tokens로 스타일(white, radius lg, shadow lg, 패딩 16). 내용: 이름(h3)+한 줄+체류시간 chip+View line 텍스트버튼. 열릴 때 이전 팝업 remove.

## §14 LinePreviewOverlay (지도 위 글래스 미리보기)
트리거: 라인 카드 "View line". 라우팅 없음. 구조: `position:fixed inset:0 z-sheet` 래퍼 → scrim div(bg scrim, opacity 0→1 160ms, 클릭 닫기) + 패널: 데스크탑 우측 `width:420px; height:calc(100% - 헤더); top:헤더;` translateX(24px→0)+opacity spring 320ms, bg glass + blur(글래스 허용면), radius 좌측만 xl, shadow lg. 모바일: BottomSheet 재사용(전고 84%).
내용 순서 고정: 아이콘 배지+라인명(Kanit)+소요·가격 / 정류장 수직 미니 노선도(번호 원+이름+체류) / 선주문 한 줄 / CTA "Book and see details"(→ `/loop/:lineId`). **금지: StoryClips·DepartureCalendar·호스트·Reserve seats·좌석 문구.** 포커스 트랩+Escape. 글래스 위 텍스트는 ink 선명색만(HIG Materials).

## §15 StickyBookPanel (G-Local aside 이식)
```jsx
<div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12">
  <div>{/* 좌: hero, stops, stories */}</div>
  <aside className="mt-8 lg:mt-0 lg:sticky lg:top-24 h-fit">{/* 패널 */}</aside>
</div>
```
패널(white, radius xl, shadow md, p-24): 가격 h2 Kanit Bold + 기준 caption → DepartureCalendar(기존 §5 재사용, 폭 100%) → 회차 Chip 행 → Adult/Child Stepper 2행 → 디바이더 → 소계 행들 → 합계(semibold, primary) → CTA full. 상태는 URL 쿼리와 동기(뒤로가기 보존). 모바일(<lg): aside 숨김, 하단 고정 바(합계+CTA, safe-area 패딩) → 탭 시 BottomSheet에 패널 렌더.
sticky 유의: 부모 체인 `overflow` 설정 시 sticky 죽는다 — 그리드 부모까지 overflow 지정 금지.

## §16 무보더·엘리베이션 스윕 절차
1) `grep -rn "border" client/src` 전수 → 각 히트를 (a) 카드류: border 클래스 삭제+`shadow-sm` (b) 폼: border 삭제+focus 링 (c) 리스트 내부 디바이더: `border-b`→유지 가능하나 가급적 `<hr>`/divide-y with colors.line (d) 액센트 보더(border-l-2 등): 무조건 삭제. 2) hover에 `hover:shadow-md hover:-translate-y-0.5` 통일. 3) 완료 grep: `border-l-\|border-t-2\|border-2\|border-primary` 0건.

## §17 푸터·법적 페이지
푸터 링크는 `<a href="/legal/privacy" target="_blank" rel="noopener">`(내부지만 새 탭 의도라 a 태그 허용 — ROUTES §4의 유일 예외). 법적 페이지: 컨테이너 안 최상단 h1 + "Last updated: 2026-07-21" caption + 섹션 h2/본문 small~body, 리스트는 문단 나열(불릿 최소). 카피는 LEGAL_COPY.md 전문 — 임의 축약·창작 금지.

## §18 LangMenu·태국어
언어 상태: `lang ∈ 'en'|'ko'|'th'` Context. 폰트 스택: th일 때 body도 Kanit 우선(`'Kanit','Pretendard Variable',sans-serif`) — Kanit이 태국 문자 네이티브. 사전 병합: `import common from './common'` … `export default {...common,...gate,...}` 언어별 index. 키 동형 검사 스크립트는 3개 언어 교차로 확장.
