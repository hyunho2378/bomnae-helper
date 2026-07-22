// 라우터 셸 v4 · IA §9.1 — /gts 4단계 신설, 구 loop 계열 라우트 제거(파일은 DEPRECATED 보존).
// 리다이렉트: /loop* → /gts(=setup), /hands-free·/gate/hands-free → /gts/setup, /pilot → /about.
// GtsProvider 전역 배선(§31 — 스텝 상태는 라우트 이동에도 유지, 새로고침 시 setup부터).
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import RequireAuth from './components/ui/RequireAuth'; // [V1]
import { ArrivalProvider } from './context/ArrivalContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { GtsProvider } from './context/GtsContext';
import { LangProvider } from './i18n/LangContext';
import About from './pages/About';
import Gate from './pages/Gate';
import GtsBuild from './pages/GtsBuild';
import GtsCheckout from './pages/GtsCheckout';
import GtsRoute from './pages/GtsRoute';
import GtsSetup from './pages/GtsSetup';
import Home from './pages/Home';
import LegalPrivacy from './pages/LegalPrivacy';
import LegalTerms from './pages/LegalTerms';
import NotFound from './pages/NotFound';
import AdminPage from './pages/AdminPage'; // [V1] 헤더 링크 없음 · 직접 URL 진입만
import Reviews from './pages/Reviews';
import Ticket from './pages/Ticket';

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <BookingProvider>
            <ArrivalProvider>
              <GtsProvider>
                <Routes>
                  <Route element={<PageLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/gate" element={<Gate />} />
                    {/* /gts = setup(IA §9.1 "(=setup)") · /gts/setup도 동일 화면 정식 경로 */}
                    <Route path="/gts" element={<RequireAuth><GtsSetup /></RequireAuth>} />
                    <Route path="/gts/setup" element={<RequireAuth><GtsSetup /></RequireAuth>} />
                    <Route path="/gts/build" element={<RequireAuth><GtsBuild /></RequireAuth>} />
                    <Route path="/gts/route" element={<RequireAuth><GtsRoute /></RequireAuth>} />
                    <Route path="/gts/checkout" element={<RequireAuth><GtsCheckout /></RequireAuth>} />
                    <Route path="/ticket/:bookingId" element={<Ticket />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/legal/privacy" element={<LegalPrivacy />} />
                    <Route path="/legal/terms" element={<LegalTerms />} />
                    {/* v4 리다이렉트 · 구 링크 생존(§9.1) */}
                    <Route path="/loop/*" element={<Navigate to="/gts" replace />} />
                    <Route path="/hands-free" element={<Navigate to="/gts/setup" replace />} />
                    <Route path="/gate/hands-free" element={<Navigate to="/gts/setup" replace />} />
                    <Route path="/pilot" element={<Navigate to="/about" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </GtsProvider>
            </ArrivalProvider>
          </BookingProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
