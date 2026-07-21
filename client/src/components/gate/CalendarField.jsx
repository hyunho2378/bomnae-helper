// CalendarField · v3.2 게이트 날짜 선택(PATTERNS §19) · 네이티브 date input 금지의 대체재.
// FieldSelect식 트리거 + 팝 카드 = 월 헤더(월명 + 좌우 IconButton, common.calendar.*) + CalendarGrid(존 A2).
// 키보드 완주: 트리거 Enter → 그리드 활성 셀 포커스 → 화살표 4방향 → Enter 선택 → Escape 닫기(트리거 복귀).
// 과거 비활성(minDate=오늘)·오늘 링·선택 반전은 CalendarGrid가 처리. props: {label, value(YYYY-MM-DD|null), placeholder, onChange}.
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import usePopExit from '../ui/usePopExit';
import LangSwap from '../../i18n/LangSwap';
import CalendarGrid from '../ui/CalendarGrid';
import IconButton from '../ui/IconButton';
// 월 라벨 3언어 겹침(시프트 0) · 자기 소비 네임스페이스 외 common은 읽기 전용 import(존 A2 사전)
import enCommon from '../../i18n/en/common';
import koCommon from '../../i18n/ko/common';
import thCommon from '../../i18n/th/common';
import { DateText, localDateId } from './fieldOptions';

const COMMON_DICTS = { en: enCommon, ko: koCommon, th: thCommon };
const LANGS = ['en', 'ko', 'th'];

const monthLabel = (dict, year, month) =>
  dict.common.calendar.monthFormat
    .replace('{month}', dict.common.calendar.months[`m${month}`])
    .replace('{year}', String(year));

// 월 헤더 라벨 · 3언어 겹침 렌더(PATTERNS §1 동일 패턴) · 전환 시프트 0
function MonthText({ year, month }) {
  const { lang } = useLang();
  return (
    <span className="grid text-body font-semibold">
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {monthLabel(COMMON_DICTS[code], year, month)}
        </span>
      ))}
    </span>
  );
}

const parseDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function CalendarField({ label, value, placeholder, onChange }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [instantPop, setInstantPop] = useState(false);
  const { mounted: popMounted, closing: popClosing } = usePopExit(open, instantPop);
  const today = new Date();
  const todayStr = localDateId(today);
  // 표시 월 · 열 때 선택 월(없으면 이번 달)로 재정렬
  const [view, setView] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  }));
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // 열릴 때 그리드 활성 셀(roving tabindex 0)로 포커스 이동 · 키보드 완주 시작점
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      popRef.current?.querySelector('[role="gridcell"][tabindex="0"]')?.focus();
    });
  }, [open]);

  const toggle = (e) => {
    setInstantPop(e.detail === 0); // detail 0 = 키보드 발화 클릭(§17.1 무애니메이션)
    if (!open) {
      const base = value ? parseDate(value) : today;
      setView({ year: base.getFullYear(), month: base.getMonth() + 1 });
    }
    setOpen((v) => !v);
  };

  const close = (viaKeyboard = false) => {
    setInstantPop(viaKeyboard);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      close(true); // §17.1 키보드 개시 무애니메이션
    }
  };

  const atCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth() + 1;
  const move = (delta) => {
    // 과거 월 진입 클램프(과거 날짜 전부 비활성이므로 의미 없는 이동 차단 · Stepper 클램프 선례)
    if (delta < 0 && atCurrentMonth) return;
    setView(({ year, month }) => {
      const next = month + delta;
      if (next < 1) return { year: year - 1, month: 12 };
      if (next > 12) return { year: year + 1, month: 1 };
      return { year, month: next };
    });
  };

  const pick = (dateStr) => {
    onChange(dateStr);
    close();
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      {/* 닫힘 상태 = FieldSelect 문법: 무보더 surface 면 + 라벨(caption inkMeta) + 값/플레이스홀더 */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="grid"
        aria-expanded={open}
        onClick={toggle}
        className="flex w-full flex-col gap-4 rounded-md bg-surface p-16 text-left transition-shadow duration-fast focus:shadow-md"
      >
        <LangSwap k={label} className="text-caption font-medium text-inkMeta" />
        <span className="flex items-center justify-between gap-8">
          {value ? (
            <span className="text-body font-medium text-ink">
              <DateText date={parseDate(value)} />
            </span>
          ) : (
            <LangSwap k={placeholder} className="text-body font-medium text-inkSec" />
          )}
          <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-inkMeta" />
        </span>
      </button>

      {popMounted && (
        <div
          ref={popRef}
          role="dialog"
          aria-label={t(label)}
          aria-hidden={popClosing || undefined}
          // 팝 카드 폭 312px = §19 명세 유도값(셀 40px×7 + 카드 패딩 16×2) · <sm은 필드 폭 추종
          // §34 팝 진입 · 트리거(필드 좌측 하단 전개) 기준 origin-top-left
          className={`pop-panel origin-top-left ${instantPop ? 'pop-instant' : ''} absolute left-0 top-full z-dialog mt-8 w-full rounded-lg bg-white p-16 shadow-md sm:w-[312px] ${popClosing ? 'pop-panel-exit' : ''}`}
        >
          <div className="flex items-center justify-between">
            <IconButton icon={ChevronLeft} label="common.calendar.prevMonth" size={20} onClick={() => move(-1)} />
            <MonthText year={view.year} month={view.month} />
            <IconButton icon={ChevronRight} label="common.calendar.nextMonth" size={20} onClick={() => move(1)} />
          </div>
          <div className="mt-8">
            <CalendarGrid
              year={view.year}
              month={view.month}
              selected={value}
              onSelect={pick}
              minDate={todayStr}
            />
          </div>
        </div>
      )}
    </div>
  );
}
