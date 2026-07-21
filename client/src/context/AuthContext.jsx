import { createContext, useContext, useMemo, useState } from 'react';

// PHASE 1 목 구현 · PHASE 3에서 서버 연동으로 내부만 교체(인터페이스 불변, COMPONENTS A1).
// v4.2(§10.6): 기본 상태 = 데모 유저 로그인됨 — 로그인 게이트 전부 통과.
// 실 OAuth 복원 시 DEMO_AUTH=false 로 되돌리면 초기 비로그인 + 게이트 동작 복구.
const DEMO_AUTH = true;
const demoUser = { name: 'Demo Traveler', email: 'demo@gts.ac.kr' };

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEMO_AUTH ? demoUser : null);

  const value = useMemo(
    () => ({
      user,
      login: () => setUser(DEMO_AUTH ? demoUser : { name: 'Guest', email: 'guest@bomnae.example' }),
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
