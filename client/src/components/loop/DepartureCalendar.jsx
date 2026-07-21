// 출발 캘린더 · v3.2 rev(PATTERNS §20 yountravel 2개월 스프레드 · IA §8.3.3):
// lg+ 이번 달·다음 달 나란히(존 A2 공용 CalendarGrid 재사용), 모바일 1개월 + 월 전환.
// 각 날짜 셀: 가격 인라인(caption 700 · CalendarGrid cellInfo.extra) + 상태 도트(원색+shadow.sm)
// + 마감 취소선(CalendarGrid 내장). 범례 = 캘린더 우상단 원색 도트(출발확정 green/출발유력 yellow).
// 캘린더 아래 회차 리스트 전부 펼침: 시각·잔여석·상태 배지 항상 1뷰(아코디언·클릭 후 노출 금지 ·
// §8.3.4 다크패턴 제거). 선택 상태(URL 동기)는 LineDetail 소관 · 이 컴포넌트는 표시+콜백만.
// props: { line, selectedDate, selectedTime, departures(선택 날짜 회차 배열|null),
//          onPickDate(dateStr), onPickTime(time) }
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDepartures } from '../../data/api';
import CalendarGrid from '../ui/CalendarGrid';
import IconButton from '../ui/IconButton';
import Skeleton from '../ui/Skeleton';
import StatusBadge from '../ui/StatusBadge';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 언어별 포맷 문자열 3언어 겹침 렌더용(PATTERNS §1·§18) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';
import th from '../../i18n/th';

const DICTS = { en, ko, th };
const LANGS = ['en', 'ko', 'th'];

const pad = (n) => String(n).padStart(2, '0');
const toStr = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
const isWeekendStr = (dateStr) => {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  return day === 0 || day === 6;
};
// 월 이동 · {y, m(1~12)} + delta
const addMonth = ({ y, m }, delta) => {
  const total = y * 12 + (m - 1) + delta;
  return { y: Math.floor(total / 12), m: (total % 12) + 1 };
};
const monthKey = ({ y, m }) => `${y}-${pad(m)}`;

// 날짜 상태: 회차 중 최선 상태(confirmed > likely > closed) · 셀 도트/취소선의 근거
const dayStatus = (deps) =>
  deps.some((d) => d.status === 'confirmed')
    ? 'confirmed'
    : deps.some((d) => d.status === 'likely')
      ? 'likely'
      : 'closed';

// 범례 도트 · 원색 원 + shadow.sm(§20 · 틴트 금지)
const LEGEND = [
  ['confirmed', 'bg-green'],
  ['likely', 'bg-yellow'],
];

// 사전 유래 포맷 3언어 겹침(시프트 0)
function DictSwap({ make, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {make(DICTS[code])}
        </span>
      ))}
    </span>
  );
}

const fmtMonth = (dict, { y, m }) =>
  dict.common.calendar.monthFormat
    .replace('{month}', dict.common.calendar.months[`m${m}`])
    .replace('{year}', String(y));

