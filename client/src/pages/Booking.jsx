// 예약 확인 · v3.1 rev(IA §2.6 단일 확인 페이지 · 3스텝 폐지):
// 선택은 상세 스티키 패널에서 끝났다. 쿼리(?date=&time=&adult=&child=) 미비 시 상세로 replace.
// 좌 = 요약 카드(라인·날짜·회차·미팅포인트·인원·동승·호스트·선주문, 각 항목 "Edit" → 상세 복귀
// 쿼리 보존) / 우(lg+) = 합계 + 확정 CTA. 확정에서만 LoginGate → createBooking → /ticket/:id.
// 성공 시 SuccessStamp(scale 화이트리스트 1/2). 게스트 상태는 쿼리(웹스토리지 금지).
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { createBooking, getDepartures, getLine, getMeetingPoints } from '../data/api';
import SuccessStamp from '../components/booking/SuccessStamp';
import { computeTotal } from '../components/loop/StickyBookPanel';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import LoginGate from '../components/ui/LoginGate';
import Skeleton from '../components/ui/Skeleton';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';
// 숫자 삽입 문장 3언어 겹침 렌더용(PATTERNS §1·§18) · 시프트 0
import en from '../i18n/en';
import ko from '../i18n/ko';
import th from '../i18n/th';

const DICTS = { en, ko, th };
const LANGS = ['en', 'ko', 'th'];
const VALID = ['potato', 'dakgalbi', 'lake'];

// 라인 컬러 정적 클래스 매핑(토큰 클래스만)
const DOT = { potato: 'bg-yellow', dakgalbi: 'bg-spice', lake: 'bg-primary' };

// 요약 행 · 라벨 + 값 + "Edit"(상세 복귀 · 쿼리 보존). 행 사이 디바이더는 colors.line 허용 예외.
function Row({ labelKey, editHref, children }) {
  return (
    <div className="flex items-baseline justify-between gap-16 py-12">
      <LangSwap
        k={labelKey}
        as="dt"
        className="shrink-0 text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
      />
      <dd className="flex min-w-0 flex-1 items-baseline justify-end gap-12 text-right text-body">
        {children}
        {editHref && (
          <Link
            to={editHref}
            className="shrink-0 text-small font-medium text-primary transition-colors duration-fast hover:text-navy"
          >
            <LangSwap k="booking.edit" />
          </Link>
        )}
      </dd>
    </div>
  );
}

// 데이터 필드(en/ko · th 없음) 겹침 · th는 en 폴백(v3.1 규칙)
function BiText({ en: textEn, ko: textKo, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>{textEn}</span>
      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{textKo}</span>
    </span>
  );
}

