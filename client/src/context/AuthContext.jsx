// [V1] 실 OAuth 기본 · 데모 폐지(DEMO_AUTH 플래그 자체는 보존 — 시연 복귀용).
// user = 서버 /api/me(httpOnly 세션 쿠키) 로드 · login(returnTo) = 서버 OAuth로 전체 이동
// (returnTo는 서버가 HMAC state로 보존 — 클라 쿼리 노출 금지) · logout = POST + 상태 클리어.
// OAuth 복귀(?login=1) 감지 시 journey 'login' 트래킹 1회 발화 후 쿼리 정리.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const DEMO_AUTH = false; // [V1] 기본 false · 시연 복귀 시 true(서버 DEMO_MODE=true와 페어)
const demoUser = { name: 'Demo Traveler', email: 'demo@gts.ac.kr', isAdmin: false };

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEMO_AUTH ? demoUser : null);
  const [ready, setReady] = useState(DEMO_AUTH);
  const loginTracked = useRef(false);

  // 세션 복원 · 실패(서버 다운)해도 게스트로 진행(비차단)
  useEffect(() => {
    if (DEMO_AUTH) return undefined;
    let alive = true;
    fetch(`${API_BASE}/api/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setUser(d.user ?? null);
        setReady(true);
        // OAuth 복귀 마커 → login 트래킹 1회(비차단) + 쿼리 정리
        const url = new URL(window.location.href);
        if (d.user && url.searchParams.get('login') === '1' && !loginTracked.current) {
          loginTracked.current = true;
          url.searchParams.delete('login');
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
          fetch(`${API_BASE}/api/track`, {
            method: 'POST',
            credentials: 'include',
            keepalive: true, // [V6] 로그인 직후 전환에도 생존
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: crypto.randomUUID(),
              step: 'login',
              payload: { email: d.user.email },
              durationMs: null,
            }),
          }).catch(() => console.warn('[track] login 전송 실패(무시)'));
        }
      })
      .catch(() => {
        if (alive) setReady(true); // 서버 부재 — 게스트 유지(플로우 무중단)
      });
    return () => {
      alive = false;
    };
  }, []);

  // [V4] ID/PIN 인증 후 공통 처리 · 성공 시 user 세팅 + login 트래킹 1회(구글 ?login=1과 동형)
  //   returnTo는 SPA 내부라 페이지 이동 없이 호출부가 navigate로 복귀(구글은 전체 이동이라 서버 state 필요).
  const finishIdAuth = async (path, body) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || 'error' };
    setUser(data.user ?? null);
    if (data.user) {
      fetch(`${API_BASE}/api/track`, {
        method: 'POST',
        credentials: 'include',
        keepalive: true, // [V6] 로그인 직후 전환에도 생존
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: crypto.randomUUID(), step: 'login', payload: { username: data.user.username }, durationMs: null }),
      }).catch(() => console.warn('[track] login 전송 실패(무시)'));
    }
    return { ok: true, user: data.user };
  };

  const value = useMemo(
    () => ({
      user,
      ready,
      // returnTo = 내부 경로(서버 state 보존) — OAuth 전체 페이지 이동
      login: (returnTo = window.location.pathname) => {
        if (DEMO_AUTH) {
          setUser(demoUser);
          return;
        }
        window.location.href = `${API_BASE}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
      },
      // [V4] ID/PIN — {ok, error?} 반환(모달이 오류 문구 표시), 성공 시 user 즉시 반영
      loginWithId: (username, pin) => finishIdAuth('/api/auth/login', { username, pin }),
      register: (username, pin, name) => finishIdAuth('/api/auth/register', { username, pin, name }),
      logout: async () => {
        try {
          await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
        } catch {
          /* 서버 부재여도 로컬 상태는 클리어 */
        }
        setUser(null);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
