// 스티키 예약 패널 · v3.1 신설(PATTERNS §15 G-Local aside 이식, IA §2.5.4):
// white rounded-xl shadow-md p-24. 순서: 가격(Kanit Bold)+기준 → DepartureCalendar(재사용,
// 자체 회차 Chip+잔여 좌석 포함) → Adult/Child Stepper → 디바이더(colors.line 1px) →
// 소계 행들 → 합계(semibold primary) → 좌석=매칭 한 줄+호스트 → CTA "Reserve seats"
// → /loop/:lineId/book?date=&time=&adult=&child=.
// 선택 상태는 URL 쿼리와 동기(replace · 뒤로가기 보존). 캘린더·인원·합계는 이 패널 안에만.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDepartures } from '../../data/api';
import DepartureCalendar from './DepartureCalendar';
import Button from '../ui/Button';
import Stepper from '../ui/Stepper';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 숫자 삽입 문장 3언어 겹침 렌더용(PATTERNS §1·§18) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';
import th from '../../i18n/th';

const DICTS = { en, ko, th };
const LANGS = ['en', 'ko', 'th'];

const isWeekendStr = (dateStr) => {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

// 합계 · 주말 차등은 좌석당 가산(가격 전부 DRAFT, 5일차 BM 검토 확정 · IA §4).
// Booking(확인 페이지)·모바일 하단 바가 동일 산식을 공유한다.
export function computeTotal(line, dateStr, adults, children) {
  if (!line) return 0;
  const delta = dateStr && isWeekendStr(dateStr) ? (line.price_weekend_delta ?? 0) : 0;
  return adults * (line.price_adult + delta) + children * (line.price_child + delta);
}

// 쿼리 정수 파서 · adult 기본 1, child 기본 0(IA §2.5 쿼리 계약)
export function readParty(searchParams) {
  const adult = Number.parseInt(searchParams.get('adult') ?? '1', 10);
  const child = Number.parseInt(searchParams.get('child') ?? '0', 10);
  return {
    adults: Number.isNaN(adult) ? 1 : Math.max(1, adult),
    children: Number.isNaN(child) ? 0 : Math.max(0, child),
  };
}

export default function StickyBookPanel({ line }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { lang } = useLang();
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const { adults, children } = readParty(searchParams);
  const [departure, setDeparture] = useState(null); // 선택 회차 · 잔여 좌석/동승 인원

  // URL 쿼리 동기 · replace(선택마다 히스토리를 쌓지 않되 뒤로가기 시 상태 보존)
  const patch = (entries) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([k, v]) => {
      if (v === null || v === undefined) next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!date || !time) {
      setDeparture(null);
      return undefined;
    }
    let alive = true;
    (async () => {
      const deps = await getDepartures(line.id, date);
      if (alive) setDeparture(deps.find((d) => d.time === time) ?? null);
    })();
    return () => {
      alive = false;
    };
  }, [line.id, date, time]);

  const seatsLeft = departure ? departure.capacity - departure.booked_count : null;
  const total = computeTotal(line, date, adults, children);
  const ready = Boolean(date && time && departure && departure.status !== 'closed');
  const bookHref = `/loop/${line.id}/book?date=${date ?? ''}&time=${encodeURIComponent(
    time ?? '',
  )}&adult=${adults}&child=${children}`;

  return (
    <div className="flex flex-col gap-24 rounded-xl bg-white p-24 shadow-md">
      {/* 가격 · Kanit Bold + 기준 표기(§15) */}
      <p className="flex items-baseline gap-8">
        <span className="font-display text-h2 font-bold tracking-display">
          {'₩'}
          {line.price_adult.toLocaleString('en-US')}
        </span>
        <LangSwap k="loop.detail.priceUnit" className="text-small font-light text-inkSec" />
      </p>

      {/* 캘린더 + 회차 Chip + 잔여 좌석(§5 재사용, 폭 100%) · URL 쿼리 시드 */}
      <DepartureCalendar
        lineId={line.id}
        defaultDate={date}
        defaultTime={time}
        onPickDate={(d) => patch({ date: d, time: null })}
        onPick={(pick) => patch({ date: pick.date, time: pick.time })}
      />

      {/* Adult/Child Stepper · 잔여 좌석 클램프 */}
      <div className="flex flex-col gap-16">
        <Stepper
          value={adults}
          min={1}
          max={seatsLeft !== null ? Math.max(1, seatsLeft - children) : 12}
          onChange={(v) => patch({ adult: v })}
          label="booking.adults"
        />
        <Stepper
          value={children}
          min={0}
          max={seatsLeft !== null ? Math.max(0, seatsLeft - adults) : 12}
          onChange={(v) => patch({ child: v })}
          label="booking.children"
        />
      </div>

      {/* 디바이더 · colors.line 수평 1px(무보더 원칙의 허용 예외, DESIGN §7) */}
      <div aria-hidden="true" className="h-px w-full bg-line" />

      {/* 소계 → 합계(semibold primary · §15) */}
      <div aria-live="polite" className="flex flex-col gap-8">
        <p className="flex items-baseline justify-between text-small text-inkSec">
          <span className="flex items-baseline gap-8">
            <LangSwap k="booking.adults" className="font-medium" />
            <span className="font-display font-light">{adults}</span>
          </span>
          <span className="font-display">
            {'₩'}
            {computeTotal(line, date, adults, 0).toLocaleString('en-US')}
          </span>
        </p>
        <p className="flex items-baseline justify-between text-small text-inkSec">
          <span className="flex items-baseline gap-8">
            <LangSwap k="booking.children" className="font-medium" />
            <span className="font-display font-light">{children}</span>
          </span>
          <span className="font-display">
            {'₩'}
            {computeTotal(line, date, 0, children).toLocaleString('en-US')}
          </span>
        </p>
        <p className="flex items-baseline justify-between">
          <LangSwap k="booking.total" className="text-small font-medium" />
          <span className="font-display text-h3 font-semibold text-primary">
            {'₩'}
            {total.toLocaleString('en-US')}
          </span>
        </p>
      </div>

      {/* 좌석 = 매칭 한 줄 + 호스트(IA §2.5) · 회차 선택 후 노출 */}
      {departure && (
        <div className="flex flex-col gap-8">
          <p className="grid text-small" aria-live="polite">
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
          </p>
          <p className="flex flex-wrap items-baseline gap-x-8 text-small text-inkSec">
            <LangSwap
              k="loop.detail.hostLabel"
              className="font-medium uppercase tracking-eyebrow text-caption text-inkMeta"
            />
            {/* 호스트 이름 PLACEHOLDER · 확정 전(lines.js) */}
            <span className="font-display font-semibold text-ink">{line.host_name}</span>
            <LangSwap k="loop.detail.hostIntro" className="font-light" />
          </p>
        </div>
      )}

      {/* CTA · 플로우 끝까지 동일 어휘 "Reserve seats"(DESIGN §13). grid 래핑 = full 폭 */}
      <div className="grid">
        <Button as={Link} to={bookHref} disabled={!ready}>
          <LangSwap k="booking.title" />
        </Button>
      </div>
    </div>
  );
}
