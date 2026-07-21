// 셸 · Header + Outlet + GlassDock(<lg) + Footer. /loop만 Footer 숨김(ROUTES §2 분기 1곳 허용).
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import Footer from '../nav/Footer';
import GlassDock from '../nav/GlassDock';
import Header from '../nav/Header';

// pathname → meta.title 키 (v4 라우트 기준 · 구 loop 분기는 리다이렉트 경유라 잔존 무해).
export function routeKeyFromPath(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/gate') return 'gate';
  if (pathname === '/gts' || pathname === '/gts/setup') return 'gtsSetup';
  if (pathname === '/gts/build') return 'gtsBuild';
  if (pathname === '/gts/route') return 'gtsRoute';
  if (pathname === '/gts/checkout') return 'gtsCheckout';
  if (pathname === '/hands-free' || pathname === '/gate/hands-free') return 'handsfree';
  if (pathname === '/loop') return 'loop';
  if (/^\/loop\/[^/]+\/book\/?$/.test(pathname)) return 'booking';
  if (/^\/loop\/[^/]+\/?$/.test(pathname)) return 'lineDetail';
  if (pathname.startsWith('/ticket/')) return 'ticket';
  if (pathname === '/reviews') return 'reviews';
  if (pathname === '/about' || pathname === '/pilot') return 'about';
  if (pathname === '/legal/privacy') return 'legalPrivacy';
  if (pathname === '/legal/terms') return 'legalTerms';
  return 'notFound';
}

export default function PageLayout() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const routeKey = routeKeyFromPath(pathname);
  // v4: /loop 퇴역으로 Footer 숨김 대상 없음(분기 메커니즘은 보존 — BUILDER가 §9.5에서 필요 시 보고 후 사용)
  const hideFooter = false;

  // 페이지 title · "Global Tourism System · {meta.title.*}" (ROUTES §4)
  useEffect(() => {
    document.title = `Global Tourism System · ${t(`meta.title.${routeKey}`)}`;
  }, [routeKey, t]);

  // [H2-3] 라우트 변경 시 항상 최상단(결제→티켓 replace 포함) · 해시 앵커(#proof) 이동만 예외
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header />
      {/* [H2-4] 짧은 페이지 푸터 밀어내기 · 헤더는 fixed(문서 공간 미점유)라 main이 top 0부터
          시작 — min-height 100dvh로 푸터를 첫 화면 밖으로 민다 */}
      <main className="relative z-content min-h-[100dvh] pb-96 lg:pb-0">
        <Outlet />
      </main>
      <GlassDock />
      {!hideFooter && <Footer />}
    </>
  );
}
