// 도착 모달 · IA §8.5.4 고정 문안 · 시스템 경고 룩 금지(라인 컬러 도트 3개 헤더 장식 허용).
// Modal(ui) 재사용: lg+ Dialog(중앙 컴팩트) / <lg BottomSheet · 우상단 닫기·Escape는 Modal 내장.
// 주 버튼은 navigate('/loop', { state: { transition: true } })만 호출한다. 전환 연출은 존 C2 소유.
// "지금은 괜찮아요"/닫기 후 재알림 금지: 카드에 소형 "여정 이어가기" 버튼만 잔존(ArrivalCard arrived 상태).
import { useNavigate } from 'react-router-dom';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useArrival } from '../../context/ArrivalContext';

export default function ArrivalModal() {
  const { modalOpen, dismissModal } = useArrival();
  const navigate = useNavigate();

  const continueJourney = () => {
    dismissModal();
    navigate('/loop', { state: { transition: true } });
  };

  return (
    <Modal open={modalOpen} onClose={dismissModal}>
      <div className="flex flex-col gap-16">
        {/* 라인 컬러 도트 3개 헤더 장식 · 원색 원 + shadow.sm(§16.1) */}
        <span aria-hidden="true" className="flex items-center gap-8">
          <span className="h-8 w-8 rounded-pill bg-yellow shadow-sm" />
          <span className="h-8 w-8 rounded-pill bg-spice shadow-sm" />
          <span className="h-8 w-8 rounded-pill bg-primary shadow-sm" />
        </span>
        {/* 상태라벨 · Kanit(연출 카피 예외, DESIGN §16.7) */}
        <LangSwap
          k="gate.arrival.modal.label"
          as="p"
          className="font-display text-caption font-semibold uppercase tracking-eyebrow text-primary"
        />
        <LangSwap k="gate.arrival.modal.title" as="h2" className="text-h2 font-bold" />
        <LangSwap k="gate.arrival.modal.body" as="p" className="text-body font-regular text-inkSec" />
        <div className="flex flex-wrap items-center gap-12">
          <Button onClick={continueJourney}>
            <LangSwap k="gate.arrival.modal.continue" />
          </Button>
          <Button variant="secondary" onClick={dismissModal}>
            <LangSwap k="gate.arrival.modal.later" />
          </Button>
        </div>
        <LangSwap k="gate.arrival.modal.footnote" as="p" className="text-caption font-medium text-inkMeta" />
      </div>
    </Modal>
  );
}
