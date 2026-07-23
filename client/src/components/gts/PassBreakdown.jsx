// PassBreakdown · [V7] 결제 내역 분리 표시 — 이용권(이름·시간 포함) + 짐 보관(선택 시만) + 최종 금액.
// FareBreakdown(구 기본요금+인당 산식) 대체 · 다크패턴 금지(§16.10) 전 항목 상시 펼침 유지.
// 이용권 미선택이면 금액 라인 대신 안내 1줄(금액의 근거가 없음).
import { LUGGAGE_FEE, PASS_PRICES, computePassTotal } from '../../data/gts/passes';
import LangSwap from '../../i18n/LangSwap';
import Money from '../ui/Money'; // [V12] 통화 환산 표시

export default function PassBreakdown({ passType, luggage }) {
  const total = computePassTotal(passType, luggage);
  if (!passType) {
    return <LangSwap k="gts.checkout.passPick" as="p" className="text-small font-medium text-inkSec" />;
  }
  return (
    <div className="flex flex-col gap-12">
      {/* 이용권 라인 · 이름에 시간 포함(1-hour pass 등) */}
      <div className="flex items-baseline justify-between gap-16">
        <LangSwap k={`gts.pass.names.${passType}`} className="text-small font-medium text-inkSec" />
        <Money krw={PASS_PRICES[passType]} className="text-right font-display text-body font-semibold" />
      </div>
      {/* 짐 보관 · 선택 시에만 라인 노출(명세 [3]) */}
      {luggage && (
        <div className="flex items-baseline justify-between gap-16">
          <LangSwap k="gts.fare.luggage" className="text-small font-medium text-inkSec" />
          <Money krw={LUGGAGE_FEE} className="text-right font-display text-body font-semibold" />
        </div>
      )}
      {/* 수평 디바이더 · colors.line 허용 예외(Booking 요약 카드 선례) */}
      <div aria-hidden="true" className="h-px w-full bg-line" />
      <div className="flex items-baseline justify-between gap-16">
        <LangSwap k="gts.fare.total" className="text-small font-semibold" />
        <Money krw={total} className="text-right font-display text-h3 font-bold text-primary" convClassName="text-caption font-medium text-inkMeta" />
      </div>
    </div>
  );
}
