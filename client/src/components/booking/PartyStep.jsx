// 예약 Step 2 · 인원(IA §2.6): Adult/Child Stepper(yountravel 패턴) + 실시간 합계.
// 잔여 좌석을 넘지 못하게 상한은 부모(Booking)가 클램프해 내려준다.
import LangSwap from '../../i18n/LangSwap';
import Stepper from '../ui/Stepper';

export default function PartyStep({
  adults,
  children,
  maxAdults,
  maxChildren,
  total,
  onAdults,
  onChildren,
}) {
  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-16 rounded-md border border-line p-20">
        <Stepper value={adults} min={1} max={maxAdults} onChange={onAdults} label="booking.adults" />
        <Stepper
          value={children}
          min={0}
          max={maxChildren}
          onChange={onChildren}
          label="booking.children"
        />
      </div>
      {/* 실시간 합계 · 예약 상태 변경 영역 aria-live(DESIGN §14). 가격 DRAFT(IA §4) */}
      <div aria-live="polite" className="flex items-baseline justify-between">
        <LangSwap k="booking.total" className="text-small font-medium text-inkSec" />
        <span className="font-display text-h2 font-bold tracking-display">
          {'₩'}
          {total.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  );
}
