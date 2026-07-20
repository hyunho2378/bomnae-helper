// 모바일 모달리티 — DESIGN §7: 위로 슬라이드, blur 예산 3/3, 그림자 예산 2/2,
// 그랩바, 스와이프 다운(Δy>48)·바깥 탭·Escape 닫기, 포커스 트랩. <lg 전용.
import { useEffect, useRef, useState } from 'react';
import LangSwap from '../../i18n/LangSwap';
import { spacing } from '../../tokens';

const trapTab = (e, root) => {
  const els = root.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!els.length) return;
  const first = els[0];
  const last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
};

export default function BottomSheet({ open, onClose, title, children }) {
  const panelRef = useRef(null);
  const touchY = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return undefined;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    panelRef.current?.focus();
    return () => cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
      return;
    }
    if (e.key === 'Tab') trapTab(e, panelRef.current);
  };

  return (
    <div className="fixed inset-0 z-sheet lg:hidden">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onTouchStart={(e) => {
          touchY.current = e.touches[0].clientY;
        }}
        onTouchMove={(e) => {
          if (touchY.current !== null && e.touches[0].clientY - touchY.current > 48) {
            touchY.current = null;
            onClose?.();
          }
        }}
        className={`absolute inset-x-0 bottom-0 rounded-t-lg bg-glass shadow-sheet backdrop-blur-glass transition-transform duration-base ease-spring motion-reduce:transition-none ${
          shown ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mt-8 h-4 w-32 rounded-pill bg-line" aria-hidden="true" />
        <div
          className="p-24"
          style={{ paddingBottom: `max(${spacing[6]}px, env(safe-area-inset-bottom))` }}
        >
          {title && <LangSwap k={title} as="h2" className="text-h3 font-semibold" />}
          <div className="mt-16">{children}</div>
        </div>
      </div>
    </div>
  );
}
