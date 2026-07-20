// 모바일 리퀴드 글래스 모핑 필(<lg) — DESIGN §6 + PATTERNS §3.
// blur 예산 2/3, 그림자 예산 1/2. 접힘 56px pill / 확장 시 메뉴+언어+로그인.
// 수축 트리거 4종: 바깥 탭 / 스와이프 다운(Δy>48) / Escape / 라우트 변경.
// 확장은 grid-rows 높이 전환(spring 320ms) — 변형(transform) 확대 금지 준수.
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import { spacing } from '../../tokens';
import { routeKeyFromPath } from '../layout/PageLayout';
import LangToggle from './LangToggle';

const MENU = [
  { to: '/gate', k: 'nav.gate' },
  { to: '/loop', k: 'nav.loop' },
  { to: '/pilot', k: 'nav.pilot' },
];

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

export default function GlassDock() {
  const [open, setOpen] = useState(false);
  const dockRef = useRef(null);
  const touchY = useRef(null);
  const { pathname } = useLocation();
  const { user, login, logout } = useAuth();
  const { t } = useLang();
  const routeKey = routeKeyFromPath(pathname);

  // 수축 트리거: 라우트 변경
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 확장 시 첫 메뉴로 포커스 이동(포커스 트랩 시작점).
  // visibility 전환이 시작되기 전 프레임에는 focus 불가 → double rAF로 전환 시작 이후 실행.
  useEffect(() => {
    if (!open) return undefined;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => dockRef.current?.querySelector('a')?.focus());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (open && e.key === 'Tab') trapTab(e, dockRef.current);
  };

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-dock lg:hidden"
        />
      )}
      <div
        ref={dockRef}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? 'true' : undefined}
        onKeyDown={onKeyDown}
        onTouchStart={(e) => {
          touchY.current = e.touches[0].clientY;
        }}
        onTouchMove={(e) => {
          if (open && touchY.current !== null && e.touches[0].clientY - touchY.current > 48) {
            touchY.current = null;
            setOpen(false);
          }
        }}
        className={`fixed left-1/2 z-dock -translate-x-1/2 overflow-hidden bg-glass shadow-dock backdrop-blur-glass transition-all duration-base ease-spring motion-reduce:transition-none lg:hidden ${
          open ? 'rounded-lg' : 'rounded-pill'
        }`}
        style={{ bottom: `max(${spacing[4]}px, env(safe-area-inset-bottom))` }}
      >
        {/* 접힘 시 visibility로 포커스·접근성 트리에서도 제외(높이 전환과 함께 지연 적용) */}
        <div
          className={`grid transition-[grid-template-rows,visibility] duration-base ease-spring motion-reduce:transition-none ${
            open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <nav className="flex flex-col p-8">
              {MENU.map(({ to, k }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex min-h-44 items-center rounded-md px-16 text-small font-medium transition-colors duration-fast ${
                      isActive ? 'text-primary' : 'text-inkSec hover:text-ink'
                    }`
                  }
                >
                  <LangSwap k={k} />
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center justify-between gap-16 border-t border-line p-8 px-16">
              <LangToggle />
              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="flex min-h-44 items-center gap-8 text-small font-medium text-inkSec"
                >
                  <span className="flex h-32 w-32 items-center justify-center rounded-pill bg-primary text-caption font-semibold text-white">
                    {user.name[0]}
                  </span>
                  <LangSwap k="nav.logout" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={login}
                  className="flex min-h-44 items-center whitespace-nowrap px-8 text-small font-medium text-primary"
                >
                  <LangSwap k="nav.login" />
                </button>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-label={t('nav.menu')}
          onClick={() => setOpen((v) => !v)}
          className="flex h-56 w-full items-center justify-center gap-12 px-20"
        >
          <span className="font-display text-h3 font-bold">Bomnae</span>
          <LangSwap k={`meta.title.${routeKey}`} className="text-small font-medium text-inkSec" />
          <MoreHorizontal size={20} className="text-inkMeta" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}