export default function Booking() {
  const { lineId } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { lang } = useLang();

  const [line, setLine] = useState(null);
  const [meetingPoint, setMeetingPoint] = useState(null);
  const [departures, setDepartures] = useState(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null); // 생성된 booking

  const valid = VALID.includes(lineId);
  const date = params.get('date');
  const time = params.get('time');
  const adults = Number.parseInt(params.get('adult') ?? '', 10);
  const children = Number.parseInt(params.get('child') ?? '', 10);
  // 쿼리 계약(ROUTES §1 v3.1) · 미비·비정상 값은 상세로 replace
  const queryOk =
    Boolean(date && time) &&
    Number.isInteger(adults) &&
    adults >= 1 &&
    Number.isInteger(children) &&
    children >= 0;

  useEffect(() => {
    if (!valid || !queryOk) return undefined;
    let alive = true;
    (async () => {
      const [lineData, points, deps] = await Promise.all([
        getLine(lineId),
        getMeetingPoints(),
        getDepartures(lineId, date),
      ]);
      if (!alive) return;
      setLine(lineData);
      setMeetingPoint(points[0]); // 미팅포인트 고정(IA §5) · MVP 첫 포인트
      setDepartures(deps);
    })();
    return () => {
      alive = false;
    };
  }, [lineId, valid, queryOk, date]);

  if (!valid) return <Navigate to="/loop" replace />;
  if (!queryOk) return <Navigate to={`/loop/${lineId}`} replace />;

  const departure = departures?.find((d) => d.time === time) ?? null;
  // 존재하지 않는 회차 시각 · 상세로 복귀(쿼리의 날짜는 보존)
  if (departures && !departure) {
    return <Navigate to={`/loop/${lineId}?date=${date}`} replace />;
  }

  const total = computeTotal(line, date, adults, children);
  // "Edit" · 상세 복귀 시 현재 쿼리 전부 보존(IA §2.6)
  const editHref = `/loop/${lineId}?date=${date}&time=${encodeURIComponent(time)}&adult=${adults}&child=${children}`;

  const submit = async () => {
    setSubmitting(true);
    const booking = await createBooking({
      lineId,
      departure_id: departure.id,
      date,
      time,
      adults,
      children,
      total,
    });
    setSubmitting(false);
    setDone(booking);
  };

  // 확정 · 미로그인 시에만 LoginGate(액션 레벨 가드, ROUTES §3)
  const onConfirm = () => {
    if (user) submit();
    else setGateOpen(true);
  };

  if (!line || !meetingPoint || !departures) {
    return (
      <Container>
        <div className="flex flex-col gap-16 py-64 lg:pt-96">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-128 w-full" />
        </div>
      </Container>
    );
  }

  // 예약 성공 · 스탬프 드롭(scale 화이트리스트 1/2) 후 티켓 이동
  if (done) {
    return (
      <Container>
        <div className="mx-auto w-full max-w-dialog py-64 lg:pt-96">
          <SuccessStamp line={line}>
            <div className="flex flex-col items-center gap-16">
              <LangSwap k="booking.success.title" as="h1" className="text-h2 font-semibold" />
              <LangSwap k="booking.success.sub" as="p" className="text-small font-regular text-inkSec" />
              <Button as={Link} to={`/ticket/${done.id}`}>
                <LangSwap k="booking.success.viewTicket" />
              </Button>
            </div>
          </SuccessStamp>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-col gap-32 py-64 lg:pt-96">
        <LangSwap k="booking.title" as="h1" className="text-h2 font-semibold" />

        {/* 좌 요약 / 우 합계+확정(IA §2.6) · 우폭 380px은 §15 패널 폭 준용 명세값 */}
        <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-12">
          {/* 요약 카드 · 무보더(shadow.sm) + 내부 수평 디바이더(colors.line 허용 예외) */}
          <dl className="flex flex-col divide-y divide-line rounded-xl bg-white px-24 py-8 shadow-sm">
            <Row labelKey="booking.summary.line" editHref={editHref}>
              <span className="flex min-w-0 items-center gap-8">
                <span aria-hidden="true" className={`h-8 w-8 shrink-0 rounded-pill ${DOT[line.id]}`} />
                <BiText en={line.name_en} ko={line.name_ko} className="min-w-0 font-semibold" />
              </span>
            </Row>
            <Row labelKey="booking.summary.departure" editHref={editHref}>
              <span className="flex items-center gap-8">
                <span className="font-display font-semibold">
                  {date} · {time}
                </span>
                <StatusBadge status={departure.status} />
              </span>
            </Row>
            <Row labelKey="booking.summary.meeting" editHref={editHref}>
              {/* 미팅포인트 고정(IA §5) · PLACEHOLDER 좌표(stops.js) */}
              <BiText en={meetingPoint.name_en} ko={meetingPoint.name_ko} />
            </Row>
            <Row labelKey="booking.summary.party" editHref={editHref}>
              <span className="flex items-baseline gap-8">
                <LangSwap k="booking.adults" className="text-small text-inkSec" />
                <span className="font-display font-semibold">{adults}</span>
                <LangSwap k="booking.children" className="text-small text-inkSec" />
                <span className="font-display font-semibold">{children}</span>
              </span>
            </Row>
            <Row labelKey="booking.summary.riders">
              {/* 동승 · 좌석 = 매칭(IA §2.6). 숫자 삽입 문장은 3언어 완성 문장 겹침(시프트 0) */}
              <span className="grid text-small">
                {LANGS.map((code) => (
                  <span
                    key={code}
                    aria-hidden={lang !== code}
                    className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
                  >
                    {DICTS[code].loop.detail.ridersPre}{' '}
                    <span className="font-display font-semibold">{departure.booked_count}</span>{' '}
                    {DICTS[code].loop.detail.ridersPost}
                  </span>
                ))}
              </span>
            </Row>
            <Row labelKey="booking.summary.host">
              {/* 호스트 이름 PLACEHOLDER · 확정 전(lines.js) */}
              <span className="font-semibold">{line.host_name}</span>
            </Row>
            <Row labelKey="booking.summary.preorder">
              {/* 선주문 안내 · 핵심 차별점(IA §2.1 How it works) */}
              <LangSwap k="booking.summary.preorderNote" className="text-small font-regular text-inkSec" />
            </Row>
          </dl>

          {/* 합계 + 확정 CTA · lg+ 우측, 모바일 하단(문서 흐름) */}
          <aside className="flex flex-col gap-24 rounded-xl bg-white p-24 shadow-md">
            <div className="flex items-baseline justify-between">
              <LangSwap k="booking.total" className="text-small font-medium text-inkSec" />
              <span className="font-display text-h2 font-bold tracking-display text-primary">
                {'₩'}
                {total.toLocaleString('en-US')}
              </span>
            </div>
            <div className="grid">
              <Button disabled={submitting || departure.status === 'closed'} onClick={onConfirm}>
                <LangSwap k="booking.confirmCta" />
                {/* 제출 중 · 라벨 유지 + 우측 스피너(PATTERNS §6), reduced-motion 정지 */}
                {submitting && (
                  <Loader2
                    size={16}
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                )}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <LoginGate open={gateOpen} onClose={() => setGateOpen(false)} onSuccess={submit} />
    </Container>
  );
}
