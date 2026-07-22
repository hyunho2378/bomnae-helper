// [V1] 글래스 로그인 모달(DAH 6.3 문법 · 별도 페이지 아님 — Modal 재사용: ESC·바깥 닫기·포커스 트랩 내장).
// 내용: 로고 마크 + "Continue with Google"(구글 G 표준 SVG 인라인) + "No sign-up needed" 캡션 +
// 연구 기록 동의 한 줄(3언어). 다른 소셜 버튼 금지. returnTo는 AuthContext.login이 서버 state로 보존.
import { useAuth } from '../../context/AuthContext';
import LangSwap from '../../i18n/LangSwap';
import LogoMark from '../../assets/logo-mark.svg?react';
import Modal from './Modal';

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

export default function LoginGate({ open, onClose, returnTo }) {
  const { login } = useAuth();

  return (
    <Modal open={open} onClose={onClose} title="common.loginGate.title">
      <div className="flex flex-col items-center gap-24 text-center">
        <LogoMark className="h-48 w-48 text-primary" aria-hidden="true" />
        {/* 구글 버튼 · white 면 + shadow.sm(브랜드 가이드 톤) · 유일한 소셜 버튼 */}
        <button
          type="button"
          onClick={() => login(returnTo)}
          className="pressable inline-flex h-48 items-center justify-center gap-12 rounded-pill bg-white px-24 font-semibold text-ink shadow-sm hover:shadow-md"
        >
          <GoogleG />
          <LangSwap k="common.loginGate.google" />
        </button>
        <LangSwap k="common.loginGate.noSignup" as="p" className="text-small font-medium text-inkSec" />
        {/* 연구 기록 동의 한 줄(3언어 · [V1] Privacy §2·§3 연동) */}
        <LangSwap k="common.loginGate.consent" as="p" className="text-caption font-medium text-inkMeta" />
      </div>
    </Modal>
  );
}
