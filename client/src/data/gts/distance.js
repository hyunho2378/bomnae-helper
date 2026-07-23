// ============================================================
// distance.js · [V9] 코스 큐 거리·시간 계산 (지시 [1]).
// 하버사인(구면 거리) 합산 × 1.3(도로 보정) = 대략 주행거리 km · 시속 30km 기준 분 환산.
// 좌표는 [lng, lat] (venueCoord와 동일 규약 · mockCoords 상시 유효 좌표 사용).
// ============================================================
const R = 6371; // km · 지구 평균 반경
const toRad = (d) => (d * Math.PI) / 180;
const ROAD_FACTOR = 1.3; // 직선 → 도로 보정(지시 [1])
const SPEED_KMH = 30; // 예상 시속(지시 [1])

export function haversineKm([lng1, lat1], [lng2, lat2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// coords 를 순서대로 이은 구간 합 × 도로 보정 = 대략 주행거리 km
export function courseKm(coords) {
  let km = 0;
  for (let i = 1; i < coords.length; i += 1) km += haversineKm(coords[i - 1], coords[i]);
  return km * ROAD_FACTOR;
}

export const courseMinutes = (km) => Math.round((km / SPEED_KMH) * 60);
