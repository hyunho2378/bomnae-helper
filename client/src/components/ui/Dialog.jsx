// 데스크탑 모달리티 — DESIGN §7: 중앙 Dialog, max-width 560, BottomSheet과 동일 glass 면.
// lg+ 전용. Escape·바깥 탭 닫기 + 닫기 IconButton + 포커스 트랩.
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import IconButton from './IconButton';

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

export default function Dialog({ open, onClose, title, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (open) panelRef.current?.focus();
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
    <div className="fixed inset-0 z-dialog hidden place-items-center lg:grid">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="relative w-full max-w-dialog rounded-lg bg-glass p-32 shadow-sheet backdrop-blur-glass"
      >
        <div className="absolute right-8 top-8">
          <IconButton icon={X} label="common.close" size={20} onClick={onClose} />
        </div>
        {title && <LangSwap k={title} as="h2" className="text-h3 font-semibold" />}
        <div className="mt-16">{children}</div>
      </div>
    </div>
  );
}
