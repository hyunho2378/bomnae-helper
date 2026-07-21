// 모바일 모달리티 · DESIGN §7 + §36 시트 제스처 물리(v4.1).
// 드래그 1:1(잡은 오프셋 존중) · 상단 러버밴드 · 릴리즈 = 모멘텀 투영 스냅 + 속도 인계 스프링(motion)
// · 애니메이션 중 재터치 인터럽트(현재 표시값 재시작) · reduced-motion은 릴리즈 크로스페이드.
// blur 예산 3/3, 그림자 예산 2/2, 그랩바, 바깥 탭·Escape 닫기, 포커스 트랩. <lg 전용.
import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';
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

// §36 기준 구현: 모멘텀 투영(릴리즈 속도로 목적지 추정) · 상단 경계 러버밴드
const project = (v, d = 0.998) => ((v / 1000) * d) / (1 - d);
const rubber = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 현재 표시 중인 translateY(px) — 재터치 인터럽트의 재시작 기준값(§36)
const currentY = (el) => {
  const t = getComputedStyle(el).transform;
  if (!t || t === 'none') return 0;
  const m = t.match(/matrix\(([^)]+)\)/);
  return m ? parseFloat(m[1].split(',')[5]) : 0;
};

export default function BottomSheet({ open, onClose, title, children }) {
  const panelRef = useRef(null);
  const [shown, setShown] = useState(false);
  const drag = useRef(null); // { pointerId, grabY, baseY, lastY, lastT, vy }
  const anim = useRef(null);

  useEffect(() => {
    if (!open) {
      setShown(false);
      return undefined;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    panelRef.current?.focus();
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => () => anim.current?.stop(), []);

  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
      return;
    }
    if (e.key === 'Tab') trapTab(e, panelRef.current);
  };

  const settleOpen = (el) => {
    el.style.transform = '';
    el.style.transition = '';
  };

  const dismiss = (el, vy) => {
    const h = el.offsetHeight;
    if (reduceMotion()) {
      // §36 reduced-motion: 릴리즈 애니메이션은 크로스페이드 대체
      anim.current = animate(el, { opacity: 0 }, { duration: 0.16, easing: 'ease-out' });
      anim.current.finished.then(() => onClose?.());
      return;
    }
    anim.current = animate(
      el,
      { y: h },
      { type: 'spring', bounce: 0, duration: 0.4, velocity: vy },
    );
    anim.current.finished.then(() => onClose?.()).catch(() => {});
  };

  const onPointerDown = (e) => {
    // 인터랙티브 요소에서 시작한 제스처는 드래그로 뺏지 않는다
    if (e.target.closest('a, button, input, textarea, select, [role="listbox"]')) return;
    const el = panelRef.current;
    anim.current?.stop(); // §36 재터치 인터럽트 · 현재 표시값에서 재개(잠금 금지)
    const baseY = currentY(el);
    el.style.transition = 'none';
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* 캡처 미지원 포인터(합성 이벤트 등) · 드래그는 계속 */
    }
    drag.current = { pointerId: e.pointerId, grabY: e.clientY, baseY, lastY: e.clientY, lastT: e.timeStamp, vy: 0 };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const el = panelRef.current;
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) {
      d.vy = ((e.clientY - d.lastY) / dt) * 1000; // px/s · 최근 이력 기반(§36)
      d.lastY = e.clientY;
      d.lastT = e.timeStamp;
    }
    let y = d.baseY + (e.clientY - d.grabY); // 잡은 지점 오프셋 존중 · 1:1
    if (y < 0) y = rubber(y, el.offsetHeight); // 상단 경계 러버밴드(하드스톱 금지)
    el.style.transform = `translateY(${y}px)`;
  };

  const onPointerUp = (e) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.pointerId) return;
    drag.current = null;
    const el = panelRef.current;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* 캡처 없이 종료된 포인터 무시 */
    }
    const y = currentY(el);
    const h = el.offsetHeight;
    // §36: 속도 부호·모멘텀 투영으로 목적지, 최근접 스냅
    const dest = y + project(d.vy);
    const closing = dest > h * 0.5;
    if (closing) {
      dismiss(el, d.vy);
      return;
    }
    if (reduceMotion()) {
      settleOpen(el);
      return;
    }
    anim.current = animate(
      el,
      { y: 0 },
      { type: 'spring', bounce: 0.15, duration: 0.4, velocity: d.vy },
    );
    anim.current.finished.then(() => settleOpen(el)).catch(() => {});
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`absolute inset-x-0 bottom-0 touch-none rounded-t-xl bg-glass shadow-sheet backdrop-blur-glass transition-transform duration-sheet ease-drawer motion-reduce:transition-none ${
          shown ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mt-8 h-4 w-32 rounded-pill bg-line" aria-hidden="true" />
        <div
          className="touch-auto p-24"
          style={{ paddingBottom: `max(${spacing[6]}px, env(safe-area-inset-bottom))` }}
        >
          {title && <LangSwap k={title} as="h2" className="text-h3 font-semibold" />}
          <div className="mt-16">{children}</div>
        </div>
      </div>
    </div>
  );
}
