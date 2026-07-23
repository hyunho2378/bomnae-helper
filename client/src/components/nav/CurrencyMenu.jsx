// [V12] 통화 드롭다운 · 헤더 언어 선택(LangMenu) 옆. 문법·팝오버 거동은 LangMenu 준용.
//   트리거 = 현재 통화 코드 · 메뉴 = 지원 통화(기호+코드) 세로 나열, 현재값 primary + Check.
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { CURRENCY_ORDER, CURRENCY_SYMBOL, useCurrency } from '../../context/CurrencyContext';
import usePopExit from '../ui/usePopExit';

export default function CurrencyMenu() {
  const { t } = useLang();
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [instantPop, setInstantPop] = useState(false);
  const { mounted: popMounted, closing: popClosing } = usePopExit(open, instantPop);
  const [highlight, setHighlight] = useState(0);
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

  const openMenu = () => {
    setHighlight(Math.max(0, CURRENCY_ORDER.indexOf(currency)));
    setOpen(true);
  };

  const pick = (code, viaKeyboard = false) => {
    setCurrency(code);
    setInstantPop(viaKeyboard);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setInstantPop(true);
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % CURRENCY_ORDER.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h + CURRENCY_ORDER.length - 1) % CURRENCY_ORDER.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(CURRENCY_ORDER[highlight], true);
    }
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.money.label')}
        title={t('common.money.label')}
        onClick={(e) => {
          setInstantPop(e.detail === 0);
          if (open) setOpen(false);
          else openMenu();
        }}
        className="inline-flex h-44 min-w-44 items-center justify-center rounded-pill px-8 font-display text-small font-semibold text-inkSec transition-colors duration-fast hover:text-ink"
      >
        {currency}
      </button>
      {popMounted && (
        <ul
          role="listbox"
          aria-label={t('common.money.label')}
          aria-hidden={popClosing || undefined}
          className={`pop-panel origin-top-right ${instantPop ? 'pop-instant' : ''} absolute right-0 top-full z-dialog mt-8 flex flex-col rounded-md bg-white p-8 shadow-md ${popClosing ? 'pop-panel-exit' : ''}`}
          style={{ width: 'max-content' }}
        >
          {CURRENCY_ORDER.map((code, i) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={currency === code}
                onClick={(e) => pick(code, e.detail === 0)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex min-h-44 w-full items-center justify-between gap-16 rounded-sm px-12 text-small font-medium transition-colors duration-fast ${
                  currency === code ? 'text-primary' : 'text-ink'
                } ${highlight === i ? 'bg-surface' : ''}`}
              >
                <span className="flex items-center gap-8">
                  <span className="w-16 text-inkMeta">{CURRENCY_SYMBOL[code]}</span>
                  <span className="font-display font-semibold">{code}</span>
                </span>
                {currency === code && <Check size={16} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
