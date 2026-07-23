// GTS 동선 결과 · IA §9.5 + §10.5 + PATTERNS §32 (존 C5 개정).
// §10.5: Visit order 번호 리스트 → §28 RouteTimeline 문법의 세로 타임라인(VisitTimeline ·
//   노드 = 순번 원 28px primary + white 숫자 · 우측 장소명 + 2시간 슬롯 시각) · 지도와 병렬 배치.
// 순서 = 점심 → 픽1 → 픽2 → 저녁(itinerary.js 공유 규칙). 시각은 정오 기점 stayMin(120) 누적의
//   표기 전용(itinerarySchedule · 시각표 생성 아님 — 코드 주석 한정 §10.4).
// [V3] §32 리스트 폴백 폐지 — 목업 포함 어떤 조합에서도 지도 라인 상시 렌더(mockCoords
//   결정적 DEMO 좌표 · 지시 [3]). 목업 포함 시 mockNotice 고지는 유지(정확 위치 확정 후 표시).
// 가드(§31): mealPlan 충족 && picks 2 — 미충족 시 build로 replace. 통과 시 route 경유 마킹.
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ItineraryMap from '../components/gts/ItineraryMap';
import VisitTimeline from '../components/gts/VisitTimeline';
import { itineraryVenues } from '../components/gts/itinerary';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { useGts, useGtsGuard } from '../context/GtsContext';
import LangSwap from '../i18n/LangSwap';

export default function GtsRoute() {
  const ok = useGtsGuard('route');
  const { mealPlan, meals, picks, markRouteVisited, trackStep } = useGts();
  const navigate = useNavigate();

  useEffect(() => {
    if (ok) markRouteVisited();
  }, [ok, markRouteVisited]);

  // 방문 순서 파생 · 참조 고정(ItineraryMap 재마운트 방지)
  const entries = useMemo(
    () => itineraryVenues({ mealPlan, meals, picks }),
    [mealPlan, meals, picks],
  );

  if (!ok) return null;

  const hasMock = entries.some((venue) => !venue.coord);
  // [V7] 장소별 출발·도착 시각(2시간 슬롯 타임테이블) 화면 제거 — 순서·장소명·지도 라인만 유지.
  //   itinerarySchedule 데이터 모델은 보존(롤백 대비 · itinerary.js DEPRECATED 주석).

  return (
    <Container>
      <div className="flex flex-col gap-32 pb-64 pt-96">
        <div className="flex flex-col gap-12">
          {/* v4.2 §10.4: 사용자 노출 DRAFT 고지 삭제 · 시각 초안 여부는 코드 주석만 */}
          <LangSwap k="gts.route.title" as="h1" className="text-h1 font-bold tracking-display" />
        </div>

        <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-12">
          {/* 지도 · [V3] 목업 포함 상시 렌더(리스트 폴백 폐지 · mockCoords DEMO 좌표) */}
          <div className="relative aspect-square overflow-hidden rounded-xl shadow-sm md:aspect-video">
            <ItineraryMap venues={entries} />
          </div>

          {/* 방문 순서 · §10.5 세로 타임라인(§28 문법) — 지도와 병렬 배치(lg 좌측) */}
          <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm lg:order-first">
            <LangSwap k="gts.route.listTitle" as="h2" className="text-h3 font-semibold" />
            {hasMock && (
              <LangSwap k="gts.route.mockNotice" as="p" className="text-small font-medium text-inkSec" />
            )}
            <VisitTimeline
              items={entries.map((venue) => ({
                id: venue.id,
                name: venue.name,
                oneLine: venue.oneLine,
              }))}
            />
            <div className="flex flex-wrap items-center gap-12 pt-8">
              <Button
                onClick={() => {
                  // [V1] 방문 순서 확정 계측
                  trackStep('route_confirm', { order: entries.map((v) => ({ id: v.id, name: v.name.en })) });
                  navigate('/gts/checkout');
                }}
              >
                <LangSwap k="gts.route.proceed" />
              </Button>
              <Button variant="secondary" onClick={() => navigate('/gts/build')}>
                <LangSwap k="gts.route.rebuild" />
              </Button>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
