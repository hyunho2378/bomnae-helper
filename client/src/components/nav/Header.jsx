// 헤더 v3.2(DESIGN §16.4 · visitkorea 스케일) · 전 라우트 불투명.
// 높이 80 고정 — 스크롤 축소·글래스 전환 폐지(사용자 결정). 메뉴 17px 600 간격 32+.
// 순서 v4(IA §9.1): About | Getting Here | Make GTS — Bag Delivery·City Lines 항목 삭제.
// 모바일에도 상단 헤더 존재: 로고+LangMenu+로그인만 · 메뉴는 GlassDock 단일 소유(햄버거 금지).
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import IconButton from '../ui/IconButton';
import LangMenu from './LangMenu';
import LogoMark from '../../assets/logo-mark.svg?react';

const MENU = [
  { to: '/about', k: 'nav.about' },
  { to: '/gate', k: 'nav.gate' },
  { to: '/gts', k: 'nav.gts' },
  { to: '/reviews', k: 'nav.reviews' },
];

export default function Header() {
  const { user, login, logout } = useAuth();
  const { t } = useLang();
  // §35 스크롤 엣지 페이드 표시용 boolean · 헤더 치수는 스크롤과 무관하게 80px 고정(사용자 결정 유지)
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // scroll 이벤트는 브라우저가 프레임당 병합 · boolean 비교라 rAF 스로틀 불필요
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    // §18.1: <lg 모바일 컴팩트 헤더 56(메뉴 없음 · Dock이 내비 소유) / lg+ 풀 헤더 80
    <header className="chrome fixed inset-x-0 top-0 z-header h-56 lg:h-80">
      <div className="mx-auto flex h-full w-full max-w-lg items-center justify-between px-16 md:px-24 lg:px-40 2xl:max-w-2xl 3xl:max-w-3xl">
        <Link to="/" aria-label={t('nav.home')} className="flex items-center gap-8">
          <LogoMark className="h-24 w-24 shrink-0 text-primary" aria-hidden="true" />
          {/* 모바일은 심볼만 — 워드마크 22px가 375px 폭 초과(사용자 결정) */}
          {/* 워드마크는 ink 단색 — 이니셜 색 분기 폐지(사용자 결정) */}
          <span className="hidden whitespace-nowrap font-display text-logo font-semibold tracking-display text-ink lg:inline">
            Global Tourism System
          </span>
        </Link>
        {/* 데스크탑 전용 메뉴 · 모바일 내비는 GlassDock 단일 소유(§16.4) */}
        <nav className="hidden items-center gap-32 lg:flex">
          {MENU.map(({ to, k }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-44 items-center text-menu font-semibold tracking-glass transition-colors duration-fast ${
                  isActive ? 'text-primary' : 'text-ink hover:text-primary'
                }`
              }
            >
              <LangSwap k={k} />
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-8">
          <LangMenu />
          {user ? (
            <button
              type="button"
              onClick={logout}
              aria-label={t('nav.logout')}
              title={t('nav.logout')}
              className="flex h-44 w-44 items-center justify-center"
            >
              <span className="flex h-32 w-32 items-center justify-center rounded-pill bg-primary text-small font-semibold text-white">
                {user.name[0]}
              </span>
            </button>
          ) : (
            <IconButton icon={User} label="nav.login" size={20} onClick={login} />
          )}
        </div>
      </div>
      {/* §35 스크롤 엣지 페이드 · 콘텐츠와 겹칠 때만(스크롤 0 비표시), 1px 경계선 금지 유지 */}
      <div
        aria-hidden="true"
        className={`chrome-fade pointer-events-none absolute inset-x-0 top-full h-12 transition-opacity duration-fast ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </header>
  );
}
