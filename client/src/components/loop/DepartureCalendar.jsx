// 출발 캘린더 — PATTERNS §5 그대로: 날짜 셀(숫자 Kanit 500 + 가격 인라인 caption
// "18k" 축약 + 상태 점), 선택 셀 border primary 2px, 날짜 선택 → 회차 Chip 3개
// (시각 + 남은 좌석) + StatusBadge, 만석 Chip disabled. 키보드: 화살표 이동 + Enter(roving tabindex).
// yountravel 검증 패턴 채택(IA §5): 가격 인라인 + 출발확정/출발유력 상태.
import { useEffect, useMemo, useRef, useState } from 'react';
import { getDepartures, getLine } from '../../data/api';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Chip from '../ui/Chip';
import Skeleton from '../ui/Skeleton';
import StatusBadge from '../ui/StatusBadge';

const DAYS = 14; // 오늘부터 2주 그리드 — 회차 시각·가격 DRAFT(IA §4)

const toDateStr = (d) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD
const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

// 날짜 셀 상태: 회차 중 최선 상태(confirmed > likely > closed) — 셀에는 점, 회차에는 배지
const dayStatus = (deps) =>
  deps.some((d) => d.status === 'confirmed')
    ? 'confirmed'
    : deps.some((d) => d.status === 'likely')
      ? 'likely'
      : 'closed';

const DOT = {
  confirmed: 'bg-green',
  likely: 'bg-yellow',
  closed: 'bg-inkMeta',
};

export default function DepartureCalendar({ lineId, onPick }) {
  const { lang, t } = useLang();
  const [line, setLine] = useState(null);
  const [byDate, setByDate] = useState(null); // dateStr → departures[]
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [focusIdx, setFocusIdx] = useState(0); // roving tabindex
  const cellRefs = useRef([]);

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      return d;
    });
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [lineData, ...deps] = await Promise.all([
        getLine(lineId),
        ...dates.map((d) => getDepartures(lineId, toDateStr(d))),
      ]);
      if (!alive) return;
      setLine(lineData);
      setByDate(Object.fromEntries(dates.map((d, i) => [toDateStr(d), deps[i]])));
    })();
    return () => {
      alive = false;
    };
  }, [lineId, dates]);

  const pickDate = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedTime(null);
  };

  const pickTime = (dep) => {
    setSelectedTime(dep.time);
    onPick({ date: dep.date, time: dep.time });
  };

  // roving tabindex — 화살표 이동, Enter/Space 선택(PATTERNS §5)
  const onGridKeyDown = (e, i) => {
    const jump = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (jump === undefined) return;
    e.preventDefault();
    const next = Math.min(Math.max(i + jump, 0), dates.length - 1);
    setFocusIdx(next);
    cellRefs.current[next]?.focus();
  };

  if (!line || !byDate) {
    return (
      <div className="flex flex-col gap-12">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  const selectedDeps = selectedDate ? byDate[selectedDate] : null;

  return (
    <div className="flex flex-col gap-24">
      <div role="grid" aria-label={t('loop.detail.calendarTitle')}>
        <div role="row" className="grid grid-cols-7 gap-4 sm:gap-8">
          {dates.map((d, i) => {
            const dateStr = toDateStr(d);
            const deps = byDate[dateStr];
            const status = dayStatus(deps);
            // 가격 인라인 — 주중/주말 차등(₩ 축약 "18k", 가격 DRAFT)
            const price = line.price_adult + (isWeekend(d) ? line.price_weekend_delta : 0);
            const selected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                type="button"
                role="gridcell"
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                tabIndex={i === focusIdx ? 0 : -1}
                aria-pressed={selected}
                aria-label={`${d.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })} · ${t(`status.${status}`)}`}
                onClick={() => {
                  setFocusIdx(i);
                  pickDate(dateStr);
                }}
                onKeyDown={(e) => onGridKeyDown(e, i)}
                className={`flex min-h-44 flex-col items-center gap-4 rounded-sm py-8 transition-colors duration-fast ${
                  selected
                    ? 'border-2 border-primary text-ink' // 선택 셀 border primary 2px(PATTERNS §5)
                    : 'border border-line text-inkSec hover:border-primary hover:text-ink'
                }`}
              >
                {/* 요일 — 언어별 글리프 폭이 달라 겹침 렌더(시프트 0) */}
                <span className="grid text-caption font-light">
                  <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                  <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{d.toLocaleDateString('ko-KR', { weekday: 'narrow' })}</span>
                </span>
                <span className="font-display text-body font-medium">{d.getDate()}</span>
                <span className="font-display text-caption font-medium text-inkMeta">
                  {Math.round(price / 1000)}k
                </span>
                <span aria-hidden="true" className={`h-8 w-8 rounded-pill ${DOT[status]}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 회차 선택 — aria-live: 예약 상태 변경 영역(DESIGN §14) */}
      <div aria-live="polite" className="flex min-h-44 flex-col gap-12">
        {selectedDeps && (
          <ul className="flex flex-wrap gap-12">
            {selectedDeps.map((dep) => {
              const left = dep.capacity - dep.booked_count;
              return (
                <li key={dep.id} className="flex items-center gap-8">
                  <Chip
                    active={selectedTime === dep.time}
                    disabled={dep.status === 'closed'} // 만석 회차 비활성(PATTERNS §5)
                    onClick={() => pickTime(dep)}
                  >
                    <span className="flex items-baseline gap-8">
                      <span className="font-display text-small font-semibold">{dep.time}</span>
                      <span className="flex items-baseline gap-4 text-caption">
                        <span className="font-display">{left}</span>
                        <LangSwap k="loop.detail.seatsLeft" />
                      </span>
                    </span>
                  </Chip>
                  <StatusBadge status={dep.status} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
