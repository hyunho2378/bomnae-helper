// GTS 체크아웃 · IA §9.6 + PATTERNS §33 (존 C4 확장 · 스텁 확장 — 교체 아님).
// 요약(차량·인원·짐·식사·픽 순서 리스트) + 금액 내역(fares 산식 · 전항목 + 합계 + DRAFT) 전부
// 1뷰 노출(다크패턴 금지 §16.10). 최종 하차 지점 = 텍스트 입력 필수(지오코딩 없음 · 원문 저장).
// 결제 → 미로그인 시 LoginGate → 확인 Dialog(프로토타입 · 실결제 없음 고지) →
// createGtsBooking(목 창구) → SuccessStamp 재사용 → /ticket/:id.
// 가드(§31): route 경유 — 미충족 시 route로 replace.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, CarFront, Loader2 } from 'lucide-react';
import SuccessStamp from '../components/booking/SuccessStamp';
import FareBreakdown from '../components/gts/FareBreakdown';
import TriText from '../components/gts/TriText';
import { itineraryVenues } from '../components/gts/itinerary';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import LoginGate from '../components/ui/LoginGate';
import Modal from '../components/ui/Modal';
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
  const { party, luggage, vehicle, mealPlan, meals, picks, dropoffText, setDropoffText } = useGts();
  const [gateOpen, setGateOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // 생성된 gts booking

  if (!ok) return null;

  const entries = itineraryVenues({ mealPlan, meals, picks });
  const total = computeGtsTotal(vehicle, luggage, party);
  const dropoffOk = dropoffText.trim().length > 0;
  const Icon = VEHICLE_ICON[vehicle];

  const submit = async () => {
    setSubmitting(true);
    const booking = await createGtsBooking({
      party,
      luggage,
      vehicleType: vehicle,
      mealPlan,
      meals,
      picks,
      itinerary: entries.map((venue) => venue.id), // 순서 보존(§9.6 picks 순서 원칙)
      dropoffText: dropoffText.trim(), // 지오코딩 없음 · 원문 저장(§9.6)
      total,
    });
    setSubmitting(false);
    setConfirmOpen(false);
    setDone(booking);
  };

  // 결제 → 미로그인 시에만 LoginGate(액션 레벨 · Guest-first) → 확인 Dialog(§33 순서)
  const onPay = () => {
    if (user) setConfirmOpen(true);
    else setGateOpen(true);
  };

  // 성공 · 스탬프 드롭(SuccessStamp 재사용) 후 티켓 이동
  if (done) {
    return (
      <Container>
        <div className="mx-auto w-full max-w-dialog pb-64 pt-96">
          {/* GTS는 라인이 없어 lake(=primary 면) 어댑터 객체로 'G' 이니셜 표기(완료 보고 참조) */}
          <SuccessStamp line={{ id: 'lake', name_en: 'GTS' }}>
            <div className="flex flex-col items-center gap-16">
              <LangSwap k="gts.checkout.success.title" as="h1" className="text-h2 font-semibold" />
              <LangSwap k="gts.checkout.success.sub" as="p" className="text-small font-medium text-inkSec" />
              <Button as={Link} to={`/ticket/${done.id}`}>
                <LangSwap k="gts.checkout.success.viewTicket" />
              </Button>
            </div>
          </SuccessStamp>
        </div>
      </Container>
    );
  }

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
              </dl>
            </section>

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
          </div>

          {/* 금액 내역 + 결제 · 전 항목 + 합계 + DRAFT 항상 펼침(§33) */}
          <aside className="flex flex-col gap-24 rounded-xl bg-white p-24 shadow-md">
            <LangSwap k="gts.checkout.priceTitle" as="h2" className="text-h3 font-semibold" />
            <FareBreakdown vehicle={vehicle} luggage={luggage} party={party} />
            <div className="grid">
              <Button disabled={!dropoffOk || submitting} onClick={onPay}>
                <LangSwap k="gts.checkout.payCta" />
                {submitting && (
                  <Loader2 size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                )}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <LoginGate open={gateOpen} onClose={() => setGateOpen(false)} onSuccess={() => setConfirmOpen(true)} />

      {/* 프로토타입 결제 확인 · 실결제 없음 고지(§33 · Terms §2와 일치하는 신설 gts 키) */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="gts.checkout.confirmTitle">
        <div className="flex flex-col gap-24">
          <LangSwap k="gts.checkout.prototypeNotice" as="p" className="text-body" />
          <div className="flex items-baseline justify-between">
            <LangSwap k="gts.fare.total" className="text-small font-medium text-inkSec" />
            <span className="font-display text-h3 font-bold text-primary">
              {'₩'}
              {total.toLocaleString('en-US')}
            </span>
          </div>
          <div className="grid">
            <Button disabled={submitting} onClick={submit}>
              <LangSwap k="gts.checkout.confirmCta" />
              {submitting && (
                <Loader2 size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </Container>
  );
}
