// GTS 동선 결과 · IA §9.5 — 스텁(존 C4 BUILDER가 확장한다 · 교체 아님).
// ItineraryMap(§32) 번호 핀 + draw-on + 일정 타임라인. 목업 픽 포함 시 리스트 폴백.
// 가드(§31): mealPlan 충족 && picks 2 — 미충족 시 build로 replace. 통과 시 route 경유 마킹.
import { useEffect } from 'react';
import Container from '../components/layout/Container';
import { useGts, useGtsGuard } from '../context/GtsContext';
import LangSwap from '../i18n/LangSwap';

export default function GtsRoute() {
  const ok = useGtsGuard('route');
  const { markRouteVisited } = useGts();

  useEffect(() => {
    if (ok) markRouteVisited();
  }, [ok, markRouteVisited]);

  if (!ok) return null;
  return (
    <Container>
      <div className="flex flex-col gap-24 pb-64 pt-96">
        <LangSwap k="meta.title.gtsRoute" as="h1" className="text-h1 font-bold" />
      </div>
    </Container>
  );
}
