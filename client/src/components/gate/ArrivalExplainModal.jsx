// 위치 사용 사전 설명 모달 · IA §8.5.2 고정 문안 · 브라우저 권한 팝업 직행 금지.
// Modal(ui) 재사용(lg+ Dialog / <lg BottomSheet 자동 분기) · Escape·바깥 탭·닫기 지원.
// "위치 사용 허용"에서만 실제 geolocation 요청(ArrivalContext.allow) · 호출 순서 보장 지점.
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useArrival } from '../../context/ArrivalContext';

export default function ArrivalExplainModal() {
  const { status, declineExplain, allow } = useArrival();

  return (
    <Modal open={status === 'explaining'} onClose={declineExplain} title="gate.arrival.explain.title">
      <div className="flex flex-col gap-16">
        <LangSwap k="gate.arrival.explain.body" as="p" className="text-body font-regular text-inkSec" />
        <div className="flex flex-wrap items-center gap-12">
          <Button onClick={allow}>
            <LangSwap k="gate.arrival.explain.allow" />
          </Button>
          <Button variant="secondary" onClick={declineExplain}>
            <LangSwap k="gate.arrival.explain.later" />
          </Button>
        </div>
        <LangSwap k="gate.arrival.explain.footnote" as="p" className="text-caption font-medium text-inkMeta" />
      </div>
    </Modal>
  );
}
