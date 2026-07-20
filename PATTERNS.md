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
