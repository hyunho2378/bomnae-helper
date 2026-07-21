// DEPRECATED v4(IA §9.0) — 구 City Lines·Bag Delivery 잠정 퇴역: 라우트에서 제거됨. 삭제 금지, 재활용 예정.
// 시네마틱 라이브 라인 맵 · PATTERNS §4 골격 + §13 3레이어·draw-on + v3.2 §16.9·§23 수술.
// v3.2 초기화(§16.9): 초기 라인·정류장·셔틀 전부 비노출(레이어 부재 · lazy 마운트).
//   selectedLineId 선택 시에만 해당 라인 3레이어 draw-on + 마커 + 셔틀 등장, 해제 시 visibility 숨김.
// §23 수술 체크리스트: ① antialias: tokens.map.antialias ② extrusion opacity 1 +
//   vertical-gradient false ③ addLayer/addSource 전 getLayer/getSource 가드
//   ④ draw-on 종료 시 레이어 재생성 없이 단색 복귀 ⑤ webglcontextlost preventDefault+재초기화
//   ⑥ ResizeObserver → map.resize().
// hover 즉시 StopPopup(§16.9): 마커 mouseenter 즉시 onHoverStop, mouseleave → onHoverLeave
//   (200ms 유지 타이머는 Loop 페이지 소관). 터치 탭 = click 핸들러 동등.
// POI 앵커(§16.9): 무채색 미니 라벨 마커 3개(≤5) 상시 표시, 클릭 → onPoiSelect(관련 라인).
// props(v3.2 · Loop 페이지 전용):
// { selectedLineId, focusStopId, popupStopId, onSelectStop, onHoverStop, onHoverLeave,
//   onPopupEnter, onPopupLeave, onClosePopup, onViewLine, onPoiSelect }
import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { colors, map as M, lineColors } from '../../tokens';
import { getLines, getStops } from '../../data/api';
import { useLang } from '../../i18n/LangContext';
import Skeleton from '../ui/Skeleton';
import StopPopup from './StopPopup';
import useShuttleSim from './useShuttleSim';
import './LoopMap.css';

const LINE_IDS = ['potato', 'dakgalbi', 'lake'];

// PATTERNS §13 명세값(지도 레이어 수치는 명세 허용 · 주석 근거)
const DRAW_MS = 720; // draw-on 720ms
const GLOW_OPACITY = 0.22; // glow 컬러 22%
const TRANSPARENT = 'rgba(0,0,0,0)'; // §13 기준 구현 상수(미그린 구간)
const w = (a, b) => ['interpolate', ['linear'], ['zoom'], 11.5, a, 15, b]; // 폭 보간 zoom 11.5→15
const easeOut = (x) => 1 - (1 - x) ** 3; // §13 "ease" 이징(가속 후 감속)

// §23-4 · draw-on 종료 상태: gradient 제거(undefined) 대신 단색 복귀 표현식
// (레이어 재생성 없이 line-color와 동일한 상수 그라디언트로 고정 · 검은 플래시 방지)
const solidGradient = (color) => [
  'interpolate',
  ['linear'],
  ['line-progress'],
  0,
  color,
  1,
  color,
];

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 정류장 순서대로 닫힌 루프 좌표(순환 라인 · 마지막에 첫 좌표로 복귀)
const loopCoords = (stops) => {
  const coords = stops.map((s) => [s.lng, s.lat]);
  return coords.length ? [...coords, coords[0]] : coords;
};

// 라인별 3레이어 [레이어 id, gradient 색] · glow/main은 라인 컬러, casing은 흰색(bg 토큰)
const lineLayers = (id) => [
  [`line-${id}-glow`, lineColors[id]],
  [`line-${id}-casing`, colors.bg],
  [`line-${id}-main`, lineColors[id]],
];

// 춘천 POI 앵커(§16.9 · 5개 상한 · 현재 3개) · 좌표 APPROX · PLACEHOLDER, verify on site
// lineId = 클릭 시 하이라이트할 관련 라인 칩
const POIS = [
  { id: 'poi-soyang-dam', labelKey: 'loop.poi.soyangDam', lineId: 'potato', lng: 127.796, lat: 37.951 },
  { id: 'poi-myeongdong', labelKey: 'loop.poi.myeongdong', lineId: 'dakgalbi', lng: 127.729, lat: 37.881 },
  { id: 'poi-namchuncheon', labelKey: 'loop.poi.namchuncheon', lineId: 'lake', lng: 127.721, lat: 37.864 },
];

