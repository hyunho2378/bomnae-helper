// 시네마틱 라이브 라인 맵 · PATTERNS §4 골격 + v3.1 §13 개정:
// ① 소스 lineMetrics:true ② 라인별 3레이어 glow(컬러 22%, 12→18px) → casing(흰, 7→10px)
//    → main(컬러, 4.5→7px), line-cap/join round ③ draw-on: rAF로 line-gradient progress
//    0→1(720ms ease), 완료 시 단색 복귀, reduced-motion 즉시 ④ 셔틀 지수 lerp 스무딩(useShuttleSim)
// ⑤ StopPopup(동시 1개 · 지도 탭·Escape 닫기).
// props(v3.1 확장 · Loop 페이지 전용, 완료 보고 명시):
// { focusLineId, focusStopId, popupStopId, onSelectStop, onClosePopup, onViewLine }
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

// PATTERNS §13 명세값(이 지도 레이어 수치는 명세 허용 · 주석 근거)
const DRAW_MS = 720; // draw-on 720ms
const GLOW_OPACITY = 0.22; // glow 컬러 22%
const TRANSPARENT = 'rgba(0,0,0,0)'; // §13 기준 구현 상수(미그린 구간)
const w = (a, b) => ['interpolate', ['linear'], ['zoom'], 11.5, a, 15, b]; // 폭 보간 zoom 11.5→15
const easeOut = (x) => 1 - (1 - x) ** 3; // §13 "ease" 이징(가속 후 감속)

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

