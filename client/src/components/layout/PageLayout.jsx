// 셸 · Header + Outlet + GlassDock(<lg) + Footer. /loop만 Footer 숨김(ROUTES §2 분기 1곳 허용).
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import Footer from '../nav/Footer';
import GlassDock from '../nav/GlassDock';
import Header from '../nav/Header';

// pathname → meta.title 키 (ROUTES §1 라우트 테이블 기준). GlassDock 현재 페이지명도 사용.
export function routeKeyFromPath(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/gate') return 'gate';
  if (pathname === '/hands-free' || pathname === '/gate/hands-free') return 'handsfree';
  if (pathname === '/loop') return 'loop';
  if (/^\/loop\/[^/]+\/book\/?$/.test(pathname)) return 'booking';
  if (/^\/loop\/[^/]+\/?$/.test(pathname)) return 'lineDetail';
  if (pathname.startsWith('/ticket/')) return 'ticket';
  if (pathname === '/about' || pathname === '/pilot') return 'about';
  if (pathname === '/legal/privacy') return 'legalPrivacy';
  if (pathname === '/legal/terms') return 'legalTerms';
  return 'notFound';
}

export default function PageLayout() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const routeKey = routeKeyFromPath(pathname);
  const hideFooter = pathname === '/loop';

  // 페이지 title · "Bomnae Helper · {meta.title.*}" (ROUTES §4)
  useEffect(() => {
    document.title = `Bomnae Helper · ${t(`meta.title.${routeKey}`)}`;
  }, [routeKey, t]);

  // 라우트 변경 시 스크롤 top 복원 (ROUTES §4)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      <main className="relative z-content pb-96 lg:pb-0">
        <Outlet />
      </main>
      <GlassDock />
      {!hideFooter && <Footer />}
    </>
  );
}
