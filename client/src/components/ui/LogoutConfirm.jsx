// [V1] 로그아웃 확인 모달 · 헤더 아바타 메뉴 경유(지시 [1]) — Modal 재사용(3언어).
import { useAuth } from '../../context/AuthContext';
import LangSwap from '../../i18n/LangSwap';
import Button from './Button';
import Modal from './Modal';

export default function LogoutConfirm({ open, onClose }) {
  const { logout } = useAuth();

  return (
    <Modal open={open} onClose={onClose} title="common.loginGate.logoutTitle">
      <div className="flex flex-col gap-24">
        <LangSwap k="common.loginGate.logoutBody" as="p" className="text-body" />
        <div className="flex flex-wrap items-center gap-12">
          <Button onClick={onClose}>
            <LangSwap k="common.loginGate.logoutCancel" />
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await logout();
              onClose?.();
            }}
          >
            <LangSwap k="common.loginGate.logoutConfirm" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
