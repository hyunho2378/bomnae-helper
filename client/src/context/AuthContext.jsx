import { createContext, useContext, useMemo, useState } from 'react';

// PHASE 1 목 구현 — PHASE 3에서 서버 연동으로 내부만 교체(인터페이스 불변, COMPONENTS A1).
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      login: () => setUser({ name: 'Bomnae Guest', email: 'guest@bomnae.example' }),
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
