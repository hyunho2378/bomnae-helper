// 허브 경로 조회 헬퍼 · v4 존 B4(PATTERNS §29 할루시네이션 차단 설계).
// 원칙: 경로는 코드가 계산하지 않는다. data/gts/hubs.js routeTemplates 조회 +
// §29가 명시한 "현재 위치 → 하버사인 최근접 승차 지점 매핑 + 첫 레그 부착"만 수행한다.
// 구체 출발 시각(HH:MM)·요금·편명 생성 전면 금지 · 배차는 headwayNote 사전 키 그대로 전달.
// From Chuncheon은 동일 템플릿 역방향 조회(legs reverse) · §29.
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
