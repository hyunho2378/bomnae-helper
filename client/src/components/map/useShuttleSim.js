// 셔틀 시뮬레이션 훅 · PATTERNS §13(v3.1 스무딩 수술):
// 목표 좌표는 경로 누적거리 기반 등속 파라미터로 산출(정점 간 lerp · 정점 덜컥임 원인 제거),
// 표시 좌표는 지수 추종(current += (target-current)*min(1, dt*3))으로 따라간다.
// 마커 옵션 {pitchAlignment:'map', rotationAlignment:'map'}, 요소 will-change:transform(LoopMap.css),
// Marker.setLngLat는 rAF당 1회만. reduced-motion 시 첫 정류장 정지(rAF 없음).
// MVP는 시뮬레이션 이동(DESIGN §11) · PHASE 3 실차 GPS로 교체 지점.
import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { lineColors } from '../../tokens';

const LOOP_MS = 90000; // PATTERNS §4 명세: 1루프 ≈ 90초
const FOLLOW = 3; // PATTERNS §13 명세: 지수 lerp 계수 dt*3

// 셔틀 마커 엘리먼트 · 라인 컬러 채움 + 캐릭터 미니 아이콘(DESIGN §11).
// 크기·모양은 tailwind 토큰 클래스만 사용. shuttle-marker 클래스가 will-change:transform 부여(§13).
function makeShuttleElement(lineId, characterImg, label) {
  const el = document.createElement('div');
  // v3.1 무보더 스윕 · 흰 테는 border 대신 ring(box-shadow)으로 표현
  el.className =
    'shuttle-marker flex h-32 w-32 items-center justify-center rounded-pill ring-2 ring-white ring-inset';
  el.style.background = lineColors[lineId]; // tokens.lineColors · HEX 직입력 아님
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', label);
  const img = document.createElement('img');
  img.src = characterImg; // PLACEHOLDER · 봄내크루 배경 제거본 에셋 대기(PROGRESS 준비물)
  img.alt = '';
  img.className = 'h-20 w-20 rounded-pill object-cover';
  // v3.2 §8.3.3 · 이미지 없으면 박스 비렌더(로드 실패 시 깨진 글리프 제거 · 컬러 원만 남긴다)
  img.onerror = () => img.remove();
  el.appendChild(img);
  return el;
}

// 경로 누적 길이(평면 근사 · 시각 시뮬 용도라 충분) 기반 등속 보간.
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
        // PATTERNS §13 명세 옵션 · 지도 평면 정렬(핏치·베어링 변화 시 미끄러짐 제거)
        pitchAlignment: 'map',
        rotationAlignment: 'map',
      })
        .setLngLat(coords[0])
        .addTo(map);
      // disp = 표시 좌표(지수 추종 상태), 시작은 첫 정류장
      return {
        marker,
        coords,
        cumulative,
        total: cumulative[cumulative.length - 1],
        disp: { lng: coords[0][0], lat: coords[0][1] },
      };
    });

    if (reduced) {
      // reduced-motion: 첫 정류장 고정(PATTERNS §4·DESIGN §11)
      return () => shuttles.forEach(({ marker }) => marker.remove());
    }

    let raf = 0;
    const start = performance.now();
    let prev = start;
    const tick = (now) => {
      raf = requestAnimationFrame(tick); // 선예약 · 일시 예외로 루프가 죽지 않게
      const dt = (now - prev) / 1000; // 초 단위 프레임 간격
      prev = now;
      const t = ((now - start) % LOOP_MS) / LOOP_MS;
      const k = Math.min(1, dt * FOLLOW); // PATTERNS §13 지수 lerp 계수
      shuttles.forEach((s) => {
        const [lng, lat] = pointAt(s.coords, s.cumulative, s.total, t); // 등속 target
        s.disp.lng += (lng - s.disp.lng) * k;
        s.disp.lat += (lat - s.disp.lat) * k;
        s.marker.setLngLat([s.disp.lng, s.disp.lat]); // rAF당 1회(§13)
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      shuttles.forEach(({ marker }) => marker.remove());
    };
  }, [map, paths]);
}
