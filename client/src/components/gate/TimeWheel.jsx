// TimeWheel · v4.2 존 B5(IA §10.3, PATTERNS §38): 애플 시계식 시각 휠 · 30분 스텝 FieldSelect 대체.
// 시(0~23)·분(00~59, 1단위) 2컬럼 · 뷰포트 180px·항목 40px scroll-snap center(§38 명세값 · 인라인 허용 예외)
// · 중앙 밴드 하이라이트(surface 면 + 선택 텍스트 700) · 상·하 페이드 마스크(§17.4 chrome-fade 선례의
// 기능 마스크) · 확정 = scrollend(미지원 시 scroll 100ms 디바운스) 중앙 항목 · 키보드 ↑↓는 §17.1
// 키보드 개시 무애니메이션(즉시 scrollTo) · role="listbox"/option · 디폴트는 부모(GateForm)가
// kstNowParts(Asia/Seoul 현재)로 주입 · reduced-motion: 스냅 유지(사용자 구동 스크롤이라 허용 · §38).
// props: { value: {h, m}, onChange({h, m}) }.
import { useEffect, useId, useRef } from 'react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';

const ITEM_PX = 40; // §38 명세값 · 항목 높이
const VIEW_PX = 180; // §38 명세값 · 뷰포트 높이
const PAD_PX = (VIEW_PX - ITEM_PX) / 2; // 중앙 정렬 상하 패딩
const RANGE = { h: 24, m: 60 };
// §38 상·하 페이드 마스크 · 중앙 밴드로 갈수록 선명
const MASK = 'linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent)';

const pad2 = (n) => String(n).padStart(2, '0');

function WheelColumn({ unit, value, onChange, labelKey }) {
  const { t } = useLang();
  const id = useId(); // 폼 2인스턴스(To/From) 공존 · option id 충돌 방지
  const listRef = useRef(null);
  const debounce = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;

  const count = RANGE[unit];

  // 마운트 시 현재 값(KST 현재)으로 즉시 정렬 · 진입 애니메이션 없음
  useEffect(() => {
    listRef.current?.scrollTo({ top: value * ITEM_PX });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스크롤 종료 확정 · scrollend 지원 시 그대로, 미지원 시 100ms 디바운스(§38)
  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    const confirmCenter = () => {
      const idx = Math.min(count - 1, Math.max(0, Math.round(el.scrollTop / ITEM_PX)));
      if (idx !== valueRef.current) onChange(idx);
    };
    const onScroll = () => {
      clearTimeout(debounce.current);
      debounce.current = setTimeout(confirmCenter, 100);
    };
    const useScrollEnd = 'onscrollend' in el;
    const type = useScrollEnd ? 'scrollend' : 'scroll';
    const handler = useScrollEnd ? confirmCenter : onScroll;
    el.addEventListener(type, handler);
    return () => {
      clearTimeout(debounce.current);
      el.removeEventListener(type, handler);
    };
  }, [count, onChange]);

  // 키보드 ↑↓ · §17.1 키보드 개시 동작은 무애니메이션 · 즉시 scrollTo + 값 확정
  const onKeyDown = (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const next = (valueRef.current + (e.key === 'ArrowDown' ? 1 : count - 1)) % count;
    onChange(next);
    listRef.current?.scrollTo({ top: next * ITEM_PX });
  };

  // 탭·클릭 선택 · 포인터 개시라 스무스 허용, reduced-motion은 즉시
  const pick = (n) => {
    onChange(n);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    listRef.current?.scrollTo({ top: n * ITEM_PX, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <div
      ref={listRef}
      role="listbox"
      tabIndex={0}
      aria-label={t(labelKey)}
      aria-activedescendant={`${id}-${value}`}
      onKeyDown={onKeyDown}
      className="scroll-quiet w-full overflow-y-auto"
      style={{
        height: VIEW_PX,
        scrollSnapType: 'y mandatory',
        maskImage: MASK,
        WebkitMaskImage: MASK,
      }}
    >
      <ul style={{ paddingBlock: PAD_PX }}>
        {Array.from({ length: count }, (_, n) => (
          <li
            key={n}
            id={`${id}-${n}`}
            role="option"
            aria-selected={n === value}
            onClick={() => pick(n)}
            style={{ height: ITEM_PX, scrollSnapAlign: 'center' }}
            // 선택(중앙) 항목 700 · 그 외 500(§38 중앙 밴드 하이라이트의 텍스트 규칙)
            className={`flex cursor-pointer items-center justify-center font-display text-body ${
              n === value ? 'font-bold text-ink' : 'font-medium text-inkSec'
            }`}
          >
            {pad2(n)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TimeWheel({ value, onChange }) {
  return (
    <div>
      <LangSwap k="gate.planner.form.time" className="text-caption font-medium text-inkMeta" />
      {/* 휠 폭 = CalendarField 팝 카드 선례(sm 312px 고정 · <sm 필드 폭 추종) */}
      <div className="relative mt-4 w-full sm:w-[312px]">
        {/* §38 중앙 밴드 하이라이트 · surface 면 · 콘텐츠 아래 레이어 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-md bg-surface"
          style={{ height: ITEM_PX }}
        />
        <div className="relative grid grid-cols-2">
          <WheelColumn
            unit="h"
            value={value.h}
            onChange={(h) => onChange({ ...value, h })}
            labelKey="gate.planner.wheel.hours"
          />
          <WheelColumn
            unit="m"
            value={value.m}
            onChange={(m) => onChange({ ...value, m })}
            labelKey="gate.planner.wheel.minutes"
          />
        </div>
      </div>
    </div>
  );
}
