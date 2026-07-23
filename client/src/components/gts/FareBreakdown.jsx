// [V7] DEPRECATED — 시간제 이용권(passes.js + PassBreakdown)으로 요금 체계 대체 · 현재 소비자 0.
//   롤백 대비 보존(삭제 금지). 구: 요금 구성 표시(IA §9.3 · PATTERNS §33) · fares 조회 전용.
// 다크패턴 금지(§16.10): 전 항목 + 합계 항상 펼침. setup 매칭 카드와 checkout 금액 내역이 공유.
import { computeGtsTotal } from '../../data/gts/api';
import { fares } from '../../data/gts/vehicles';
import LangSwap from '../../i18n/LangSwap';

function FareRow({ labelKey, children }) {
  return (
    <div className="flex items-baseline justify-between gap-16">
      <LangSwap k={labelKey} className="text-small font-medium text-inkSec" />
      <span className="font-display text-body font-semibold">{children}</span>
    </div>
  );
}

export default function FareBreakdown({ vehicle, luggage, party }) {
  const fare = fares[vehicle];
  const total = computeGtsTotal(vehicle, luggage, party);
  return (
    <div className="flex flex-col gap-12">
      <FareRow labelKey="gts.fare.base">
        {'₩'}
        {fare.base.toLocaleString('en-US')}
      </FareRow>
      {/* 짐 보관 시에만 추가요금 행 노출(§9.3 실시간 구성) */}
      {luggage && (
        <FareRow labelKey="gts.fare.luggage">
          {'₩'}
          {fares.luggageFee.toLocaleString('en-US')}
        </FareRow>
      )}
      <FareRow labelKey="gts.fare.perPerson">
        {'₩'}
        {fare.perPerson.toLocaleString('en-US')} × {party}
      </FareRow>
      {/* 수평 디바이더 · colors.line 허용 예외(Booking 요약 카드 선례) */}
      <div aria-hidden="true" className="h-px w-full bg-line" />
      <div className="flex items-baseline justify-between gap-16">
        <LangSwap k="gts.fare.total" className="text-small font-semibold" />
        <span className="font-display text-h3 font-bold text-primary">
          {'₩'}
          {total.toLocaleString('en-US')}
        </span>
      </div>
      {/* v4.2 §10.4: 사용자 노출 DRAFT 고지 삭제(가격 초안 여부는 코드 주석·PROGRESS만) */}
    </div>
  );
}