export default function DepartureCalendar({
  line,
  selectedDate,
  selectedTime,
  departures,
  onPickDate,
  onPickTime,
}) {
  const { t } = useLang();
  const today = todayStr();
  // 월 커서 · 선택 날짜의 월에서 시작(URL 복원 대응)
  const [cursor, setCursor] = useState(() => {
    const base = selectedDate ?? today;
    return { y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) };
  });
  // 월별 상태 맵 · 'YYYY-MM' → { dateStr: status } (오늘 이후만 · 과거는 비활성)
  const [statusByMonth, setStatusByMonth] = useState({});

  const months = [cursor, addMonth(cursor, 1)]; // lg 2개월 · 모바일은 첫 달만 표시

  // 표시 월 상태 로드 · 중복 로드는 동일 데이터 병합이라 무해(StrictMode 재실행 안전)
  useEffect(() => {
    let alive = true;
    months.forEach((mo) => {
      const key = monthKey(mo);
      (async () => {
        const daysInMonth = new Date(mo.y, mo.m, 0).getDate();
        const dates = Array.from({ length: daysInMonth }, (_, i) => toStr(mo.y, mo.m, i + 1)).filter(
          (d) => d >= today,
        );
        const deps = await Promise.all(dates.map((d) => getDepartures(line.id, d)));
        if (!alive) return;
        setStatusByMonth((prev) => ({
          ...prev,
          [key]: Object.fromEntries(dates.map((d, i) => [d, dayStatus(deps[i])])),
        }));
      })();
    });
    return () => {
      alive = false;
    };
    // months는 cursor 파생 · cursor만 의존
  }, [line.id, cursor]); // eslint-disable-line react-hooks/exhaustive-deps

  // 셀 정보(§20) · 가격 인라인(caption 700 · 선택 셀에서는 currentColor로 white 상속) + 상태
  const cellInfo = (dateStr) => {
    if (dateStr < today) return {};
    const price =
      line.price_adult + (isWeekendStr(dateStr) ? (line.price_weekend_delta ?? 0) : 0);
    const status = statusByMonth[monthKey({ y: Number(dateStr.slice(0, 4)), m: Number(dateStr.slice(5, 7)) })]?.[dateStr];
    return {
      extra: (
        <span className="font-display text-caption font-bold">
          {Math.round(price / 1000)}k
        </span>
      ),
      status,
    };
  };

  const prevDisabled = monthKey(cursor) <= monthKey({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) });

  return (
    <div className="flex flex-col gap-16">
      {/* 헤더 행 · 좌 월 전환(모바일 필수 · lg에서도 페이지 이동 허용), 우상단 범례(§20 상시) */}
      <div className="flex flex-wrap items-center justify-between gap-12">
        <div className="flex items-center gap-4">
          {/* 과거 월 이동은 클램프(오늘 이전 비활성과 동일 근거) */}
          <IconButton
            icon={ChevronLeft}
            label="common.calendar.prevMonth"
            size={20}
            onClick={() => {
              if (!prevDisabled) setCursor((c) => addMonth(c, -1));
            }}
          />
          <IconButton
            icon={ChevronRight}
            label="common.calendar.nextMonth"
            size={20}
            onClick={() => setCursor((c) => addMonth(c, 1))}
          />
        </div>
        <div aria-label={t('loop.detail.legendLabel')} className="flex items-center gap-16">
          {LEGEND.map(([status, dot]) => (
            <span key={status} className="flex items-center gap-8">
              <span aria-hidden="true" className={`h-8 w-8 rounded-pill shadow-sm ${dot}`} />
              <LangSwap k={`status.${status}`} className="text-caption font-semibold text-ink" />
            </span>
          ))}
        </div>
      </div>

      {/* 2개월 스프레드(§20) · gap-12 = §20 gap 근사(토큰 스케일 내 택1 · 지시 준수) */}
      <div className="grid gap-12 lg:grid-cols-2">
        {months.map((mo, i) => (
          <div key={monthKey(mo)} className={i === 1 ? 'hidden lg:flex lg:flex-col lg:gap-8' : 'flex flex-col gap-8'}>
            <DictSwap
              make={(d) => fmtMonth(d, mo)}
              className="font-display text-body font-semibold text-ink"
            />
            <CalendarGrid
              year={mo.y}
              month={mo.m}
              selected={selectedDate}
              onSelect={onPickDate}
              minDate={today}
              cellInfo={cellInfo}
            />
          </div>
        ))}
      </div>

      {/* 회차 리스트 · 전부 펼침(§20 · 시각·잔여석·상태 항상 1뷰, 아코디언 금지) */}
      <div aria-live="polite">
        {departures ? (
          <ul className="flex flex-col divide-y divide-line">
            {departures.map((dep) => {
              const left = dep.capacity - dep.booked_count;
              const closed = dep.status === 'closed';
              const active = selectedTime === dep.time;
              return (
                <li key={dep.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    disabled={closed}
                    onClick={() => onPickTime(dep.time)}
                    className={`flex min-h-44 w-full items-center justify-between gap-16 rounded-sm px-8 transition-colors duration-fast ${
                      active ? 'ring-2 ring-inset ring-primary' : 'hover:bg-surface'
                    } ${closed ? 'pointer-events-none opacity-40' : ''}`}
                  >
                    <span
                      className={`font-display text-body font-bold ${closed ? 'line-through' : ''}`}
                    >
                      {dep.time}
                    </span>
                    <span className="flex items-center gap-12">
                      <DictSwap
                        make={(d) => `${left} ${d.loop.detail.seatsLeft}`}
                        className="font-display text-small font-regular text-inkSec"
                      />
                      <StatusBadge status={dep.status} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <Skeleton className="h-44 w-full" />
        )}
      </div>
    </div>
  );
}
