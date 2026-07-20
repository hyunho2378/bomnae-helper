// v3.1 언어 드롭다운(DESIGN §6·COMPONENTS 증분 A행) · LangToggle 대체.
// Globe 트리거(44×44) → 메뉴 카드(radius md, shadow md)에 각 언어의 자기 표기 세로 나열.
// 현재 언어 = primary 라벨 + Check. 국기·이모지 금지. 키보드 순회 + Escape.
import { useEffect, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

const LANGS = ['en', 'ko', 'th'];

export default function LangMenu() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  // 바깥 클릭 닫기
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const openMenu = () => {
    setHighlight(LANGS.indexOf(lang));
    setOpen(true);
  };

  const pick = (code) => {
    setLang(code);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % LANGS.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h + LANGS.length - 1) % LANGS.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(LANGS[highlight]);
    }
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.language')}
        title={t('common.language')}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="inline-flex h-44 w-44 items-center justify-center rounded-pill text-inkSec transition-colors duration-fast hover:text-ink"
      >
        <Globe size={20} aria-hidden="true" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t('common.language')}
          className="absolute right-0 top-full z-dialog mt-8 flex w-full min-w-44 flex-col rounded-md bg-white p-8 shadow-md"
          style={{ width: 'max-content' }}
        >
          {LANGS.map((code, i) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={lang === code}
                onClick={() => pick(code)}
                onMouseEnter={() => setHighlight(i)}
                className={`flex min-h-44 w-full items-center justify-between gap-16 rounded-sm px-12 text-small font-medium transition-colors duration-fast ${
                  lang === code ? 'text-primary' : 'text-ink'
                } ${highlight === i ? 'bg-surface' : ''}`}
              >
                {/* 자기 표기는 언어 불변 문자열(전 사전 동일 값) · 시프트 0 */}
                <span>{t(`common.lang.${code}`)}</span>
                {lang === code && <Check size={16} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
