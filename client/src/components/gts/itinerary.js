// 방문 순서 파생(IA §9.5) · route/checkout/ticket 공유 규칙.
// 순서 = 점심 → 픽1 → 픽2 → 저녁(플랜별 가감). meals push 순서 = 점심, 저녁(PATTERNS §31),
// picks는 고른 순서 보존. venues는 조회만(data/gts 값 수정 금지).
import { venues } from '../../data/gts/venues';

export function itineraryIds({ mealPlan, meals, picks }) {
  const ids = [];
  if (mealPlan !== 'none' && meals[0]) ids.push(meals[0]);
  ids.push(...picks);
  if (mealPlan === 'lunchDinner' && meals[1]) ids.push(meals[1]);
  return ids;
}

export function itineraryVenues(selection) {
  return itineraryIds(selection)
    .map((id) => venues.find((v) => v.id === id))
    .filter(Boolean);
}
