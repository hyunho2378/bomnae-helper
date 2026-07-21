// 도착 감지 상태 카드 · IA §8.2.4 진입점 + §8.5 고정 문안 · 플래너 결과 아래 배치.
// v4.2 존 B5(§40): 기본 렌더 제거 · Gate.jsx의 ARRIVAL_MODE='geo'에서만 렌더(코드 보존 · 삭제 금지).
// 여정 이어가기 목적지는 구 시내 라인 라우트 퇴역(IA §9.1 리다이렉트)에 따라 /gts로 갱신.
// 상태기 표시: off / waiting / outside(활성 유지) / denied / error / arrived(모달 닫은 뒤 소형 버튼 잔존).
// 좌표·거리 수치 절대 비노출(IA §8.5.3) · 상태 변화 영역 aria-live polite(DESIGN §14 · §16.10 상태 가시성).
import { useNavigate } from 'react-router-dom';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import { useArrival } from '../../context/ArrivalContext';

export default function ArrivalCard() {
  const { status, openExplain, disable, retry, confirmManual } = useArrival();
  const navigate = useNavigate();
  // explaining은 카드 관점에서 off와 동일 화면(설명 모달이 위에 뜬다) · 문안 분기 없음
  const view = status === 'explaining' ? 'off' : status;

  const continueJourney = () => navigate('/gts');

  return (
    <section aria-live="polite" className="flex flex-col gap-16 rounded-lg bg-white p-24 shadow-sm">
      {view === 'off' && (
        <>
          <LangSwap k="gate.arrival.card.offTitle" as="h3" className="text-h3 font-semibold" />
          <LangSwap k="gate.arrival.card.offDesc" as="p" className="text-body font-medium text-inkSec" />
          <div className="flex flex-wrap items-center gap-12">
            <Button onClick={openExplain}>
              <LangSwap k="gate.arrival.card.enable" />
            </Button>
            <Button variant="ghost" onClick={openExplain}>
              <LangSwap k="gate.arrival.card.guide" />
            </Button>
          </div>
        </>
      )}

      {(view === 'waiting' || view === 'outside') && (
        <>
          <LangSwap
            k={view === 'waiting' ? 'gate.arrival.card.waitingTitle' : 'gate.arrival.card.outsideTitle'}
            as="h3"
            className="text-h3 font-semibold"
          />
          <div className="flex flex-wrap items-center gap-12">
            <Button variant="secondary" onClick={disable}>
              <LangSwap k="gate.arrival.card.disable" />
            </Button>
          </div>
        </>
      )}

      {view === 'denied' && (
        <>
          <LangSwap k="gate.arrival.card.deniedTitle" as="h3" className="text-h3 font-semibold" />
          <div className="flex flex-wrap items-center gap-12">
            <Button onClick={confirmManual}>
              <LangSwap k="gate.arrival.card.manual" />
            </Button>
            <Button variant="secondary" onClick={openExplain}>
              <LangSwap k="gate.arrival.card.settings" />
            </Button>
          </div>
        </>
      )}

      {view === 'error' && (
        <>
          <LangSwap k="gate.arrival.card.errorTitle" as="h3" className="text-h3 font-semibold" />
          <div className="flex flex-wrap items-center gap-12">
            <Button onClick={retry}>
              <LangSwap k="gate.arrival.card.retry" />
            </Button>
            <Button variant="secondary" onClick={confirmManual}>
              <LangSwap k="gate.arrival.card.manual" />
            </Button>
          </div>
        </>
      )}

      {view === 'arrived' && (
        <>
          <LangSwap k="gate.arrival.card.arrivedTitle" as="h3" className="text-h3 font-semibold" />
          {/* 재알림 금지 · 소형 버튼 잔존(IA §8.5.6) */}
          <div className="flex flex-wrap items-center gap-12">
            <Button variant="secondary" onClick={continueJourney}>
              <LangSwap k="gate.arrival.modal.continue" />
            </Button>
          </div>
        </>
      )}

      <LangSwap k="gate.arrival.card.footnote" as="p" className="text-caption font-medium text-inkMeta" />
    </section>
  );
}
