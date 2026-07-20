// 헤더 v3.2(DESIGN §16.4 · visitkorea 스케일) · 전 라우트 불투명.
// 높이 80(스크롤 64), 로고 22px 700 primary, 메뉴 17px 600 간격 32+.
// 순서: About | Getting Here | Bag Delivery | City Lines(§16.7 표시명).
// 모바일에도 상단 헤더 존재: 로고+LangMenu+로그인만 · 메뉴는 GlassDock 단일 소유(햄버거 금지).
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import IconButton from '../ui/IconButton';
import LangMenu from './LangMenu';

const MENU = [
  { to: '/about', k: 'nav.about' },
  { to: '/gate', k: 'nav.gate' },
  { to: '/hands-free', k: 'nav.handsfree' },
  { to: '/loop', k: 'nav.loop' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { user, login, logout } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 8);
      });
    };
    setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-header transition-all duration-base ease-spring motion-reduce:transition-none ${
        scrolled ? 'h-64 bg-glass shadow-sm backdrop-blur-glass' : 'h-80 bg-white'
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-lg items-center justify-between px-16 md:px-24 lg:px-40 2xl:max-w-2xl 3xl:max-w-3xl">
        <Link
          to="/"
          aria-label={t('nav.home')}
          className="font-display text-logo font-bold tracking-display text-primary"
        >
          Bomnae Helper
        </Link>
        {/* 데스크탑 전용 메뉴 · 모바일 내비는 GlassDock 단일 소유(§16.4) */}
        <nav className="hidden items-center gap-32 lg:flex">
          {MENU.map(({ to, k }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-44 items-center text-menu font-semibold transition-colors duration-fast ${
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
    </header>
  );
}
