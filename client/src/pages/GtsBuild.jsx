// GTS 조립 · IA §9.4 + PATTERNS §30·§31 (존 C4 확장 · 스텁 확장 — 교체 아님).
// Step 0 식사 플랜 3택(none/lunch/lunchDinner) → Step 1 식사 선택(플랜 none 스킵 ·
// 정원 lunch 1 / lunchDinner 2 · 고른 순서 = 점심→저녁 배지) → Step 2 음식공간/액티비티 탭 +
// 합산 정확히 2픽. 정원 초과 = Context toggle 반환 false → 자동 해제 금지, 안내 문구 렌더.
// 하단 고정 진행 바: 현재 스텝 · 선택 요약 · 다음(미충족 disabled + 사유).
// 가드(§31): party 필수 — 미충족 시 setup으로 replace.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BuildProgressBar from '../components/gts/BuildProgressBar';
import VenueGrid from '../components/gts/VenueGrid';
import Container from '../components/layout/Container';
import Chip from '../components/ui/Chip';
import { mealCap, useGts, useGtsGuard } from '../context/GtsContext';
import { venues } from '../data/gts/venues';
import LangSwap from '../i18n/LangSwap';

// 식사 순서 배지 사전 키(§9.4 · 고른 순서 = 점심 → 저녁)
const MEAL_BADGES = ['gts.build.lunchBadge', 'gts.build.dinnerBadge'];

function PlanCard({ plan, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(plan)}
      aria-pressed={active}
      className={`flex min-h-44 flex-col items-start gap-8 rounded-lg bg-white p-24 text-left shadow-sm transition-shadow duration-fast ${
        active ? 'ring-2 ring-primary' : 'hover:shadow-md'
      }`}
    >
      <LangSwap k={`gts.build.plan.${plan}`} className="text-body font-semibold" />
      <LangSwap k={`gts.build.plan.${plan}Sub`} className="text-small font-medium text-inkSec" />
    </button>
  );
}

// 선택 카운터 · 상시 노출(§9.4 인식>회상)
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
  const [tab, setTab] = useState('foodspace');
  const [capNotice, setCapNotice] = useState(false);

  // 풀은 조회 전용(venues.js 값 수정 금지) · 참조 고정으로 VenueGrid 페이지 리셋 방지
  const mealPool = useMemo(() => venues.filter((v) => v.category === 'meal'), []);
  const foodPool = useMemo(() => venues.filter((v) => v.category === 'foodspace'), []);
  const activityPool = useMemo(() => venues.filter((v) => v.category === 'activity'), []);

  if (!ok) return null;

  const cap = mealCap(mealPlan);
  const steps = mealPlan === 'none' ? ['plan', 'picks'] : ['plan', 'meals', 'picks'];
  const stepIndex = Math.max(0, steps.indexOf(step));

  // 정원 초과 시 자동 해제 금지 · 안내만(§9.4) — 수용되면 안내 해제
  const guarded = (toggle) => (id) => {
    const accepted = toggle(id);
    setCapNotice(!accepted);
  };

  // 다음 버튼 게이트 + 사유(진행 바 §9.4)
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
  const onBack =
    stepIndex === 0
      ? null
      : () => {
          setCapNotice(false);
          setStep(steps[stepIndex - 1]);
        };

  return (
    <Container>
      {/* pb-128 = 하단 고정 진행 바 클리어런스 */}
      <div className="flex flex-col gap-32 pb-128 pt-96">
        <LangSwap k="gts.build.title" as="h1" className="text-h1 font-bold tracking-display" />

        {/* Step 0 · 식사 플랜 3택(§9.4) */}
        {step === 'plan' && (
          <section className="flex flex-col gap-16">
            <LangSwap k="gts.build.planTitle" as="h2" className="text-h3 font-semibold" />
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {['none', 'lunch', 'lunchDinner'].map((plan) => (
                <PlanCard key={plan} plan={plan} active={mealPlan === plan} onSelect={setMealPlan} />
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

        {/* Step 2 · 음식공간/액티비티 합산 정확히 2픽(§9.4) */}
        {step === 'picks' && (
          <section className="flex flex-col gap-16">
            <div className="flex flex-wrap items-baseline justify-between gap-12">
              <LangSwap k="gts.build.picksTitle" as="h2" className="text-h3 font-semibold" />
              <Counter n={picks.length} max={2} />
            </div>
            <div className="flex items-center gap-8">
              <Chip active={tab === 'foodspace'} onClick={() => setTab('foodspace')}>
                <LangSwap k="gts.build.tabFoodspace" />
              </Chip>
              <Chip active={tab === 'activity'} onClick={() => setTab('activity')}>
                <LangSwap k="gts.build.tabActivity" />
              </Chip>
            </div>
            <div aria-live="polite">
              {capNotice && (
                <LangSwap k="gts.build.capFull" as="p" className="text-small font-medium text-spice" />
              )}
            </div>
            <VenueGrid
              pool={tab === 'foodspace' ? foodPool : activityPool}
              selected={picks}
              max={2}
              onToggle={guarded(togglePick)}
            />
          </section>
        )}
      </div>

      <BuildProgressBar
        stepIndex={stepIndex}
        stepCount={steps.length}
        disabled={disabled}
        reasonKey={reasonKey}
        onBack={onBack}
        onNext={onNext}
      >
        {/* 선택 요약 · 플랜 + 현재 스텝 정원 카운터(인식>회상 §16.10) */}
        {mealPlan && (
          <LangSwap
            k={`gts.build.plan.${mealPlan}`}
            className="truncate text-caption font-medium text-inkSec"
          />
        )}
        {step !== 'plan' && (
          <span className="shrink-0 font-display text-small font-bold">
            {step === 'meals' ? meals.length : picks.length} / {step === 'meals' ? cap : 2}
          </span>
        )}
      </BuildProgressBar>
    </Container>
  );
}
