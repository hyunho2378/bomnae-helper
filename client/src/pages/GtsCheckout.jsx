// GTS 체크아웃 · IA §9.6 — 스텁(존 C4 BUILDER가 확장한다 · 교체 아님).
// 요약+금액 1뷰, 하차 텍스트 필수, 프로토타입 결제 Dialog(§33), LoginGate → 스탬프 → Ticket.
// 가드(§31): route 경유 — 미충족 시 route로 replace.
import Container from '../components/layout/Container';
import { useGtsGuard } from '../context/GtsContext';
import LangSwap from '../i18n/LangSwap';

export default function GtsCheckout() {
  const ok = useGtsGuard('checkout');
  if (!ok) return null;
  return (
    <Container>
      <div className="flex flex-col gap-24 pb-64 pt-96">
        <LangSwap k="meta.title.gtsCheckout" as="h1" className="text-h1 font-bold" />
      </div>
    </Container>
  );
}
