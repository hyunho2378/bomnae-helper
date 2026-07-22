// GTS 체크아웃 · IA §9.6 + §10.6 + PATTERNS §42 (존 C5 개정 — Pay 흐름 교체).
// 요약(차량·인원·짐·식사·픽 순서) + 금액 내역 전부 1뷰 노출(다크패턴 금지 §16.10) 유지.
// §42 결제: 결제 수단 그리드 8종 → 카드 계열 = 하단 카드 폼 확장(easeOut 220ms · 검증 없음 ·
//   빈 제출 허용 · 폼 하단 프로토타입 고지 caption) / Apple Pay·Alipay = 폼 생략 + 월렛
//   시뮬레이션 카피 1줄 + 바로 Pay. 확인 Dialog·성공 인터스티셜(스탬프 화면·View ticket) 삭제 —
//   Pay → createGtsBooking(결제 수단 문자열 저장 확장) → /ticket/:id replace 직행.
//   스탬프는 Ticket 페이지 진입 시 1회 재생으로 이동(§43).
// 로그인: 기본 데모 유저(§10.6)로 게이트 통과 — user 없을 때만 LoginGate 폴백(Guest-first 보존).
// 가드(§31): route 경유 — 미충족 시 route로 replace.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, CarFront, Loader2 } from 'lucide-react';
import CardForm from '../components/pay/CardForm';
import ItineraryMap from '../components/gts/ItineraryMap';
import PayMethodGrid from '../components/pay/PayMethodGrid';
import { PAY_METHODS } from '../components/pay/payMethods';
import FareBreakdown from '../components/gts/FareBreakdown';
import TriText from '../components/gts/TriText';
import { itineraryVenues } from '../components/gts/itinerary';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import LoginGate from '../components/ui/LoginGate';
import { useAuth } from '../context/AuthContext';
import { useGts, useGtsGuard } from '../context/GtsContext';
import { computeGtsTotal, createGtsBooking } from '../data/gts/api';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

const VEHICLE_ICON = { taxi: CarFront, van: Bus };

// 요약 행 · Booking 단일 확인 페이지 Row 선례(라벨 caption + 값 우측)
function Row({ labelKey, children }) {
  return (
    <div className="flex items-baseline justify-between gap-16 py-12">
      <LangSwap
        k={labelKey}
        as="dt"
        className="shrink-0 text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
      />
      <dd className="flex min-w-0 items-baseline justify-end gap-8 text-right text-body">
        {children}
      </dd>
    </div>
  );
}

