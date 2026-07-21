// TimeField · [H2-5] 시간 필드 = FieldSelect 문법 닫힘 상태(값 = 현재 KST 디폴트 HH:MM) +
// 클릭 시에만 TimeWheel(§38) 팝 카드. 열릴 때 휠은 현재 선택 시각 위치에서 시작(TimeWheel 내장).
// CalendarField 팝 구조 동형(§34 pop-panel·usePopExit·키보드 무애니메이션 §17.1).
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import usePopExit from '../ui/usePopExit';
import LangSwap from '../../i18n/LangSwap';
import TimeWheel from './TimeWheel';

const pad2 = (n) => String(n).padStart(2, '0');

export default function TimeField({ label, value, onChange }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [instantPop, setInstantPop] = useState(false);
  const { mounted: popMounted, closing: popClosing } = usePopExit(open, instantPop);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setInstantPop(true); // §17.1 키보드 개시 무애니메이션
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      {/* [H2-6] compact 트리거 · 라벨 좌 caption / 값 우측 정렬 */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(e) => {
          setInstantPop(e.detail === 0);
          setOpen((v) => !v);
        }}
        className="flex h-48 w-full items-center justify-between gap-12 rounded-md bg-surface px-16 text-left transition-shadow duration-fast focus:shadow-md"
      >
        <LangSwap k={label} className="shrink-0 text-caption font-medium text-inkMeta" />
        <span className="flex min-w-0 items-center gap-8">
          <span className="font-display text-body font-semibold text-ink">
            {pad2(value.h)}:{pad2(value.m)}
          </span>
          <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-inkMeta" />
        </span>
      </button>

      {popMounted && (
        <div
          role="dialog"
          aria-label={t(label)}
          aria-hidden={popClosing || undefined}
          className={`pop-panel origin-top-left ${instantPop ? 'pop-instant' : ''} absolute left-0 top-full z-dialog mt-8 w-full rounded-lg bg-white p-16 shadow-md sm:w-[312px] ${popClosing ? 'pop-panel-exit' : ''}`}
        >
          <TimeWheel value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
