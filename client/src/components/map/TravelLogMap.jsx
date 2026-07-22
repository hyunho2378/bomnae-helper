// TravelLogMap · [V3] — 퇴역한 구 Loop 지도 코드(§13 3레이어 문법)의 재활용·개명(DEPRECATED 해제).
// 구 LoopMap의 라인 칩·정류장·POI·셔틀 시뮬 종속을 걷어내고 "발자취 다중 라인" 전용으로 경량화:
//   로그별 소스 1개(LineString) + §13 3레이어(glow→casing→main · line-cap round) ·
//   라인별 색 = tokens.logShades(primary 계열 명도 차등 단색 · 그라데이션 금지 §16.1) ·
//   강조 = highlightId 외 라인 40% 감쇠(지시 [1] · line-opacity만 조정 — 레이어 재생성 없음) ·
//   fitBounds(패딩 80) 1회 · §23 아티팩트 수술 준수(antialias·중복 가드·ResizeObserver·contextlost).
// props: { logs: [{ id, coords: [[lng,lat]...], color }], highlightId }
import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { colors, map as M } from '../../tokens';
import Skeleton from '../ui/Skeleton';

const GLOW_OPACITY = 0.22; // §13 명세값
const DIM = 0.4; // 지시 [1] 명세값 · 비강조 라인 40%
const FIT_PADDING = 80; // §32 준용
const w = (a, b) => ['interpolate', ['linear'], ['zoom'], 11.5, a, 15, b]; // §13 폭 보간

export default function TravelLogMap({ logs, highlightId }) {
  const node = useRef(null);
  const [mapObj, setMapObj] = useState(null);

  useEffect(() => {
    if (!node.current || !logs.length) return undefined;
    const map = new maplibregl.Map({
      container: node.current,
      style: M.styleUrl,
      center: M.center,
      zoom: M.zoom,
      pitch: M.pitch,
      bearing: M.bearing,
      antialias: M.antialias, // §23-1
      attributionControl: false,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.on('webglcontextlost', (e) => e.preventDefault?.()); // §23-5

    map.on('load', () => {
      const labelLayer = map
        .getStyle()
        .layers?.find((l) => l.type === 'symbol' && l.layout?.['text-field']);
      const round = { 'line-cap': 'round', 'line-join': 'round' };

      logs.forEach((log) => {
        if (map.getSource(`log-${log.id}`)) return; // §23-3 중복 가드
        map.addSource(`log-${log.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: log.coords },
          },
        });
        // §13 3레이어 · 발자취는 정적 단색(draw-on 없음 — 6개 동시 등장, 그라데이션 금지)
        [
          [`log-${log.id}-glow`, log.color, GLOW_OPACITY, w(12, 18)],
          [`log-${log.id}-casing`, colors.bg, 1, w(7, 10)],
          [`log-${log.id}-main`, log.color, 1, w(4.5, 7)],
        ].forEach(([id, color, opacity, width]) => {
          if (!map.getLayer(id)) {
            map.addLayer(
              {
                id,
                type: 'line',
                source: `log-${log.id}`,
                layout: round,
                paint: { 'line-color': color, 'line-opacity': opacity, 'line-width': width },
              },
              labelLayer?.id,
            );
          }
        });
      });

      // 전 발자취 fitBounds 1회
      const all = logs.flatMap((log) => log.coords);
      const bounds = all.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(all[0], all[0]),
      );
      map.fitBounds(bounds, { padding: FIT_PADDING, duration: 0 });

      setMapObj(map);
    });

    const ro = new ResizeObserver(() => map.resize()); // §23-6
    ro.observe(node.current);

    return () => {
      ro.disconnect();
      map.remove();
      setMapObj(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  // 강조 동기 · 강조 외 40% 감쇠(opacity만 · 색·폭 불변)
  useEffect(() => {
    if (!mapObj) return;
    logs.forEach((log) => {
      const dim = highlightId != null && highlightId !== log.id;
      const set = (id, base) => {
        if (mapObj.getLayer(id)) mapObj.setPaintProperty(id, 'line-opacity', dim ? base * DIM : base);
      };
      set(`log-${log.id}-glow`, GLOW_OPACITY);
      set(`log-${log.id}-casing`, 1);
      set(`log-${log.id}-main`, 1);
    });
  }, [mapObj, logs, highlightId]);

  return (
    <div className="relative h-full w-full bg-surface">
      <div ref={node} className="h-full w-full" />
      {!mapObj && <Skeleton className="absolute inset-0" />}
    </div>
  );
}