export default function GtsCheckout() {
  const ok = useGtsGuard('checkout');
  const { user } = useAuth();
  const { t } = useLang();
  const { party, luggage, vehicle, mealPlan, meals, picks, dropoffText, travelDate, setDropoffText, trackStep } = useGts();
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);
  const [payMethod, setPayMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!ok) return null;

  const entries = itineraryVenues({ mealPlan, meals, picks });
  const total = computeGtsTotal(vehicle, luggage, party);
  const dropoffOk = dropoffText.trim().length > 0;
  const Icon = VEHICLE_ICON[vehicle];
  const method = PAY_METHODS.find((m) => m.id === payMethod) ?? null;

  // §42: 카드 입력값은 저장하지 않는다(검증 없음 · 빈 제출 허용) — 수단 문자열만 예약에 저장
  const submit = async () => {
    setSubmitting(true);
    trackStep('pay_method', { method: method.id }); // [V1] 결제 수단 확정
    const booking = await createGtsBooking({
      party,
      luggage,
      vehicleType: vehicle,
      mealPlan,
      meals,
      picks,
      itinerary: entries.map((venue) => venue.id), // 순서 보존(§9.6 picks 순서 원칙)
      dropoffText: dropoffText.trim(), // 지오코딩 없음 · 원문 저장(§9.6)
      payMethod: method.id, // §42 결제 수단 문자열 저장 확장
      travelDate, // [V3] 빌더 날짜 관통(서버 travel_date)
      total,
    });
    trackStep('complete', { code: booking.code ?? booking.id }); // [V1] 완주
    // 성공 인터스티셜 없음 · 티켓 직행(§42 replace) — 스탬프는 Ticket 진입 시 1회(§43)
    navigate(`/ticket/${booking.id}`, { replace: true });
  };

  // 데모 유저 기본 로그인(§10.6) — user 없을 때만 LoginGate(Guest-first 폴백)
  const onPay = () => {
    if (user) submit();
    else setGateOpen(true);
  };

  return (
    <Container>
      <div className="flex flex-col gap-32 pb-64 pt-96">
        <LangSwap k="gts.checkout.title" as="h1" className="text-h1 font-bold tracking-display" />

        {/* 좌 요약 / 우 금액+결제(lg) · 380px은 §15 패널 폭 준용(Booking 선례) */}
        <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12">
          <div className="flex flex-col gap-24">
            {/* 선택 요약 · 전부 펼침(1뷰) */}
            <section className="flex flex-col rounded-xl bg-white px-24 py-8 shadow-sm">
              <LangSwap k="gts.checkout.summaryTitle" as="h2" className="pt-16 text-h3 font-semibold" />
              <dl className="flex flex-col divide-y divide-line">
                <Row labelKey="gts.checkout.vehicleLabel">
                  <span className="flex items-center gap-8">
                    {Icon && <Icon size={16} aria-hidden="true" className="text-primary" />}
                    <LangSwap k={`gts.vehicle.${vehicle}`} className="font-semibold" />
                  </span>
                </Row>
                <Row labelKey="gts.checkout.partyLabel">
                  <span className="font-display font-semibold">{party}</span>
                </Row>
                <Row labelKey="gts.checkout.luggageLabel">
                  <LangSwap
                    k={luggage ? 'gts.checkout.luggageYes' : 'gts.checkout.luggageNo'}
                    className="font-semibold"
                  />
                </Row>
                <Row labelKey="gts.checkout.mealPlanLabel">
                  <LangSwap k={`gts.build.plan.${mealPlan}`} className="font-semibold" />
                </Row>
                {/* [V3] 여행 날짜 · 셋업 CalendarField 값 관통 */}
                {travelDate && (
                  <Row labelKey="gts.checkout.dateLabel">
                    <span className="font-display font-semibold">{travelDate}</span>
                  </Row>
                )}
              </dl>
            </section>

            {/* [V3] 동선 미니맵 · 라인 상시 렌더(Travel Log 직행 플로우는 route를 안 거치므로
                여기가 동선의 첫 시각 확인 지점 — mockCoords로 어떤 조합에도 그린다) */}
            <div className="relative aspect-video overflow-hidden rounded-xl shadow-sm">
              <ItineraryMap venues={entries} />
            </div>

            {/* 방문 순서 리스트 · route와 동일 파생 규칙(§9.6) */}
            <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm">
              <LangSwap k="gts.checkout.orderTitle" as="h2" className="text-h3 font-semibold" />
              <ol className="flex flex-col gap-12">
                {entries.map((venue, i) => (
                  <li key={venue.id} className="flex items-center gap-12">
                    <span
                      aria-hidden="true"
                      className="flex h-24 w-24 shrink-0 items-center justify-center rounded-pill bg-primary font-display text-caption font-bold text-white"
                    >
                      {i + 1}
                    </span>
                    <TriText text={venue.name} className="min-w-0 text-body font-semibold" />
                  </li>
                ))}
              </ol>
            </section>

            {/* 최종 하차 지점 · 텍스트 필수(§9.6) */}
            <section className="flex flex-col gap-12 rounded-xl bg-white p-24 shadow-sm">
              <label className="flex flex-col gap-8">
                <LangSwap k="gts.checkout.dropoffLabel" as="span" className="text-h3 font-semibold" />
                <input
                  type="text"
                  value={dropoffText}
                  onChange={(e) => setDropoffText(e.target.value)}
                  placeholder={t('gts.checkout.dropoffPlaceholder')}
                  className="h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary"
                />
              </label>
              <div aria-live="polite">
                {!dropoffOk && (
                  <LangSwap
                    k="gts.checkout.dropoffRequired"
                    as="p"
                    className="text-small font-medium text-spice"
                  />
                )}
              </div>
            </section>

            {/* §42 결제 수단 그리드 8종 + 카드 폼/월렛 카피 */}
            <section className="flex flex-col gap-16 rounded-xl bg-white p-24 shadow-sm">
              <LangSwap k="gts.pay.title" as="h2" className="text-h3 font-semibold" />
              <PayMethodGrid value={payMethod} onChange={setPayMethod} />
              {/* [H2-16] 월렛 시뮬레이션 카피 삭제 · 월렛 = 폼 생략 + 바로 Pay(§42 유지) */}
              {/* 카드 계열 = 하단 카드 폼 확장(마운트 시 220ms easeOut · CardForm 내장) */}
              {method && !method.wallet && <CardForm />}
            </section>
          </div>

          {/* 금액 내역 + Pay · 전 항목 + 합계 항상 펼침(§33) · [H2-14] lg+ sticky 동행 */}
          <aside className="flex flex-col gap-24 rounded-xl bg-white p-24 shadow-md lg:sticky lg:top-24">
            <LangSwap k="gts.checkout.priceTitle" as="h2" className="text-h3 font-semibold" />
            <FareBreakdown vehicle={vehicle} luggage={luggage} party={party} />
            <div className="grid">
              <Button disabled={!dropoffOk || !method || submitting} onClick={onPay}>
                <LangSwap k="gts.checkout.payCta" />
                {submitting && (
                  <Loader2 size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                )}
              </Button>
            </div>
            {/* [V3] 수정하기 · 현재 선택(템플릿 포함)이 프리필된 채 build 스텝으로 복귀 —
                StepStage 정상 동작(카운터·정원 규칙 유지 · Context 상태 그대로) */}
            <div className="grid">
              <Button variant="secondary" onClick={() => navigate('/gts/build')}>
                <LangSwap k="gts.checkout.editCta" />
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <LoginGate open={gateOpen} onClose={() => setGateOpen(false)} returnTo="/gts" />
    </Container>
  );
}
