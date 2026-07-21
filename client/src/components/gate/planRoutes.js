// 허브 경로 조회 헬퍼 · v4 존 B4(PATTERNS §29 할루시네이션 차단 설계).
// 원칙: 경로는 코드가 계산하지 않는다. data/gts/hubs.js routeTemplates 조회 +
// §29가 명시한 "현재 위치 → 하버사인 최근접 승차 지점 매핑 + 첫 레그 부착"만 수행한다.
// 구체 출발 시각(HH:MM)·요금·편명 생성 전면 금지 · 배차는 headwayNote 사전 키 그대로 전달.
// From Chuncheon은 동일 템플릿 역방향 조회(legs reverse) · §29.
// v4.2 존 B5 확장(§39): computeLegTimes = 사용자 선택 출발 시각 T 기점 누적 합산
// (durMin + 환승 버퍼 10분)일 뿐 시간표 생성이 아니다 · 표기는 "예상" 라벨 필수.
import { chuncheonPoints, hubs, routeTemplates } from '../../data/gts/hubs';
import { haversineKm } from '../../context/ArrivalContext';
import { CURRENT_LOCATION_ID } from './fieldOptions';

// 기본 선택값 · 데이터 순서 파생(하드코딩 금지)
export const DEFAULT_HUB_ID = hubs[0].id;
export const DEFAULT_POINT_ID = chuncheonPoints[0].id;

const byId = (list) => Object.fromEntries(list.map((place) => [place.id, place]));
const hubById = byId(hubs);
const pointById = byId(chuncheonPoints);

// 하버사인 최근접 승차 지점(§29) · 거리 수치는 매칭에만 쓰고 노출하지 않는다
const toLngLat = (place) => ({ lng: place.coord[0], lat: place.coord[1] });
const nearest = (list, coords) =>
  list.reduce((best, place) =>
    haversineKm(coords, toLngLat(place)) < haversineKm(coords, toLngLat(best)) ? place : best,
  );

// §29 첫 레그 mode는 taxi|subway 2택. 세부 규칙은 명세 밖이라 결정론으로 고정(완료 보고 대상):
// 춘천 시내(도시철도 없음)·공항 접근 = taxi, 수도권 철도·버스 허브 접근 = subway.
const accessMode = (place) =>
  pointById[place.id] || place.kind === 'airport' ? 'taxi' : 'subway';

// 카드 표시용 분류(기차·버스·복합) · 템플릿 legs의 mode 집합에서 파생(데이터 생성 아님)
const routeKind = (legs) => {
  const modes = new Set(legs.map((leg) => leg.mode));
  const hasBus = modes.has('intercityBus');
  const hasRail = modes.has('rail') || modes.has('subway');
  if (hasBus && hasRail) return 'mixed';
  return hasBus ? 'bus' : 'rail';
};

// §39 레그 시각 계산 · 누적 = 출발 + Σ(durMin + 환승 버퍼) · 시간표 조회가 아니라 durMin 합산.
export const TRANSFER_BUFFER_MIN = 10; // PLACEHOLDER — verify · §39 환승 대기 기본치

// 분 → { hhmm, dayOffset } · 자정 넘김은 dayOffset(+1일 표기 · etaNextDay 키)으로 전달
const stamp = (totalMin) => ({
  hhmm: `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`,
  dayOffset: Math.floor(totalMin / 1440),
});

// computeLegTimes(departHHMM, legs) → { legs: [{ departAt, arriveAt }], arrival }
// durMin null(현재 위치 varies 레그)을 만나면 그 레그부터 시각 미계산(null · "varies" 카피 유지 §39).
export function computeLegTimes(departHHMM, legs) {
  const [h, m] = departHHMM.split(':').map(Number);
  let cursor = h * 60 + m;
  let known = true;
  const legTimes = legs.map((leg, i) => {
    if (!known || leg.durMin == null) {
      known = false;
      return { departAt: null, arriveAt: null };
    }
    if (i > 0) cursor += TRANSFER_BUFFER_MIN; // 레그 사이 환승 버퍼(첫 레그 제외)
    const departAt = stamp(cursor);
    cursor += leg.durMin;
    return { departAt, arriveAt: stamp(cursor) };
  });
  return {
    legs: legTimes,
    arrival: known && legTimes.length ? legTimes[legTimes.length - 1].arriveAt : null,
  };
}

// 조회 전용 엔진 · hubId/pointId는 'current' 가능(현재 위치 출발 · coords 필수 계약,
// GateForm이 coords 없는 'current'를 마지막 확정 값으로 치환한 뒤 호출한다).
// 반환: 옵션 배열(조합 템플릿 없으면 빈 배열 → EmptyState).
export function lookupRoutes({ direction, hubId, pointId, coords }) {
  const usingCurrent = (direction === 'to' ? hubId : pointId) === CURRENT_LOCATION_ID;
  const hub = hubId === CURRENT_LOCATION_ID ? nearest(hubs, coords) : hubById[hubId];
  const point = pointId === CURRENT_LOCATION_ID ? nearest(chuncheonPoints, coords) : pointById[pointId];
  const origin = usingCurrent ? { current: true } : direction === 'to' ? hub : point;
  const dest = direction === 'to' ? point : hub;
  // 현재 위치 출발 시 최근접 매칭된 승차 지점(To: 허브 / From: 춘천 지점)
  const boarding = direction === 'to' ? hub : point;

  return routeTemplates
    .filter((tpl) => tpl.from === hub.id && tpl.to === point.id)
    .map((tpl) => {
      const templateLegs = direction === 'to' ? tpl.legs : [...tpl.legs].reverse();
      const legs = usingCurrent
        ? [
            // §29 명세 첫 레그: {mode: taxi|subway, durMin: null}("varies" 카피) + 최근접 지점 명칭
            { mode: accessMode(boarding), toName: boarding.name, durMin: null, access: true },
            ...templateLegs,
          ]
        : templateLegs;
      return {
        id: `${direction}-${tpl.from}-${tpl.to}`,
        direction,
        origin,
        dest,
        legs,
        headwayNote: tpl.headwayNote,
        kind: routeKind(tpl.legs),
        // "약 N분" = 템플릿 durMin 합(§29) · null(varies) 레그는 합산 제외
        totalMin: tpl.legs.reduce((sum, leg) => sum + (leg.durMin ?? 0), 0),
      };
    });
}