export default function LoopMap({
  focusLineId,
  focusStopId,
  popupStopId,
  onSelectStop,
  onClosePopup,
  onViewLine,
}) {
  const node = useRef(null);
  const ref = useRef(null);
  const markersRef = useRef({}); // stopId → { marker, el }
  const drawRef = useRef({}); // lineId → rAF id (draw-on 진행 중)
  // 로드 완료된 맵 인스턴스를 state로 보유 · StrictMode 이펙트 재실행 시
  // 렌더 시점 ref 캡처(파괴된 인스턴스)로 스테일 참조가 생기는 것을 방지.
  const [mapObj, setMapObj] = useState(null);
  const [stopsByLine, setStopsByLine] = useState(null);
  const { t } = useLang();

  // 데이터 로드 · api.js만 호출(전부 async, COMPONENTS A2)
  useEffect(() => {
    let alive = true;
    (async () => {
      await getLines(); // PHASE 3 대비 창구 워밍(라인 메타는 카드 담당)
      const entries = await Promise.all(
        LINE_IDS.map(async (id) => [id, await getStops(id)]),
      );
      if (alive) setStopsByLine(Object.fromEntries(entries));
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 맵 초기화 · PATTERNS §4 골격 그대로
  useEffect(() => {
    if (!node.current || ref.current) return undefined;
    const map = new maplibregl.Map({
      container: node.current,
      style: M.styleUrl,
      center: M.center,
      zoom: M.zoom,
      pitch: M.pitch,
      bearing: M.bearing,
      antialias: true,
      attributionControl: false,
    });
    ref.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      const labelLayer = map
        .getStyle()
        .layers?.find((l) => l.type === 'symbol' && l.layout?.['text-field']);
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
              'fill-extrusion-opacity': 0.88,
            },
          },
          labelLayer?.id,
        );
      } catch {
        /* base style may already provide 3D buildings */
      }
      if (import.meta.env.DEV) window.__bhLoopMap = map; // QA 전용 훅(dev 빌드 한정 · 검증 스크립트)
      setMapObj(map);
    });

    // 컨테이너 리사이즈(브레이크포인트 전환) 대응 · trackResize는 window만 감지
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(node.current);

    return () => {
      ro.disconnect();
      Object.values(drawRef.current).forEach((raf) => cancelAnimationFrame(raf));
      drawRef.current = {};
      map.remove();
      ref.current = null;
      markersRef.current = {};
      if (import.meta.env.DEV) delete window.__bhLoopMap;
      setMapObj(null);
    };
  }, []);

  // onSelectStop 최신 참조(마커 리스너는 1회 바인딩)
  const onSelectStopRef = useRef(onSelectStop);
  useEffect(() => {
    onSelectStopRef.current = onSelectStop;
  }, [onSelectStop]);

  // draw-on · PATTERNS §13: line-gradient progress 0→1(720ms ease), 완료 시 단색 복귀.
  // reduced-motion이면 즉시 완성 상태.
  const drawOn = (map, id) => {
    const layers = lineLayers(id);
    if (drawRef.current[id]) cancelAnimationFrame(drawRef.current[id]);
    if (reducedMotion()) {
      layers.forEach(([lid]) => {
        if (map.getLayer(lid)) map.setPaintProperty(lid, 'line-gradient', null);
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
          map.setPaintProperty(lid, 'line-gradient', null); // 완료 · 단색 복귀(§13)
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

  // 라인 3개 × 3레이어(glow → casing → main) + 정류장 마커 · 스타일 로드 후 1회
  useEffect(() => {
    const map = mapObj;
    if (!map || !stopsByLine) return undefined;
    const labelLayer = map
      .getStyle()
      .layers?.find((l) => l.type === 'symbol' && l.layout?.['text-field']);

    LINE_IDS.forEach((id) => {
      if (map.getSource(`line-${id}`)) return; // StrictMode 재실행 가드
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: loopCoords(stopsByLine[id]) },
      };
      // lineMetrics:true · line-gradient(draw-on) 필수 옵션(§13)
      map.addSource(`line-${id}`, { type: 'geojson', lineMetrics: true, data: geojson });
      const round = { 'line-cap': 'round', 'line-join': 'round' };
      map.addLayer(
        {
          id: `line-${id}-glow`,
          type: 'line',
          source: `line-${id}`,
          layout: round,
          paint: {
            'line-color': lineColors[id],
            'line-opacity': GLOW_OPACITY,
            'line-width': w(12, 18),
          },
        },
        labelLayer?.id,
      );
      map.addLayer(
        {
          id: `line-${id}-casing`,
          type: 'line',
          source: `line-${id}`,
          layout: round,
          paint: {
            'line-color': colors.bg, // 케이싱 흰색 · 값은 토큰(bg=순백)
            'line-width': w(7, 10),
          },
        },
        labelLayer?.id,
      );
      map.addLayer(
        {
          id: `line-${id}-main`,
          type: 'line',
          source: `line-${id}`,
          layout: round,
          paint: {
            'line-color': lineColors[id],
            'line-width': w(4.5, 7),
          },
        },
        labelLayer?.id,
      );
      drawOn(map, id); // 페이지 진입 draw-on(§13 · DESIGN §11)
    });

    const created = [];
    LINE_IDS.forEach((id) => {
      stopsByLine[id].forEach((stop) => {
        if (markersRef.current[stop.id]) return;
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'stop-marker';
        // --line-color 인라인 CSS 변수 주입 · 값은 tokens.lineColors(PATTERNS §4)
        el.style.setProperty('--line-color', lineColors[id]);
        // 언어 중립 라벨(마커는 명령적 생성이라 토글 재렌더 밖 · 대체 경로는 라인 카드)
        el.setAttribute('aria-label', `${stop.name_en} · ${stop.name_ko}`);
        el.addEventListener('click', (e) => {
          e.stopPropagation(); // 지도 click(팝업 닫기)으로 전파 차단 · StopPopup 유지
          onSelectStopRef.current?.(stop);
        });
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([stop.lng, stop.lat])
          .addTo(map);
        markersRef.current[stop.id] = { marker, el };
        created.push(stop.id);
      });
    });

    return () => {
      created.forEach((stopId) => {
        markersRef.current[stopId]?.marker.remove();
        delete markersRef.current[stopId];
      });
    };
  }, [mapObj, stopsByLine]);

  // 라인 강조 · 비활성 라인 opacity 0.4(§4) · glow는 기본 0.22에 동일 배율
  useEffect(() => {
    const map = mapObj;
    if (!map || !stopsByLine) return;
    LINE_IDS.forEach((id) => {
      if (!map.getLayer(`line-${id}-main`)) return;
      const factor = !focusLineId || focusLineId === id ? 1 : 0.4;
      map.setPaintProperty(`line-${id}-main`, 'line-opacity', factor);
      map.setPaintProperty(`line-${id}-casing`, 'line-opacity', factor);
      map.setPaintProperty(`line-${id}-glow`, 'line-opacity', GLOW_OPACITY * factor);
    });
    // 라인 선택 시 해당 라인 draw-on 재생(DESIGN §11 "페이지 진입·라인 선택 시")
    if (focusLineId && map.getLayer(`line-${focusLineId}-main`)) {
      drawOn(map, focusLineId);
    }
  }, [focusLineId, mapObj, stopsByLine]);

  // 포커스 카메라 · 정류장: PATTERNS §4 flyTo(zoom 15·pitchFocus·bearing -22 명세값),
  // 라인만: 해당 라인 중심으로 기본 카메라(tokens.map) 복귀
  useEffect(() => {
    const map = mapObj;
    if (!map || !stopsByLine) return;
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
    if (focusLineId) {
      const stops = stopsByLine[focusLineId];
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
    } else {
      map.flyTo({
        center: M.center,
        zoom: M.zoom,
        pitch: M.pitch,
        bearing: M.bearing,
        duration: M.flyDuration,
        essential: true,
      });
    }
  }, [focusStopId, focusLineId, mapObj, stopsByLine]);

  // 마커 active 상태 · 사이즈 스텝 + 펄스 링(LoopMap.css)
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([stopId, { el }]) => {
      el.classList.toggle('active', stopId === focusStopId);
    });
  }, [focusStopId, mapObj, stopsByLine]);

  // 셔틀 시뮬레이션 · 등속 target + 지수 lerp 추종(PATTERNS §13), reduced-motion 정지
  const shuttlePaths = useMemo(() => {
    if (!stopsByLine) return null;
    return Object.fromEntries(
      LINE_IDS.map((id) => [
        id,
        {
          coords: loopCoords(stopsByLine[id]),
          characterImg: `/images/crew/${id}.png`, // PLACEHOLDER · 봄내크루 에셋 대기
          label: `${id} shuttle`,
        },
      ]),
    );
  }, [stopsByLine]);
  useShuttleSim(mapObj, shuttlePaths);

  // StopPopup 대상 정류장 · 동시에 1개(단일 인스턴스)
  const popupStop =
    popupStopId && stopsByLine
      ? LINE_IDS.flatMap((id) => stopsByLine[id]).find((s) => s.id === popupStopId) ?? null
      : null;

  return (
    <div role="region" aria-label={t('loop.map.label')} className="relative h-full w-full bg-surface">
      <div ref={node} className="h-full w-full" />
      <StopPopup map={mapObj} stop={popupStop} onClose={onClosePopup} onViewLine={onViewLine} />
      {!mapObj && <Skeleton className="absolute inset-0" />}
    </div>
  );
}
