// GTS 조립 상태기 · PATTERNS §31 (존 A4 소유 — 서브에이전트 수정 금지, 확장 요청은 보고).
// vehicle은 저장하지 않고 셀렉터로 파생(§9.3 규칙) — 인원·짐 변경 시 자동 재매칭.
// in-memory 전용: 새로고침 시 setup부터(웹스토리지 금지 유지).
// 가드: build = party 필수 / route = mealPlan 충족 && picks 2 / checkout = route 경유.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { matchVehicle } from '../data/gts/vehicles';

const GtsContext = createContext(null);

const initial = {
  party: null, // setup CTA에서 확정되기 전 null — build 가드 기준
  luggage: false,
  mealPlan: null, // null | 'none' | 'lunch' | 'lunchDinner'
  meals: [], // venue id, push 순서 = 점심 → 저녁(§31)
  picks: [], // venue id, 합산 정확히 2(§9.4)
  dropoffText: '',
  routeVisited: false,
};

// 플랜별 식사 픽 정원(§9.4 Step 1)
export function mealCap(mealPlan) {
  if (mealPlan === 'lunch') return 1;
  if (mealPlan === 'lunchDinner') return 2;
  return 0;
}

export function GtsProvider({ children }) {
  const [state, setState] = useState(initial);
  const { pathname } = useLocation();
  const wasInFlow = useRef(false);

  // v4.2 §10.4 상태 리셋 정책: /gts/* 밖으로 이탈하면 하차 텍스트 포함 전체 초기화.
  // 플로우 내부 이동은 보존. 결제 직행(/ticket)도 이탈 — 예약 스냅샷은 data/gts/api 저장분이 소유.
  useEffect(() => {
    const inFlow = pathname.startsWith('/gts');
    if (wasInFlow.current && !inFlow) setState(initial);
    wasInFlow.current = inFlow;
  }, [pathname]);

  const setParty = useCallback((party) => setState((s) => ({ ...s, party })), []);
  const setLuggage = useCallback((luggage) => setState((s) => ({ ...s, luggage })), []);

  // 플랜 변경 시 meals를 새 정원으로 절삭(순서 보존) — §31 해제 시 순서 재계산과 동일 원칙
  const setMealPlan = useCallback(
    (mealPlan) => setState((s) => ({ ...s, mealPlan, meals: s.meals.slice(0, mealCap(mealPlan)) })),
    [],
  );

  // 재클릭 해제·정원 초과 시 false 반환(자동 해제 금지 — 컴포넌트가 안내 렌더, §9.4)
  const toggleMeal = useCallback((id) => {
    let accepted = true;
    setState((s) => {
      if (s.meals.includes(id)) return { ...s, meals: s.meals.filter((m) => m !== id) };
      if (s.meals.length >= mealCap(s.mealPlan)) {
        accepted = false;
        return s;
      }
      return { ...s, meals: [...s.meals, id] };
    });
    return accepted;
  }, []);

  const togglePick = useCallback((id) => {
    let accepted = true;
    setState((s) => {
      if (s.picks.includes(id)) return { ...s, picks: s.picks.filter((p) => p !== id) };
      if (s.picks.length >= 2) {
        accepted = false;
        return s;
      }
      return { ...s, picks: [...s.picks, id] };
    });
    return accepted;
  }, []);

  const setDropoffText = useCallback((dropoffText) => setState((s) => ({ ...s, dropoffText })), []);
  const markRouteVisited = useCallback(() => setState((s) => ({ ...s, routeVisited: true })), []);
  const reset = useCallback(() => setState(initial), []);

  // 파생 차량(§9.3 결정론) — 저장 금지, party 미확정이면 null
  const vehicle = useMemo(
    () => (state.party == null ? null : matchVehicle(state.party, state.luggage)),
    [state.party, state.luggage],
  );

  // 식사 플랜 충족 판정(route 가드 성분)
  const mealPlanSatisfied = useMemo(() => {
    if (state.mealPlan === 'none') return true;
    if (state.mealPlan === 'lunch') return state.meals.length === 1;
    if (state.mealPlan === 'lunchDinner') return state.meals.length === 2;
    return false;
  }, [state.mealPlan, state.meals]);

  const value = useMemo(
    () => ({
      ...state,
      vehicle,
      mealPlanSatisfied,
      setParty,
      setLuggage,
      setMealPlan,
      toggleMeal,
      togglePick,
      setDropoffText,
      markRouteVisited,
      reset,
    }),
    [state, vehicle, mealPlanSatisfied, setParty, setLuggage, setMealPlan, toggleMeal, togglePick, setDropoffText, markRouteVisited, reset],
  );

  return <GtsContext.Provider value={value}>{children}</GtsContext.Provider>;
}

export function useGts() {
  return useContext(GtsContext);
}

// 스텝 가드(§31) · 미충족 시 앞 단계로 replace. 페이지는 반환값 false면 렌더 중단.
export function useGtsGuard(step) {
  const { party, mealPlanSatisfied, picks, routeVisited } = useGts();
  const navigate = useNavigate();

  let ok = true;
  let target = '/gts/setup';
  if (step === 'build') {
    ok = party != null;
  } else if (step === 'route') {
    ok = party != null && mealPlanSatisfied && picks.length === 2;
    target = party == null ? '/gts/setup' : '/gts/build';
  } else if (step === 'checkout') {
    ok = routeVisited;
    target = '/gts/route';
  }

  useEffect(() => {
    if (!ok) navigate(target, { replace: true });
  }, [ok, target, navigate]);

  return ok;
}
