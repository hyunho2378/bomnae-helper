// 로그인 게이트 · 예약/접수 "확정" 액션에서만 사용 (Guest-first, ROUTES §3).
// PHASE 1은 목 로그인(즉시 성공). PHASE 3에서 Google OAuth로 내부 교체.
import { useAuth } from '../../context/AuthContext';
import LangSwap from '../../i18n/LangSwap';
import Button from './Button';
import Modal from './Modal';

export default function LoginGate({ open, onClose, onSuccess }) {
  const { login } = useAuth();

  return (
    <Modal open={open} onClose={onClose} title="common.loginGate.title">
      <div className="flex flex-col items-center gap-24 text-center">
        {/* PLACEHOLDER · unDraw 단색(primary) 재컬러 SVG 저장 대기 (DESIGN §9) */}
        <img src="/images/illustrations/login.svg" alt="" loading="lazy" className="w-full" />
        <Button
          onClick={() => {
            login();
            onSuccess?.();
            onClose?.();
          }}
        >
          <LangSwap k="common.loginGate.google" />
        </Button>
      </div>
    </Modal>
  );
}
