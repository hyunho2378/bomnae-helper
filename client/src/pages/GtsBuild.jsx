// GTS 조립 · IA §9.4 + §10.4 + PATTERNS §41 (존 C5 전면 개정 — BuildProgressBar 폐지).
// 전체 플로우를 StepStage 풀스크린 몰입 레이어로 재구성:
//   Step 0 식사 플랜 3택(단일 선택 — 카드 탭 → 프레스 피드백 120ms(durPress) 후 자동 전진 §41)
//   → Step 1 식사 선택(플랜 none 스킵 · 정원 lunch 1 / lunchDinner 2 · 순서 = 점심→저녁 배지)
//   → Step 2 반반 분할(§10.4 탭 폐지): 데스크탑 좌 음식공간 4장 / 우 액티비티 4장 동시
//     (모바일 상하 스택) · 합산 정확히 2픽 · 카운터 상단 상시 · 초과 시 자동 해제 없음.
// 페이지네이션 페어([이전][다음] · 경계 비활성)는 VenueGrid 소유(§10.4 새로고침 폐지).
// 가드(§31): party 필수 — 미충족 시 setup으로 replace.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StepStage from '../components/gts/StepStage';
import VenueDetail from '../components/gts/VenueDetail';
import VenueGrid from '../components/gts/VenueGrid';
import CourseQueue from '../components/gts/CourseQueue';
import Container from '../components/layout/Container';
import { mealCap, useGts, useGtsGuard } from '../context/GtsContext';
import { venues } from '../data/gts/venues';
import { venueCoord } from '../data/gts/mockCoords';
import { courseKm, courseMinutes } from '../data/gts/distance';
import LangSwap from '../i18n/LangSwap';
import { motion } from '../tokens';

// 식사 순서 배지 사전 키(§9.4 · 고른 순서 = 점심 → 저녁)
const MEAL_BADGES = ['gts.build.lunchBadge', 'gts.build.dinnerBadge'];

function PlanCard({ plan, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(plan)}
      aria-pressed={active}
      className={`pressable flex min-h-44 flex-col items-start gap-8 rounded-lg bg-white p-24 text-left shadow-sm ${
        active ? 'ring-2 ring-primary' : 'hover:shadow-md'
      }`}
    >
      <LangSwap k={`gts.build.plan.${plan}`} className="text-body font-semibold" />
      <LangSwap k={`gts.build.plan.${plan}Sub`} className="text-small font-medium text-inkSec" />
    </button>
  );
}

// 선택 카운터 · 상시 노출(§9.4 인식>회상 · §10.4 상단 상시)
function Counter({ n, max }) {
  return (
    <div className="flex items-baseline gap-8">
      <span className="font-display text-h3 font-bold">
        {n} / {max}
      </span>
      <LangSwap k="gts.build.counterLabel" className="text-small font-medium text-inkSec" />
    </div>
  );
}

