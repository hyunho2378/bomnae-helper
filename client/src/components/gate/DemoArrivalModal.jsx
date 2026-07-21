// 데모 도착 시퀀스 모달 · v4.2 존 B5(IA §10.3, PATTERNS §40): To Chuncheon 결과 확정 3초 뒤 중앙 표시.
// 상태라벨 "CHUNCHEON ARRIVAL"(Kanit · 연출 카피 예외, DESIGN §16.7) / h2 / 본문 / 주 CTA → /gts /
// 보조 "나중에" · Escape·우상단 닫기는 Modal(ui) 내장. 타이머·세션 1회 규칙은 Gate.jsx가 소유.
// 실측 지오 감지 경로(§21 ArrivalModal)는 ARRIVAL_MODE='geo' 플래그로 보존 · 이 모달은 demo 전용.
import { useNavigate } from 'react-router-dom';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

export default function DemoArrivalModal({ open, onClose }) {
  const navigate = useNavigate();

  const goBuild = () => {
    onClose();
    navigate('/gts');
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-16">
        <LangSwap
          k="gate.planner.demoArrival.label"
          as="p"
          className="font-display text-caption font-semibold uppercase tracking-eyebrow text-primary"
        />
        <LangSwap k="gate.planner.demoArrival.title" as="h2" className="text-h2 font-bold" />
        <LangSwap k="gate.planner.demoArrival.body" as="p" className="text-body font-medium text-inkSec" />
        <div className="flex flex-wrap items-center gap-12">
          <Button onClick={goBuild}>
            <LangSwap k="gate.planner.demoArrival.cta" />
          </Button>
          <Button variant="secondary" onClick={onClose}>
            <LangSwap k="gate.planner.demoArrival.later" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
