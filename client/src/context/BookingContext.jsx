import { createContext, useContext, useMemo, useState } from 'react';

// 게스트 예약 초안 in-memory · 웹스토리지 금지(DESIGN §15). 새로고침 시 소실은 명세 허용(IA §2.6).
const emptyDraft = { lineId: null, date: null, time: null, adults: 1, children: 0 };

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [draft, setDraft] = useState(emptyDraft);

  const value = useMemo(
    () => ({ draft, setDraft, reset: () => setDraft(emptyDraft) }),
    [draft],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  return useContext(BookingContext);
}
