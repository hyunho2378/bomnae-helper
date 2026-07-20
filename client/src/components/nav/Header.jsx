// 데스크탑 헤더(lg+) · DESIGN §6 v3.1: 메뉴 4(Gate/Loop/Hands-Free/About), 라벨 600,
// 액티브 = primary 컬러 텍스트(언더라인·인디케이터 금지), 항상 불투명면(투명 금지),
// 스크롤 시 glass + 56px 수축(PATTERNS §2, rAF 스로틀). 로고는 primary 단색.
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import IconButton from '../ui/IconButton';
import LangMenu from './LangMenu';

const MENU = [
  { to: '/gate', k: 'nav.gate' },
  { to: '/loop', k: 'nav.loop' },
  { to: '/hands-free', k: 'nav.handsfree' },
  { to: '/about', k: 'nav.about' },
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
      className={`fixed inset-x-0 top-0 z-header hidden transition-all duration-base ease-spring motion-reduce:transition-none lg:block ${
        scrolled ? 'h-56 bg-glass shadow-sm backdrop-blur-glass' : 'h-72 bg-white'
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-lg items-center justify-between px-48 2xl:max-w-2xl 3xl:max-w-3xl">
        <Link
          to="/"
          aria-label={t('nav.home')}
          className="font-display text-h3 font-bold tracking-display text-primary"
        >
          Bomnae Helper
        </Link>
        <nav className="flex items-center gap-24">
          {MENU.map(({ to, k }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-44 items-center text-small font-semibold transition-colors duration-fast ${
                  isActive ? 'text-primary' : 'text-inkSec hover:text-ink'
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
