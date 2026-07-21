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
import VenueGrid from '../components/gts/VenueGrid';
import Container from '../components/layout/Container';
import { mealCap, useGts, useGtsGuard } from '../context/GtsContext';
import { venues } from '../data/gts/venues';
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
  const { mealPlan, meals, picks, setMealPlan, toggleMeal, togglePick } = useGts();
  const [step, setStep] = useState('plan');
  const [capNotice, setCapNotice] = useState(false);
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

  // 정원 초과 시 자동 해제 금지 · 안내만(§9.4) — 수용되면 안내 해제
  const guarded = (toggle) => (id) => setCapNotice(!toggle(id));

  // §41 단일 선택 스텝: 카드 탭 → 프레스 피드백 120ms(tokens durPress) 후 자동 전진
  const onPlanSelect = (plan) => {
    setMealPlan(plan);
    clearTimeout(autoRef.current);
    autoRef.current = setTimeout(() => {
      setCapNotice(false);
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
    if (step === 'plan') setStep(mealPlan === 'none' ? 'picks' : 'meals');
    else if (step === 'meals') setStep('picks');
    else navigate('/gts/route');
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
          <section className="flex flex-col gap-16">
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
          <section className="flex flex-col gap-16">
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
              badgeKeys={MEAL_BADGES}
            />
          </section>
        )}

        {/* Step 2 · §10.4 반반 분할(탭 폐지): 좌 음식공간 4장 / 우 액티비티 4장 동시 노출 ·
            합산 정확히 2픽 · 카운터 상단 상시 */}
        {step === 'picks' && (
          <section className="flex flex-col gap-16">
            <div className="flex flex-wrap items-baseline justify-between gap-12">
              <LangSwap k="gts.build.picksTitle" as="h2" className="text-h3 font-semibold" />
              <Counter n={picks.length} max={2} />
            </div>
            <div aria-live="polite">
              {capNotice && (
                <LangSwap k="gts.build.capFull" as="p" className="text-small font-medium text-spice" />
              )}
            </div>
            <div className="grid gap-24 lg:grid-cols-2">
              <section className="flex flex-col gap-12">
                <LangSwap k="gts.build.tabFoodspace" as="h3" className="text-body font-semibold" />
                <VenueGrid
                  pool={foodPool}
                  pageSize={4}
                  cols="half"
                  selected={picks}
                  max={2}
                  onToggle={guarded(togglePick)}
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
                />
              </section>
            </div>
          </section>
        )}
      </StepStage>
    </>
  );
}
