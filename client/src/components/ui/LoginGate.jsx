// [V10] 로그인 모달 개편:
//   버튼 순서 = [ID/PW 폼 → 주 버튼(Log in / Create account) → 구분선 → Continue with Google].
//     구글은 항상 주 버튼 아래(두 탭 동일).
//   Sign Up: ID는 이메일 형식 필수(정규식 · 오류 3언어) + 비밀번호 규칙(6자+숫자+특수) 실시간 인라인 검증.
//   탭 전환 시 모달 높이 뚝 변화 방지 → 콘텐츠 높이를 ResizeObserver로 추적, 래퍼 height 보간(§17 easeOut).
// [V4] 계약 유지: register(email,pin,name)/loginWithId(email|id,pin) — 서버가 이메일·레거시 username 모두 매칭.
import { useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import { motion } from '../../tokens';
import { EMAIL_RE, pwValid } from '../../lib/authRules';
import LogoMark from '../../assets/logo-mark.svg?react';
import Button from './Button';
import Modal from './Modal';
import PwChecklist from './PwChecklist';

// 구글 G 로고 표준 4색 SVG(브랜드 가이드 경로 · 인라인)
function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// 클라 선검증 규칙(EMAIL_RE·pwValid) = 서버(auth.js)와 동일 · lib/authRules 단일 출처.
const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 라벨 위 입력 · surface 면 focus 링. hintKey 있으면 아래 캡션.
function Field({ id, labelKey, hintKey, type = 'text', value, onChange, autoComplete }) {
  const { t } = useLang();
  return (
    <label htmlFor={id} className="flex flex-col gap-4 text-left">
      <LangSwap k={labelKey} as="span" className="text-caption font-semibold uppercase tracking-eyebrow text-inkMeta" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={t(`${labelKey}Ph`)}
        className="h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary"
      />
      {hintKey && <LangSwap k={hintKey} className="text-caption font-medium text-inkMeta" />}
    </label>
  );
}

export default function LoginGate({ open, onClose, returnTo = '/' }) {
  const { login, loginWithId, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [errorKey, setErrorKey] = useState(null);
  const [busy, setBusy] = useState(false);

  // 탭 전환 시 높이 뚝 변화 방지 · 콘텐츠 실측 높이를 래퍼 height로 보간
  const contentRef = useRef(null);
  const [wrapH, setWrapH] = useState(null);
  const reduced = prefersReduced();
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el || reduced) return undefined;
    const sync = () => setWrapH(el.scrollHeight);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduced]);

  const switchTab = (next) => {
    setTab(next);
    setErrorKey(null);
  };

  const ERROR_KEYS = {
    invalid_credentials: 'common.loginGate.errInvalid',
    email_taken: 'common.loginGate.errEmailTaken',
    bad_email: 'common.loginGate.errEmail',
    bad_pin: 'common.loginGate.errPin',
  };

  const emailError = tab === 'signup' && username.length > 0 && !EMAIL_RE.test(username);
  const signupReady = EMAIL_RE.test(username) && pwValid(pin);

  const submit = async (e) => {
    e.preventDefault();
    setErrorKey(null);
    // Sign Up만 형식 강제(서버와 동일 규칙) · Log In은 서버 일반 오류에 위임(레거시 계정 허용)
    if (tab === 'signup') {
      if (!EMAIL_RE.test(username)) return setErrorKey('common.loginGate.errEmail');
      if (!pwValid(pin)) return setErrorKey('common.loginGate.errPin');
    }
    setBusy(true);
    const res = tab === 'signup' ? await register(username, pin, name) : await loginWithId(username, pin);
    setBusy(false);
    if (res.ok) {
      onClose?.();
      navigate(returnTo, { replace: true });
    } else {
      setErrorKey(ERROR_KEYS[res.error] || 'common.loginGate.errGeneric');
    }
    return undefined;
  };

  const TABS = [
    { id: 'login', k: 'common.loginGate.tabLogin' },
    { id: 'signup', k: 'common.loginGate.tabSignup' },
  ];

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-24">
        <LogoMark className="h-40 w-40 text-primary" aria-hidden="true" />

        {/* 탭 2개 · 활성 하단 인디케이터 슬라이드(§17 easeOut) */}
        <div role="tablist" aria-label="auth" className="relative flex w-full">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              role="tab"
              type="button"
              aria-selected={tab === tb.id}
              onClick={() => switchTab(tb.id)}
              className={`flex-1 pb-12 text-caption font-semibold uppercase tracking-eyebrow transition-colors duration-fast ${
                tab === tb.id ? 'text-primary' : 'text-inkMeta hover:text-inkSec'
              }`}
            >
              <LangSwap k={tb.k} />
            </button>
          ))}
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2 rounded-pill bg-line" />
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-2 w-1/2 rounded-pill bg-primary"
            style={{
              transform: `translateX(${tab === 'login' ? '0%' : '100%'})`,
              transition: `transform ${motion.dur} ${motion.easeOut}`,
            }}
          />
        </div>

        {/* 높이 보간 래퍼 · 콘텐츠 크기 변화(탭·검증 라인·체크리스트)를 부드럽게(reduced-motion은 auto) */}
        <div
          className="w-full overflow-hidden"
          style={{
            height: reduced ? 'auto' : wrapH ?? 'auto',
            transition: reduced ? undefined : `height ${motion.dur} ${motion.easeOut}`,
          }}
        >
          <div ref={contentRef} className="flex w-full flex-col items-center gap-24">
            {/* ID/PIN 폼 → 주 버튼(폼 하단) */}
            <form onSubmit={submit} className="flex w-full flex-col gap-16">
              <div className="flex flex-col gap-4">
                <Field
                  id="auth-username"
                  labelKey={tab === 'signup' ? 'common.loginGate.email' : 'common.loginGate.username'}
                  type={tab === 'signup' ? 'email' : 'text'}
                  value={username}
                  onChange={setUsername}
                  autoComplete={tab === 'signup' ? 'email' : 'username'}
                />
                {emailError && (
                  <LangSwap k="common.loginGate.errEmail" className="text-caption font-medium text-spice" />
                )}
              </div>

              <div className="flex flex-col gap-8">
                <Field
                  id="auth-pin"
                  labelKey="common.loginGate.pin"
                  type="password"
                  value={pin}
                  onChange={setPin}
                  autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
                />
                {tab === 'signup' && <PwChecklist pin={pin} />}
              </div>

              {tab === 'signup' && (
                <Field
                  id="auth-name"
                  labelKey="common.loginGate.name"
                  value={name}
                  onChange={setName}
                  autoComplete="name"
                />
              )}

              <div aria-live="polite" className="min-h-[20px]">
                {errorKey && <LangSwap k={errorKey} className="text-small font-medium text-spice" />}
              </div>

              <div className="grid">
                <Button as="button" type="submit" disabled={busy || (tab === 'signup' && !signupReady)}>
                  <LangSwap k={tab === 'signup' ? 'common.loginGate.submitSignup' : 'common.loginGate.submitLogin'} />
                </Button>
              </div>
            </form>

            {/* "or" 구분선 */}
            <div className="flex w-full items-center gap-12" aria-hidden="true">
              <span className="h-px flex-1 bg-line" />
              <LangSwap k="common.loginGate.or" className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta" />
              <span className="h-px flex-1 bg-line" />
            </div>

            {/* 구글 = 주 버튼 아래(§1 순서) · 전체 페이지 이동(returnTo 서버 state) */}
            <button
              type="button"
              onClick={() => login(returnTo)}
              className="pressable inline-flex h-48 w-full items-center justify-center gap-12 rounded-pill bg-white px-24 font-semibold text-ink shadow-sm hover:shadow-md"
            >
              <GoogleG />
              <LangSwap k="common.loginGate.google" />
            </button>

            {/* 연구 기록 동의 한 줄(3언어 · [V1] Privacy §2·§3 연동) */}
            <LangSwap k="common.loginGate.consent" as="p" className="text-caption font-medium text-inkMeta" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
