// 시네마틱 라이브 라인 맵 — PATTERNS §4 포팅 그대로(변경점 2가지 포함:
// ① extrusion 컬러 tokens.map.extrusion ② 마커 scale 금지 → 사이즈 스텝 22→28 + 펄스 링).
// props 계약(COMPONENTS C): { focusLineId, focusStopId, onSelectStop }.
// 데이터는 api.js 단일 창구에서 직접 로드(라인 GeoJSON·마커·셔틀은 이 컴포넌트 소관).
import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { colors, map as M, lineColors } from '../../tokens';
import { getLines, getStops } from '../../data/api';
import { useLang } from '../../i18n/LangContext';
import Skeleton from '../ui/Skeleton';
import useShuttleSim from './useShuttleSim';
import './LoopMap.css';

const LINE_IDS = ['potato', 'dakgalbi', 'lake'];

// 정류장 순서대로 닫힌 루프 좌표(순환 라인 — 마지막에 첫 좌표로 복귀)
const loopCoords = (stops) => {
  const coords = stops.map((s) => [s.lng, s.lat]);
  return coords.length ? [...coords, coords[0]] : coords;
};

export default function LoopMap({ focusLineId, focusStopId, onSelectStop }) {
  const node = useRef(null);
  const ref = useRef(null);
  const markersRef = useRef({}); // stopId → { marker, el }
  // 로드 완료된 맵 인스턴스를 state로 보유 — StrictMode 이펙트 재실행 시
  // 렌더 시점 ref 캡처(파괴된 인스턴스)로 스테일 참조가 생기는 것을 방지.
  const [mapObj, setMapObj] = useState(null);
  const [stopsByLine, setStopsByLine] = useState(null);
  const { t } = useLang();

  // 데이터 로드 — api.js만 호출(전부 async, COMPONENTS A2)
  useEffect(() => {
    let alive = true;
    (async () => {
      await getLines(); // PHASE 3 대비 창구 워밍(라인 메타는 패널 담당)
      const entries = await Promise.all(
        LINE_IDS.map(async (id) => [id, await getStops(id)]),
      );
      if (alive) setStopsByLine(Object.fromEntries(entries));
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 맵 초기화 — PATTERNS §4 골격 그대로
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
      setMapObj(map);
    });

    // 컨테이너 리사이즈(브레이크포인트 전환) 대응 — trackResize는 window만 감지
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(node.current);

    return () => {
      ro.disconnect();
      map.remove();
      ref.current = null;
      markersRef.current = {};
      setMapObj(null);
    };
  }, []);

  // onSelectStop 최신 참조(마커 리스너는 1회 바인딩)
  const onSelectStopRef = useRef(onSelectStop);
  useEffect(() => {
    onSelectStopRef.current = onSelectStop;
  }, [onSelectStop]);

  // 라인 3개(흰 케이싱 → 컬러) + 정류장 마커 — 스타일 로드 후 1회
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
      map.addSource(`line-${id}`, { type: 'geojson', data: geojson });
      map.addLayer(
        {
          id: `line-${id}-casing`,
          type: 'line',
          source: `line-${id}`,
          paint: {
            'line-color': colors.bg, // PATTERNS §4 케이싱 흰색 — 값은 토큰(bg=순백)
            'line-width': ['interpolate', ['linear'], ['zoom'], 11.5, 5, 15, 10],
          },
        },
        labelLayer?.id,
      );
      map.addLayer(
        {
          id: `line-${id}`,
          type: 'line',
          source: `line-${id}`,
          paint: {
            'line-color': lineColors[id],
            'line-width': ['interpolate', ['linear'], ['zoom'], 11.5, 3, 15, 7],
          },
        },
        labelLayer?.id,
      );
    });

    const created = [];
    LINE_IDS.forEach((id) => {
      stopsByLine[id].forEach((stop) => {
        if (markersRef.current[stop.id]) return;
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'stop-marker';
        // --line-color 인라인 CSS 변수 주입 — 값은 tokens.lineColors(PATTERNS §4)
        el.style.setProperty('--line-color', lineColors[id]);
        // 언어 중립 라벨(마커는 명령적 생성이라 토글 재렌더 밖 — 대체 경로는 LinePanel)
        el.setAttribute('aria-label', `${stop.name_en} · ${stop.name_ko}`);
        el.addEventListener('click', () => onSelectStopRef.current?.(stop));
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

  // 라인 강조 — 비활성 라인 opacity 0.4 (PATTERNS §4)
  useEffect(() => {
    const map = mapObj;
    if (!map || !stopsByLine) return;
    LINE_IDS.forEach((id) => {
      if (!map.getLayer(`line-${id}`)) return;
      const opacity = !focusLineId || focusLineId === id ? 1 : 0.4;
      map.setPaintProperty(`line-${id}`, 'line-opacity', opacity);
      map.setPaintProperty(`line-${id}-casing`, 'line-opacity', opacity);
    });
  }, [focusLineId, mapObj, stopsByLine]);

  // 포커스 카메라 — 정류장: PATTERNS §4 flyTo(zoom 15·pitchFocus·bearing -22 명세값),
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

  // 마커 active 상태 — 사이즈 스텝 + 펄스 링(LoopMap.css)
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([stopId, { el }]) => {
      el.classList.toggle('active', stopId === focusStopId);
    });
  }, [focusStopId, mapObj, stopsByLine]);

  // 셔틀 시뮬레이션 — rAF 보간 ≈90초/루프, reduced-motion 정지(useShuttleSim)
  const shuttlePaths = useMemo(() => {
    if (!stopsByLine) return null;
    return Object.fromEntries(
      LINE_IDS.map((id) => [
        id,
        {
          coords: loopCoords(stopsByLine[id]),
          characterImg: `/images/crew/${id}.png`, // PLACEHOLDER — 봄내크루 에셋 대기
          label: `${id} shuttle`,
        },
      ]),
    );
  }, [stopsByLine]);
  useShuttleSim(mapObj, shuttlePaths);

  return (
    <div role="region" aria-label={t('loop.map.label')} className="relative h-full w-full bg-surface">
      <div ref={node} className="h-full w-full" />
      {!mapObj && <Skeleton className="absolute inset-0" />}
    </div>
  );
}
