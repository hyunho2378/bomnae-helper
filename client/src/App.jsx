// 라우터 셸 · ROUTES.md §2 구조 그대로.
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { LangProvider } from './i18n/LangContext';
import Booking from './pages/Booking';
import Gate from './pages/Gate';
import HandsFree from './pages/HandsFree';
import Home from './pages/Home';
import LegalPrivacy from './pages/LegalPrivacy';
import LegalTerms from './pages/LegalTerms';
import LineDetail from './pages/LineDetail';
import Loop from './pages/Loop';
import NotFound from './pages/NotFound';
import Pilot from './pages/Pilot';
import Ticket from './pages/Ticket';

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <BookingProvider>
            <Routes>
              <Route element={<PageLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/gate" element={<Gate />} />
                <Route path="/gate/hands-free" element={<HandsFree />} />
                <Route path="/loop" element={<Loop />} />
                <Route path="/loop/:lineId" element={<LineDetail />} />
                <Route path="/loop/:lineId/book" element={<Booking />} />
                <Route path="/ticket/:bookingId" element={<Ticket />} />
                <Route path="/pilot" element={<Pilot />} />
                <Route path="/legal/privacy" element={<LegalPrivacy />} />
                <Route path="/legal/terms" element={<LegalTerms />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BookingProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
