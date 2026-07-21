// 도착 모달 · IA §8.5.4 고정 문안 · 시스템 경고 룩 금지(라인 컬러 도트 3개 헤더 장식 허용).
// v4.2 존 B5(§40): 실측 지오 감지 경로는 ARRIVAL_MODE='geo' 플래그로 보존(기본 demo · DemoArrivalModal).
// Modal(ui) 재사용: lg+ Dialog(중앙 컴팩트) / <lg BottomSheet · 우상단 닫기·Escape는 Modal 내장.
// 주 버튼 목적지는 구 시내 라인 라우트 퇴역(IA §9.1 리다이렉트)에 따라 /gts로 갱신.
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
    navigate('/gts');
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
        <LangSwap k="gate.arrival.modal.body" as="p" className="text-body font-medium text-inkSec" />
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
