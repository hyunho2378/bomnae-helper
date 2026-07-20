// 셔틀 시뮬레이션 훅 · PATTERNS §4: 라인 좌표 배열을 rAF로 선형 보간, 1루프 ≈ 90초.
// Marker.setLngLat만 갱신. reduced-motion 시 첫 정류장 정지 위치(rAF 없음).
// MVP는 시뮬레이션 이동(DESIGN §11) · PHASE 3 실차 GPS로 교체 지점.
import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { lineColors } from '../../tokens';

const LOOP_MS = 90000; // PATTERNS §4 명세: 1루프 ≈ 90초

// 셔틀 마커 엘리먼트 · 라인 컬러 채움 + 캐릭터 미니 아이콘(DESIGN §11).
// 크기·모양은 tailwind 토큰 클래스만 사용(h-32/w-32/h-20/w-20/rounded-pill/border-2).
function makeShuttleElement(lineId, characterImg, label) {
  const el = document.createElement('div');
  el.className =
    'flex h-32 w-32 items-center justify-center rounded-pill border-2 border-white';
  el.style.background = lineColors[lineId]; // tokens.lineColors · HEX 직입력 아님
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', label);
  const img = document.createElement('img');
  img.src = characterImg; // PLACEHOLDER · 봄내크루 배경 제거본 에셋 대기(PROGRESS 준비물)
  img.alt = '';
  img.className = 'h-20 w-20 rounded-pill object-cover';
  el.appendChild(img);
  return el;
}

// 경로 누적 길이(평면 근사 · 시각 시뮬 용도라 충분) 기반 선형 보간.
function pointAt(coords, cumulative, total, t) {
  const target = t * total;
  let i = 1;
  while (i < cumulative.length - 1 && cumulative[i] < target) i += 1;
  const segStart = cumulative[i - 1];
  const segLen = cumulative[i] - segStart || 1;
  const k = (target - segStart) / segLen;
  const [x1, y1] = coords[i - 1];
  const [x2, y2] = coords[i];
  return [x1 + (x2 - x1) * k, y1 + (y2 - y1) * k];
}

// map: maplibregl.Map 인스턴스(로드 완료 후) | null
// paths: { lineId: { coords: [[lng,lat],...], characterImg, label } } · 닫힌 루프 좌표
export default function useShuttleSim(map, paths) {
  useEffect(() => {
    if (!map || !paths) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shuttles = Object.entries(paths).map(([lineId, { coords, characterImg, label }]) => {
      const cumulative = [0];
      for (let i = 1; i < coords.length; i += 1) {
        const [x1, y1] = coords[i - 1];
        const [x2, y2] = coords[i];
        cumulative.push(cumulative[i - 1] + Math.hypot(x2 - x1, y2 - y1));
      }
      const marker = new maplibregl.Marker({
        element: makeShuttleElement(lineId, characterImg, label),
      })
        .setLngLat(coords[0])
        .addTo(map);
      return { marker, coords, cumulative, total: cumulative[cumulative.length - 1] };
    });

    if (reduced) {
      // reduced-motion: 첫 정류장 고정(PATTERNS §4)
      return () => shuttles.forEach(({ marker }) => marker.remove());
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      raf = requestAnimationFrame(tick); // 선예약 · 일시 예외로 루프가 죽지 않게
      const t = ((now - start) % LOOP_MS) / LOOP_MS;
      shuttles.forEach(({ marker, coords, cumulative, total }) => {
        marker.setLngLat(pointAt(coords, cumulative, total, t));
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      shuttles.forEach(({ marker }) => marker.remove());
    };
  }, [map, paths]);
}
