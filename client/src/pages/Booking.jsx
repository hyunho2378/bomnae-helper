// 예약 — IA §2.6: 3스텝(출발 프리필 → 인원 → 요약) + 확정에서만 LoginGate(Guest-first, ROUTES §3).
// 게스트 진행 상태는 in-memory BookingContext(웹스토리지 금지 — DESIGN §15). 성공 시 SuccessStamp → /ticket/:id.
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { createBooking, getDepartures, getLine, getMeetingPoints } from '../data/api';
import PartyStep from '../components/booking/PartyStep';
import SuccessStamp from '../components/booking/SuccessStamp';
import SummaryStep from '../components/booking/SummaryStep';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import LoginGate from '../components/ui/LoginGate';
import Skeleton from '../components/ui/Skeleton';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

const VALID = ['potato', 'dakgalbi', 'lake'];
const STEP_KEYS = ['booking.steps.departure', 'booking.steps.party', 'booking.steps.summary'];
const DAYS = 7; // Step 1 날짜 선택 폭 — 회차·가격 DRAFT(IA §4)

const toDateStr = (d) => d.toLocaleDateString('en-CA');
const isWeekendStr = (dateStr) => {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

export default function Booking() {
  const { lineId } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { draft, setDraft, reset } = useBooking();
  const { lang } = useLang();

  const [line, setLine] = useState(null);
  const [meetingPoint, setMeetingPoint] = useState(null);
  const [departures, setDepartures] = useState(null); // draft.date의 회차 3개
  const [step, setStep] = useState(1);
  const [gateOpen, setGateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // 생성된 booking

  const valid = VALID.includes(lineId);

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS }, (_, i) =>
      toDateStr(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)),
    );
  }, []);

  // 진입 시 초안 초기화 — 캘린더 쿼리(?date=&time=) 프리필(ROUTES §1)
  useEffect(() => {
    if (!valid) return;
    setDraft((d) => ({
      ...d,
      lineId,
      date: params.get('date') ?? d.date,
      time: params.get('time') ?? d.time,
    }));
    // 쿼리 프리필은 진입 시 1회만 반영(의존성 고의 축소)
  }, [lineId, valid]); // eslint 미사용 프로젝트 — params는 마운트 시점 값만 사용


  useEffect(() => {
    if (!valid) return undefined;
    let alive = true;
    (async () => {
      const [lineData, points] = await Promise.all([getLine(lineId), getMeetingPoints()]);
      if (!alive) return;
      setLine(lineData);
      setMeetingPoint(points[0]); // 미팅포인트 고정(IA §5) — MVP 첫 포인트
    })();
    return () => {
      alive = false;
    };
  }, [lineId, valid]);

  // 날짜 변경 → 회차 로드
  useEffect(() => {
    if (!valid || !draft.date) return undefined;
    let alive = true;
    (async () => {
      const deps = await getDepartures(lineId, draft.date);
      if (alive) setDepartures(deps);
    })();
    return () => {
      alive = false;
    };
  }, [lineId, draft.date, valid]);

  if (!valid) return <Navigate to="/loop" replace />;

  const departure = departures?.find((d) => d.time === draft.time) ?? null;
  const seatsLeft = departure ? departure.capacity - departure.booked_count : 0;

  // 합계 — 주말 차등은 좌석당 가산(가격 전부 DRAFT, 5일차 BM 검토 확정 — IA §4)
  const delta = draft.date && isWeekendStr(draft.date) ? (line?.price_weekend_delta ?? 0) : 0;
  const total = line
    ? draft.adults * (line.price_adult + delta) + draft.children * (line.price_child + delta)
    : 0;

  const submit = async () => {
    setSubmitting(true);
    const booking = await createBooking({
      lineId,
      departure_id: departure.id,
      date: draft.date,
      time: draft.time,
      adults: draft.adults,
      children: draft.children,
      total,
    });
    reset();
    setSubmitting(false);
    setDone(booking);
  };

  // 확정 — 미로그인 시에만 LoginGate(액션 레벨 가드, ROUTES §3)
  const onConfirm = () => {
    if (user) submit();
    else setGateOpen(true);
  };

  if (!line || !meetingPoint) {
    return (
      <Container>
        <div className="mx-auto flex w-full max-w-dialog flex-col gap-16 py-64 lg:pt-96">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-128 w-full" />
        </div>
      </Container>
    );
  }

  // 예약 성공 — 스탬프 드롭(scale 화이트리스트 1/2) 후 티켓 이동
  if (done) {
    return (
      <Container>
        <div className="mx-auto w-full max-w-dialog py-64 lg:pt-96">
          <SuccessStamp line={line}>
            <div className="flex flex-col items-center gap-16">
              <LangSwap k="booking.success.title" as="h1" className="text-h2 font-semibold" />
              <LangSwap k="booking.success.sub" as="p" className="text-small font-light text-inkSec" />
              <Button as={Link} to={`/ticket/${done.id}`}>
                <LangSwap k="booking.success.viewTicket" />
              </Button>
            </div>
          </SuccessStamp>
        </div>
      </Container>
    );
  }

  const stepValid =
    step === 1 ? Boolean(draft.date && draft.time && departure && departure.status !== 'closed') : true;

  return (
    <Container>
      <div className="mx-auto flex w-full max-w-dialog flex-col gap-32 py-64 lg:pt-96">
        <div className="flex flex-col gap-8">
          <LangSwap k="booking.title" as="h1" className="text-h2 font-semibold" />
          {/* 스텝 인디케이터 — 실제 순서라 숫자 마커 허용(COMPONENTS B HowItWorks 준용) */}
          <p className="flex flex-wrap items-baseline gap-8 text-small text-inkSec">
            <LangSwap k="booking.stepLabel" className="font-medium" />
            <span className="font-display font-semibold">{step}</span>
            <span aria-hidden="true">/</span>
            <span className="font-display font-light">3</span>
            <LangSwap k={STEP_KEYS[step - 1]} className="font-medium text-ink" />
          </p>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-24">
            <div className="flex flex-col gap-12">
              <LangSwap
                k="booking.dateLabel"
                as="p"
                className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
              />
              <ul className="flex flex-wrap gap-8">
                {dates.map((dateStr) => (
                  <li key={dateStr}>
                    <Chip
                      active={draft.date === dateStr}
                      onClick={() => setDraft({ ...draft, date: dateStr, time: null })}
                    >
                      {/* 언어별 날짜 포맷 폭이 달라 겹침 렌더(PATTERNS §1, 시프트 0) */}
                      <span className="grid font-display">
                        <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>
                          {new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                        </span>
                        <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>
                          {new Date(`${dateStr}T00:00:00`).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                        </span>
                      </span>
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-12" aria-live="polite">
              <LangSwap
                k="booking.timeLabel"
                as="p"
                className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
              />
              {draft.date && departures ? (
                <ul className="flex flex-wrap gap-12">
                  {departures.map((dep) => (
                    <li key={dep.id} className="flex items-center gap-8">
                      <Chip
                        active={draft.time === dep.time}
                        disabled={dep.status === 'closed'} // 만석 회차 비활성(PATTERNS §5)
                        onClick={() => setDraft({ ...draft, time: dep.time })}
                      >
                        <span className="flex items-baseline gap-8">
                          <span className="font-display text-small font-semibold">{dep.time}</span>
                          <span className="flex items-baseline gap-4 text-caption">
                            <span className="font-display">{dep.capacity - dep.booked_count}</span>
                            <LangSwap k="loop.detail.seatsLeft" />
                          </span>
                        </span>
                      </Chip>
                      <StatusBadge status={dep.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <Skeleton className="h-44 w-full" />
              )}
            </div>
          </div>
        )}

        {step === 2 && departure && (
          <PartyStep
            adults={draft.adults}
            children={draft.children}
            maxAdults={Math.max(1, seatsLeft - draft.children)}
            maxChildren={Math.max(0, seatsLeft - draft.adults)}
            total={total}
            onAdults={(v) => setDraft({ ...draft, adults: v })}
            onChildren={(v) => setDraft({ ...draft, children: v })}
          />
        )}

        {step === 3 && departure && (
          <SummaryStep
            line={line}
            draft={draft}
            departure={departure}
            meetingPoint={meetingPoint}
            total={total}
          />
        )}

        <div className="flex items-center justify-between gap-16">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <LangSwap k="common.back" />
            </Button>
          ) : (
            <span aria-hidden="true" />
          )}
          {step < 3 ? (
            <Button disabled={!stepValid} onClick={() => setStep(step + 1)}>
              <LangSwap k="common.next" />
            </Button>
          ) : (
            <Button disabled={submitting} onClick={onConfirm}>
              <LangSwap k="booking.confirmCta" />
              {/* 제출 중 — 라벨 유지 + 우측 스피너(PATTERNS §6), reduced-motion 정지 */}
              {submitting && (
                <Loader2
                  size={16}
                  aria-hidden="true"
                  className="animate-spin motion-reduce:animate-none"
                />
              )}
            </Button>
          )}
        </div>
      </div>

      <LoginGate open={gateOpen} onClose={() => setGateOpen(false)} onSuccess={submit} />
    </Container>
  );
}