export default function LoopMap({
  selectedLineId,
  focusStopId,
  popupStopId,
  onSelectStop,
  onHoverStop,
  onHoverLeave,
  onPopupEnter,
  onPopupLeave,
  onClosePopup,
  onViewLine,
  onPoiSelect,
}) {
  const node = useRef(null);
  const ref = useRef(null);
  const markersRef = useRef({}); // stopId → { marker, el, lineId }
  const poisRef = useRef([]); // { marker, el, labelKey }
  const drawRef = useRef({}); // lineId → rAF id (draw-on 진행 중)
  // 로드 완료된 맵 인스턴스를 state로 보유 · StrictMode 이펙트 재실행 시
  // 렌더 시점 ref 캡처(파괴된 인스턴스)로 스테일 참조가 생기는 것을 방지.
  const [mapObj, setMapObj] = useState(null);
  // §23-5 · WebGL 컨텍스트 유실 시 재초기화 세대(증가 → init 이펙트 재실행)
  const [gen, setGen] = useState(0);
  const [stopsByLine, setStopsByLine] = useState(null);
  const { t } = useLang();

  // 데이터 로드 · api.js만 호출(전부 async, COMPONENTS A2)
  useEffect(() => {
    let alive = true;
    (async () => {
      await getLines(); // PHASE 3 대비 창구 워밍(라인 메타는 칩·패널 담당)
      const entries = await Promise.all(
        LINE_IDS.map(async (id) => [id, await getStops(id)]),
      );
      if (alive) setStopsByLine(Object.fromEntries(entries));
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 맵 초기화 · PATTERNS §4 골격 + §23 수술. gen 증가 시 전체 재초기화(§23-5).
  useEffect(() => {
    if (!node.current) return undefined;
    const map = new maplibregl.Map({
      container: node.current,
      style: M.styleUrl,
      center: M.center,
      zoom: M.zoom,
      pitch: M.pitch,
      bearing: M.bearing,
      antialias: M.antialias, // §23-1 · tokens.map.antialias
      attributionControl: false,
    });
    ref.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      const labelLayer = map
        .getStyle()
        .layers?.find((l) => l.type === 'symbol' && l.layout?.['text-field']);
      // §23-3 · 재마운트·HMR 중복 addLayer 가드
      if (!map.getLayer('bh-3d-buildings')) {
        try {
          map.addLayer(
            {
              id: 'bh-3d-buildings',
              source: 'openmaptiles',
              'source-layer': 'building',
              type: 'fill-extrusion',
              minzoom: M.extrusionMinZoom,
              paint: {
                'fill-extrusion-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'render_height'],
                  0, M.extrusion.low,
                  40, M.extrusion.mid,
                  120, M.extrusion.high,
                ],
                'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 5],
                'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
                // §23-2 · 반투명 z-fighting(검은 깨짐) 수술: 불투명 고정 + 수직 그라데이션 차단
                'fill-extrusion-opacity': M.extrusionOpacity,
                'fill-extrusion-vertical-gradient': false,
              },
            },
            labelLayer?.id,
          );
        } catch {
          /* base style may already provide 3D buildings */
        }
      }
      if (import.meta.env.DEV) window.__bhLoopMap = map; // QA 전용 훅(dev 빌드 한정 · 검증 스크립트)
      setMapObj(map);
    });

    // §23-5 · WebGL 컨텍스트 유실 → preventDefault + 재초기화(gen 증가로 이 이펙트 재실행)
    const canvas = map.getCanvas();
    const onContextLost = (e) => {
      e.preventDefault();
      setGen((g) => g + 1);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    // §23-6 · 컨테이너 리사이즈(브레이크포인트 전환) 대응 · trackResize는 window만 감지
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(node.current);

    return () => {
      canvas.removeEventListener('webglcontextlost', onContextLost);
      ro.disconnect();
      Object.values(drawRef.current).forEach((raf) => cancelAnimationFrame(raf));
      drawRef.current = {};
      map.remove();
      ref.current = null;
      markersRef.current = {};
      poisRef.current = [];
      if (import.meta.env.DEV) delete window.__bhLoopMap;
      setMapObj(null);
    };
  }, [gen]);

  // 콜백 최신 참조(마커 리스너는 1회 바인딩)
  const cbRef = useRef({});
  useEffect(() => {
    cbRef.current = { onSelectStop, onHoverStop, onHoverLeave, onPoiSelect };
  }, [onSelectStop, onHoverStop, onHoverLeave, onPoiSelect]);

  // draw-on · PATTERNS §13: line-gradient progress 0→1(720ms ease).
  // 종료 시 §23-4: gradient 제거 대신 단색 상수 그라디언트 고정(레이어 재생성 없음).
  // reduced-motion이면 즉시 완성 상태.
  const drawOn = (map, id) => {
    const layers = lineLayers(id);
    if (drawRef.current[id]) cancelAnimationFrame(drawRef.current[id]);
    if (reducedMotion()) {
      layers.forEach(([lid, color]) => {
        if (map.getLayer(lid)) map.setPaintProperty(lid, 'line-gradient', solidGradient(color));
      });
      return;
    }
    const startT = performance.now();
    const step = (now) => {
      const p = Math.min((now - startT) / DRAW_MS, 1);
      const eased = easeOut(p);
      layers.forEach(([lid, color]) => {
        if (!map.getLayer(lid)) return;
        if (p >= 1) {
          map.setPaintProperty(lid, 'line-gradient', solidGradient(color)); // §23-4 단색 복귀
        } else {
          map.setPaintProperty(lid, 'line-gradient', [
            'step',
            ['line-progress'],
            color,
            Math.max(eased, 0.001),
            TRANSPARENT,
          ]);
        }
      });
      if (p < 1) {
        drawRef.current[id] = requestAnimationFrame(step);
      } else {
        delete drawRef.current[id];
      }
    };
    drawRef.current[id] = requestAnimationFrame(step);
  };

  // 라인 lazy 마운트(§16.9 초기 레이어 부재) · 선택된 라인만 최초 1회 add(§23-3 가드),
  // 이후 visibility 토글. 선택 시 draw-on + 마커 표시.
  useEffect(() => {
    const map = mapObj;
    if (!map || !stopsByLine) return;
    const labelLayer = map
      .getStyle()
      .layers?.find((l) => l.type === 'symbol' && l.layout?.['text-field']);

    // 선택 라인 최초 마운트 · 소스/레이어/마커 생성
    const id = selectedLineId;
    if (id && !map.getSource(`line-${id}`)) {
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: loopCoords(stopsByLine[id]) },
      };
      // lineMetrics:true · line-gradient(draw-on) 필수 옵션(§13)
      map.addSource(`line-${id}`, { type: 'geojson', lineMetrics: true, data: geojson });
      const round = { 'line-cap': 'round', 'line-join': 'round' };
      const defs = [
        [`line-${id}-glow`, { 'line-color': lineColors[id], 'line-opacity': GLOW_OPACITY, 'line-width': w(12, 18) }],
        [`line-${id}-casing`, { 'line-color': colors.bg, 'line-width': w(7, 10) }],
        [`line-${id}-main`, { 'line-color': lineColors[id], 'line-width': w(4.5, 7) }],
      ];
      defs.forEach(([lid, paint]) => {
        if (map.getLayer(lid)) return; // §23-3 가드
        map.addLayer(
          { id: lid, type: 'line', source: `line-${id}`, layout: round, paint },
          labelLayer?.id,
        );
      });
    }
    if (id) {
      stopsByLine[id].forEach((stop) => {
        if (markersRef.current[stop.id]) return;
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'stop-marker';
        // --line-color 인라인 CSS 변수 주입 · 값은 tokens.lineColors(PATTERNS §4)
        el.style.setProperty('--line-color', lineColors[id]);
        // 언어 중립 라벨(마커는 명령적 생성이라 토글 재렌더 밖 · 대체 경로는 정류장 리스트)
        el.setAttribute('aria-label', `${stop.name_en} · ${stop.name_ko}`);
        el.addEventListener('click', (e) => {
          e.stopPropagation(); // 지도 click(팝업 닫기)으로 전파 차단 · StopPopup 유지
          cbRef.current.onSelectStop?.(stop);
        });
        // hover 즉시 StopPopup(§16.9) · leave 200ms 유지는 Loop 페이지 타이머 소관.
        // 터치 기기는 탭 = click 핸들러가 동등 동작.
        el.addEventListener('mouseenter', () => cbRef.current.onHoverStop?.(stop));
        el.addEventListener('mouseleave', () => cbRef.current.onHoverLeave?.());
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([stop.lng, stop.lat])
          .addTo(map);
        markersRef.current[stop.id] = { marker, el, lineId: id };
      });
    }

    // visibility 토글 · 선택 라인만 표시(§16.9 단일 라인)
    LINE_IDS.forEach((lineId) => {
      const on = lineId === selectedLineId;
      lineLayers(lineId).forEach(([lid]) => {
        if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', on ? 'visible' : 'none');
      });
    });
    Object.values(markersRef.current).forEach(({ el, lineId }) => {
      el.style.display = lineId === selectedLineId ? '' : 'none';
    });

    // 선택 시 draw-on 재생(§16.9 "칩 선택 시에만 draw-on 등장")
    if (selectedLineId && map.getLayer(`line-${selectedLineId}-main`)) {
      drawOn(map, selectedLineId);
    }
  }, [mapObj, stopsByLine, selectedLineId]);

  // POI 앵커 · 라인 미선택 상태에서도 상시 표시(§16.9). 무채색 미니 라벨 마커(HTML).
  useEffect(() => {
    const map = mapObj;
    if (!map) return undefined;
    const created = [];
    POIS.forEach((poi) => {
      const el = document.createElement('button');
      el.type = 'button';
      // 무채색(white/ink) 미니 라벨 · 토큰 클래스만(§16.9)
      el.className =
        'poi-marker flex h-24 items-center rounded-pill bg-white px-12 text-caption font-semibold text-ink shadow-sm';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        cbRef.current.onPoiSelect?.(poi.lineId); // 관련 라인 칩 하이라이트(§16.9)
      });
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([poi.lng, poi.lat])
        .addTo(map);
      const entry = { marker, el, labelKey: poi.labelKey };
      poisRef.current.push(entry);
      created.push(entry);
    });
    return () => {
      created.forEach((entry) => {
        entry.marker.remove();
        const i = poisRef.current.indexOf(entry);
        if (i >= 0) poisRef.current.splice(i, 1);
      });
    };
  }, [mapObj]);

  // POI 라벨 텍스트 · 언어 전환 동기(마커는 명령적 생성이라 t 갱신 시 직접 반영)
  useEffect(() => {
    poisRef.current.forEach(({ el, labelKey }) => {
      el.textContent = t(labelKey);
    });
  }, [t, mapObj]);

  // 포커스 카메라 · 정류장: PATTERNS §4 flyTo(zoom 15·pitchFocus·bearing -22 명세값),
  // 라인 선택: 라인 중심, 해제: 기본 카메라 복귀. 초기 무선택 상태에서는 이동하지 않는다.
  const prevCameraRef = useRef({ lineId: null, stopId: null });
  useEffect(() => {
    const map = mapObj;
    if (!map || !stopsByLine) return;
    const prev = prevCameraRef.current;
    prevCameraRef.current = { lineId: selectedLineId, stopId: focusStopId };
    if (focusStopId) {
      const stop = LINE_IDS.flatMap((id) => stopsByLine[id]).find((s) => s.id === focusStopId);
      if (stop) {
        map.flyTo({
          center: [stop.lng, stop.lat],
          zoom: 15, // DESIGN §11 정류장 포커스 명세값
          pitch: M.pitchFocus,
          bearing: -22, // PATTERNS §4 기준 구현 값
          duration: M.flyDuration,
          essential: true,
        });
      }
      return;
    }
    if (selectedLineId) {
      const stops = stopsByLine[selectedLineId];
      const center = [
        stops.reduce((sum, s) => sum + s.lng, 0) / stops.length,
        stops.reduce((sum, s) => sum + s.lat, 0) / stops.length,
      ];
      map.flyTo({
        center,
        zoom: M.zoom,
        pitch: M.pitch,
        bearing: M.bearing,
        duration: M.flyDuration,
        essential: true,
      });
      return;
    }
    // 해제 복귀 · 직전에 선택/포커스가 있었을 때만(초기 진입 이동 방지)
    if (prev.lineId || prev.stopId) {
      map.flyTo({
        center: M.center,
        zoom: M.zoom,
        pitch: M.pitch,
        bearing: M.bearing,
        duration: M.flyDuration,
        essential: true,
      });
    }
  }, [focusStopId, selectedLineId, mapObj, stopsByLine]);

  // 마커 active 상태 · 사이즈 스텝 + 펄스 링(LoopMap.css)
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([stopId, { el }]) => {
      el.classList.toggle('active', stopId === focusStopId);
    });
  }, [focusStopId, mapObj, stopsByLine, selectedLineId]);

  // 셔틀 시뮬레이션 · 선택 라인만 운행(§16.9 · 칩 선택 시 등장), reduced-motion 정지
  const shuttlePaths = useMemo(() => {
    if (!stopsByLine || !selectedLineId) return null;
    return {
      [selectedLineId]: {
        coords: loopCoords(stopsByLine[selectedLineId]),
        characterImg: `/images/crew/${selectedLineId}.png`, // PLACEHOLDER · 봄내크루 에셋 대기
        label: `${selectedLineId} shuttle`,
      },
    };
  }, [stopsByLine, selectedLineId]);
  useShuttleSim(mapObj, shuttlePaths);

  // StopPopup 대상 정류장 · 동시에 1개(단일 인스턴스)
  const popupStop =
    popupStopId && stopsByLine
      ? LINE_IDS.flatMap((id) => stopsByLine[id]).find((s) => s.id === popupStopId) ?? null
      : null;

  return (
    <div role="region" aria-label={t('loop.map.label')} className="relative h-full w-full bg-surface">
      <div ref={node} className="h-full w-full" />
      <StopPopup
        map={mapObj}
        stop={popupStop}
        onClose={onClosePopup}
        onViewLine={onViewLine}
        onPointerEnter={onPopupEnter}
        onPointerLeave={onPopupLeave}
      />
      {!mapObj && <Skeleton className="absolute inset-0" />}
    </div>
  );
}
