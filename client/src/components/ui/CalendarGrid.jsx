// CalendarGrid · v3.2 공용 1개월 그리드(PATTERNS §19 셀 문법 · COMPONENTS 존 A2행).
// 소비처: 게이트 CalendarField(존 B2) + 라인 상세 2개월 스프레드(존 C2 · §20).
// 월 헤더·내비게이션은 호출부 소유. 이 컴포넌트는 요일 행 + 날짜 그리드만.
// props:
//   year, month(1~12) · selected(YYYY-MM-DD|null) · onSelect(dateStr)
//   minDate(YYYY-MM-DD|null · 미만 비활성, 기본 과거 비활성용으로 호출부가 오늘 전달)
//   cellInfo?(dateStr) => { extra?: node(가격 인라인 등), status?: 'confirmed'|'likely'|'closed', disabled?: bool }
// 셀 40px · 오늘 = primary 1.5px 링 · 선택 = primary 배경 white · 비활성 = ink 40% ·
// 마감(closed) = 취소선+비활성 · 상태 도트 = 원색 원 + shadow.sm(§20 · 틴트 금지).
// roving tabindex + ←→↑↓ 이동 · Enter/Space 선택.
import { useRef, useState } from 'react';
import LangSwap from '../../i18n/LangSwap';

const pad = (n) => String(n).padStart(2, '0');
const toStr = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

const DOT = { confirmed: 'bg-green', likely: 'bg-yellow' };

export default function CalendarGrid({ year, month, selected, onSelect, minDate, cellInfo }) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();
  const today = new Date();
  const todayStr = toStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const cells = [];
  for (let i = 0; i < firstDow; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  const dayMeta = (d) => {
    const dateStr = toStr(year, month, d);
    const info = cellInfo?.(dateStr) ?? {};
    const belowMin = minDate ? dateStr < minDate : false;
    const disabled = belowMin || info.disabled || info.status === 'closed';
    return { dateStr, info, disabled };
  };

  // roving tabindex · 활성(비활성 아님) 셀 중 선택值 우선, 없으면 첫 활성 셀
  const enabledDays = [];
  for (let d = 1; d <= daysInMonth; d += 1) if (!dayMeta(d).disabled) enabledDays.push(d);
  const selectedDay =
    selected && selected.startsWith(`${year}-${pad(month)}-`) ? Number(selected.slice(8, 10)) : null;
  const [focusDay, setFocusDay] = useState(null);
  const activeDay = focusDay ?? selectedDay ?? enabledDays[0] ?? null;
  const cellRefs = useRef({});

  const moveFocus = (from, delta) => {
    let next = from + delta;
    while (next >= 1 && next <= daysInMonth) {
      if (!dayMeta(next).disabled) {
        setFocusDay(next);
        cellRefs.current[next]?.focus();
        return;
      }
      next += delta > 0 ? 1 : -1;
    }
  };

  const onKeyDown = (e, d) => {
    const map = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };
    if (map[e.key] !== undefined) {
      e.preventDefault();
      moveFocus(d, map[e.key]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(toStr(year, month, d));
    }
  };

  return (
    <div role="grid" aria-label={`${year}-${pad(month)}`} className="flex w-full flex-col gap-4">
      <div role="row" className="grid grid-cols-7">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <LangSwap
            key={i}
            k={`common.calendar.weekdays.d${i}`}
            className="flex h-32 items-center justify-center text-caption font-semibold text-ink"
          />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-4">
        {cells.map((d, i) => {
          if (d === null) return <span key={`b${i}`} aria-hidden="true" />;
          const { dateStr, info, disabled } = dayMeta(d);
          const isSelected = selected === dateStr;
          const isToday = todayStr === dateStr;
          return (
            <button
              key={dateStr}
              ref={(el) => {
                cellRefs.current[d] = el;
              }}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-label={dateStr}
              disabled={disabled}
              tabIndex={d === activeDay ? 0 : -1}
              onFocus={() => setFocusDay(d)}
              onKeyDown={(e) => onKeyDown(e, d)}
              onClick={() => onSelect(dateStr)}
              className={`pressable flex min-h-40 flex-col items-center justify-start gap-4 rounded-sm py-4 ${
                isSelected
                  ? 'bg-primary text-white'
                  : disabled
                    ? 'text-ink opacity-40'
                    : 'text-ink hover:bg-surface'
              } ${isToday && !isSelected ? 'ring-1.5 ring-inset ring-primary' : ''}`}
            >
              <span
                className={`font-display text-small font-semibold ${
                  info.status === 'closed' ? 'line-through' : ''
                }`}
              >
                {d}
              </span>
              {info.extra}
              {/* 상태 도트 · 원색 원 + shadow.sm(§20) */}
              {DOT[info.status] && (
                <span aria-hidden="true" className={`h-8 w-8 rounded-pill shadow-sm ${DOT[info.status]}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
