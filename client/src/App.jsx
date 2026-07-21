// 라우터 셸 · ROUTES.md §2 v3.1 구조 그대로(v3.2 라우트 신설 없음).
// /hands-free·/about 승격, /pilot·/gate/hands-free는 replace 리다이렉트(구 링크 생존).
// v3.2: ArrivalProvider 전역 배선(§8.5 도착 감지 · 라우트 이동에도 상태 유지 · IA §8.5, PATTERNS §21).
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import { ArrivalProvider } from './context/ArrivalContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { LangProvider } from './i18n/LangContext';
import About from './pages/About';
import Booking from './pages/Booking';
import Gate from './pages/Gate';
import HandsFree from './pages/HandsFree';
import Home from './pages/Home';
import LegalPrivacy from './pages/LegalPrivacy';
import LegalTerms from './pages/LegalTerms';
import LineDetail from './pages/LineDetail';
import Loop from './pages/Loop';
import NotFound from './pages/NotFound';
import Ticket from './pages/Ticket';

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <BookingProvider>
            <ArrivalProvider>
              <Routes>
              <Route element={<PageLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/gate" element={<Gate />} />
                <Route path="/hands-free" element={<HandsFree />} />
                <Route path="/loop" element={<Loop />} />
                <Route path="/loop/:lineId" element={<LineDetail />} />
                <Route path="/loop/:lineId/book" element={<Booking />} />
                <Route path="/ticket/:bookingId" element={<Ticket />} />
                <Route path="/about" element={<About />} />
                <Route path="/legal/privacy" element={<LegalPrivacy />} />
                <Route path="/legal/terms" element={<LegalTerms />} />
                <Route path="/pilot" element={<Navigate to="/about" replace />} />
                <Route path="/gate/hands-free" element={<Navigate to="/hands-free" replace />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              </Routes>
            </ArrivalProvider>
          </BookingProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