export default function GtsBuild() {
  const ok = useGtsGuard('build');
  const navigate = useNavigate();
  const { mealPlan, meals, picks, setMealPlan, toggleMeal, togglePick, trackStep } = useGts();
  const [step, setStep] = useState('plan');
  const [capNotice, setCapNotice] = useState(false);
  // [V2] 장소 상세 오버레이 · { venue, rect(FLIP 시작점), instant(키보드 개시), kind(meal|pick — 토글 대상 풀) }
  const [detail, setDetail] = useState(null);
  const autoRef = useRef(0);

  // 풀은 조회 전용(venues.js 값 수정 금지) · 참조 고정으로 VenueGrid 페이지 리셋 방지
  const mealPool = useMemo(() => venues.filter((v) => v.category === 'meal'), []);
  const foodPool = useMemo(() => venues.filter((v) => v.category === 'foodspace'), []);
  const activityPool = useMemo(() => venues.filter((v) => v.category === 'activity'), []);

  useEffect(() => () => clearTimeout(autoRef.current), []);

  if (!ok) return null;

  const cap = mealCap(mealPlan);
  const steps = mealPlan === 'none' ? ['plan', 'picks'] : ['plan', 'meals', 'picks'];
  const stepIndex = Math.max(0, steps.indexOf(step));

  // [V9] picks 큐(food·activity 공용) 파생 — 큐 마지막 좌표 = 남은 후보 재정렬 기준(양 풀 공유),
  //   좌표열 = 큐 합계 거리·시간 배지. 큐가 비면 sortCoord null(기본 정렬 복귀).
  const picksVenues = picks.map((id) => venues.find((v) => v.id === id)).filter(Boolean);
  const queueCoords = picksVenues.map(venueCoord);
  const sortCoord = queueCoords.length ? queueCoords[queueCoords.length - 1] : null;
  const courseKmVal = courseKm(queueCoords);
  const courseMin = courseMinutes(courseKmVal);

  // 정원 초과 시 자동 해제 금지 · 안내만(§9.4) — 수용되면 안내 해제
  const guarded = (toggle) => (id) => setCapNotice(!toggle(id));

  // [V2] 돋보기 → 상세 오픈(그리드별 토글 대상 구분)
  const openDetail = (kind) => (venue, rect, instant) => setDetail({ venue, rect, instant, kind });

  // [V1] 선택 벤처 id·이름 요약(계측 payload)
  const venueSummary = (ids) =>
    ids.map((id) => {
      const v = venues.find((x) => x.id === id);
      return { id, name: v?.name.en ?? id };
    });

  // §41 단일 선택 스텝: 카드 탭 → 프레스 피드백 120ms(tokens durPress) 후 자동 전진
  const onPlanSelect = (plan) => {
    setMealPlan(plan);
    clearTimeout(autoRef.current);
    autoRef.current = setTimeout(() => {
      setCapNotice(false);
      trackStep('meal_plan', { plan }); // [V1] 자동 전진도 스텝 완료
      setStep(plan === 'none' ? 'picks' : 'meals');
    }, parseInt(motion.durPress, 10));
  };

  // 다음 버튼 게이트 + 사유(§9.4 → StepStage 하단 aria-live)
  let disabled = false;
  let reasonKey = null;
  if (step === 'plan' && mealPlan == null) {
    disabled = true;
    reasonKey = 'gts.build.reason.plan';
  } else if (step === 'meals' && meals.length !== cap) {
    disabled = true;
    reasonKey = 'gts.build.reason.meals';
  } else if (step === 'picks' && picks.length !== 2) {
    disabled = true;
    reasonKey = 'gts.build.reason.picks';
  }

  const onNext = () => {
    setCapNotice(false);
    if (step === 'plan') {
      trackStep('meal_plan', { plan: mealPlan }); // [V1]
      setStep(mealPlan === 'none' ? 'picks' : 'meals');
    } else if (step === 'meals') {
      trackStep('meals', { selections: venueSummary(meals) }); // [V1]
      setStep('picks');
    } else {
      trackStep('picks', { selections: venueSummary(picks) }); // [V1]
      navigate('/gts/route');
    }
  };
  const onBack = () => {
    setCapNotice(false);
    setStep(steps[stepIndex - 1]);
  };

  return (
    <>
      {/* 오버레이 아래 바닥 페이지(넓은 컨테이너 · §10.4 확폭) — 실콘텐츠는 StepStage 소유 */}
      <Container>
        <div className="flex flex-col gap-32 pb-64 pt-96">
          <LangSwap k="gts.build.title" as="h1" className="text-h1 font-bold tracking-display" />
        </div>
      </Container>

      <StepStage
        stepIndex={stepIndex}
        stepCount={steps.length}
        titleKey={`gts.build.step.${step}`}
        stepKey={step}
        onBack={onBack}
        onNext={onNext}
        nextDisabled={disabled}
        reasonKey={reasonKey}
        onExit={() => navigate('/gts/setup')}
      >
        {/* Step 0 · 식사 플랜 3택(§9.4 · 단일 선택 자동 전진) */}
        {step === 'plan' && (
          <section className="flex flex-col gap-12">
            <LangSwap k="gts.build.planTitle" as="h2" className="text-h3 font-semibold" />
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {['none', 'lunch', 'lunchDinner'].map((plan) => (
                <PlanCard key={plan} plan={plan} active={mealPlan === plan} onSelect={onPlanSelect} />
              ))}
            </div>
          </section>
        )}

        {/* Step 1 · 식사 선택(플랜 none 스킵 · §9.4) */}
        {step === 'meals' && (
          <section className="flex flex-col gap-12">
            <div className="flex flex-wrap items-baseline justify-between gap-12">
              <LangSwap k="gts.build.mealsTitle" as="h2" className="text-h3 font-semibold" />
              <Counter n={meals.length} max={cap} />
            </div>
            {mealPlan === 'lunchDinner' && (
              <LangSwap k="gts.build.mealsOrderHint" as="p" className="text-small font-medium text-inkSec" />
            )}
            <div aria-live="polite">
              {capNotice && (
                <LangSwap k="gts.build.capFull" as="p" className="text-small font-medium text-spice" />
              )}
            </div>
            <VenueGrid
              pool={mealPool}
              selected={meals}
              max={cap}
              onToggle={guarded(toggleMeal)}
              onDetail={openDetail('meal')}
              badgeKeys={MEAL_BADGES}
            />
          </section>
        )}

        {/* Step 2 · §10.4 반반 분할(탭 폐지): 좌 음식공간 4장 / 우 액티비티 4장 동시 노출 ·
            합산 정확히 2픽 · 카운터 상단 상시 */}
        {step === 'picks' && (
          <section className="flex flex-col gap-12">
            <div className="flex flex-wrap items-baseline justify-between gap-12">
              <LangSwap k="gts.build.picksTitle" as="h2" className="text-h3 font-semibold" />
              <Counter n={picks.length} max={2} />
            </div>
            <div aria-live="polite">
              {capNotice && (
                <LangSwap k="gts.build.capFull" as="p" className="text-small font-medium text-spice" />
              )}
            </div>
            {/* [V9] food·activity 풀은 절대 섞지 않음 · 각 풀 안에서만 큐 마지막 좌표 기준 재정렬 */}
            <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
              <section className="flex flex-col gap-12">
                <LangSwap k="gts.build.tabFoodspace" as="h3" className="text-body font-semibold" />
                <VenueGrid
                  pool={foodPool}
                  pageSize={4}
                  cols="half"
                  selected={picks}
                  max={2}
                  onToggle={guarded(togglePick)}
                  onDetail={openDetail('pick')}
                  queueMode
                  sortCoord={sortCoord}
                />
              </section>
              <section className="flex flex-col gap-12">
                <LangSwap k="gts.build.tabActivity" as="h3" className="text-body font-semibold" />
                <VenueGrid
                  pool={activityPool}
                  pageSize={4}
                  cols="half"
                  selected={picks}
                  max={2}
                  onToggle={guarded(togglePick)}
                  onDetail={openDetail('pick')}
                  queueMode
                  sortCoord={sortCoord}
                />
              </section>
            </div>
            {/* [V9] 선택 큐 · food/activity 공용(유일한 공유) · 순서 유지 + X 제거 + 거리·시간 배지 */}
            <CourseQueue items={picksVenues} onRemove={togglePick} km={courseKmVal} minutes={courseMin} />
          </section>
        )}
      </StepStage>

      {/* [V2] 장소 상세 확장 카드 · StepStage 형제(포털은 body — 늦은 마운트라 StepStage 위) */}
      {detail && (
        <VenueDetail
          venue={detail.venue}
          originRect={detail.rect}
          instant={detail.instant}
          isSelected={(detail.kind === 'meal' ? meals : picks).includes(detail.venue.id)}
          onToggle={() => (detail.kind === 'meal' ? toggleMeal : togglePick)(detail.venue.id)}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
