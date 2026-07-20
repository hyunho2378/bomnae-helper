// 데스크탑 헤더(lg+) — DESIGN §6 + PATTERNS §2: 초기 72px 투명 → 스크롤 시
// glass(blur 예산 1/3) + 56px 수축, 320ms spring. rAF 스로틀, reduced-motion 즉시.
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import IconButton from '../ui/IconButton';
import LangToggle from './LangToggle';

const MENU = [
  { to: '/gate', k: 'nav.gate' },
  { to: '/loop', k: 'nav.loop' },
  { to: '/pilot', k: 'nav.pilot' },
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
        scrolled ? 'h-56 border-b border-line bg-glass backdrop-blur-glass' : 'h-72 bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-lg items-center justify-between px-48 2xl:max-w-2xl 3xl:max-w-3xl">
        <Link to="/" aria-label={t('nav.home')} className="font-display text-h3 font-bold tracking-display">
          Bomnae Helper
        </Link>
        <nav className="flex items-center gap-24">
          {MENU.map(({ to, k }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-44 items-center border-b-2 text-small font-medium transition-colors duration-fast ${
                  isActive ? 'border-primary text-ink' : 'border-transparent text-inkSec hover:text-ink'
                }`
              }
            >
              <LangSwap k={k} />
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-16">
          <LangToggle />
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
