// GTS 동선 결과 · IA §9.5 + PATTERNS §32 (존 C4 확장 · 스텁 확장 — 교체 아님).
// 순서 = 점심 → 픽1 → 픽2 → 저녁(플랜별 가감 · itinerary.js 공유 규칙). 시각은 정오 기점
// stayMin(120) 누적의 DRAFT 표기(사전 키 고지 · 시각표 생성 아님). 목업(coord null) 픽 포함 시
// 지도 대신 순서 리스트 + 안내(좌표 지어내기 금지 · §32).
// CTA "이 동선으로 진행" → /gts/checkout · 세컨더리 "다시 조립" → /gts/build(Context가 선택 보존).
// 가드(§31): mealPlan 충족 && picks 2 — 미충족 시 build로 replace. 통과 시 route 경유 마킹.
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ItineraryMap from '../components/gts/ItineraryMap';
import TriText from '../components/gts/TriText';
import { itineraryVenues } from '../components/gts/itinerary';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { useGts, useGtsGuard } from '../context/GtsContext';
import LangSwap from '../i18n/LangSwap';

// 정오 기점(분) · §9.5 DRAFT 일정 표기 기준값(12h × 60m) — 시각표 생성이 아니다
const NOON_MIN = 12 * 60;

// 분 → 시각 라벨 · DRAFT 일정 표기 전용(임의 시각 하드코딩 없음)
const fmtTime = (min) => {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
};

export default function GtsRoute() {
  const ok = useGtsGuard('route');
  const { mealPlan, meals, picks, markRouteVisited } = useGts();
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

  // 정오 기점 각 stayMin(120) 누적 · DRAFT 표기(§9.5)
  let acc = NOON_MIN;
  const schedule = entries.map((venue) => {
    const start = acc;
    acc += venue.stayMin;
    return { venue, start };
  });

  return (
    <Container>
      <div className="flex flex-col gap-32 pb-64 pt-96">
        <div className="flex flex-col gap-12">
          {/* v4.2 §10.4: 사용자 노출 DRAFT 고지 삭제 · 시각 초안 여부는 코드 주석만 */}
          <LangSwap k="gts.route.title" as="h1" className="text-h1 font-bold tracking-display" />
        </div>

        <div
          className={`flex flex-col gap-24 ${
            hasMock ? '' : 'lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-12'
          }`}
        >
          {/* 지도 · 목업 픽 포함 시 비렌더 = 리스트 폴백(§32) */}
          {!hasMock && (
            <div className="relative aspect-square overflow-hidden rounded-xl shadow-sm md:aspect-video">
              <ItineraryMap venues={entries} />
            </div>
          )}

          {/* 일정 타임라인 카드 · lg 좌측(모바일 하단 · §9.5) */}
          <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm lg:order-first">
            <LangSwap k="gts.route.listTitle" as="h2" className="text-h3 font-semibold" />
            {hasMock && (
              <LangSwap k="gts.route.mockNotice" as="p" className="text-small font-medium text-inkSec" />
            )}
            <ol className="flex flex-col divide-y divide-line">
              {schedule.map(({ venue, start }, i) => (
                <li key={venue.id} className="flex items-start gap-16 py-12">
                  <span
                    aria-hidden="true"
                    className="flex h-32 w-32 shrink-0 items-center justify-center rounded-pill bg-primary font-display text-small font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 flex-col gap-4">
                    <span className="font-display text-small font-bold">{fmtTime(start)}</span>
                    <TriText text={venue.name} className="text-body font-semibold" />
                    <TriText text={venue.oneLine} className="text-caption font-medium text-inkSec" />
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-12 pt-8">
              <Button onClick={() => navigate('/gts/checkout')}>
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
