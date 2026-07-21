// DEPRECATED v4(IA §9.0) — 구 City Lines·Bag Delivery 잠정 퇴역: 라우트에서 제거됨. 삭제 금지, 재활용 예정.
// 스티키 예약 패널 · v3.2 rev(IA §8.3.3): 캘린더는 좌측 본문(2개월 스프레드)으로 이동,
// 이 패널은 "선택 중인 출발" = 라인명 · 날짜 · 회차 · 인원 Stepper · 합계 · CTA.
// 선택 상태(URL 쿼리 동기·replace)는 LineDetail 소관 · 패널은 표시 + onPatch 콜백만.
// 가격·잔여석·마감은 좌측 캘린더·회차 리스트에 항상 1뷰 노출(§8.3.4 다크패턴 제거).
// computeTotal/readParty는 Booking·LineDetail이 공유(기존 계약 유지).
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Stepper from '../ui/Stepper';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';

// 라인 컬러 정적 클래스 매핑(토큰 클래스만) · 원색 도트 + shadow.sm(§16.1)
const DOT = { potato: 'bg-yellow', dakgalbi: 'bg-spice', lake: 'bg-primary' };

const isWeekendStr = (dateStr) => {
  const day = new Date(`${dateStr}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

// 합계 · 주말 차등은 좌석당 가산(가격 전부 DRAFT, 5일차 BM 검토 확정 · IA §4).
// Booking(확인 페이지)·모바일 하단 바가 동일 산식을 공유한다.
export function computeTotal(line, dateStr, adults, children) {
  if (!line) return 0;
  const delta = dateStr && isWeekendStr(dateStr) ? (line.price_weekend_delta ?? 0) : 0;
  return adults * (line.price_adult + delta) + children * (line.price_child + delta);
}

// 쿼리 정수 파서 · adult 기본 1, child 기본 0(IA §2.5 쿼리 계약)
export function readParty(searchParams) {
  const adult = Number.parseInt(searchParams.get('adult') ?? '1', 10);
  const child = Number.parseInt(searchParams.get('child') ?? '0', 10);
  return {
    adults: Number.isNaN(adult) ? 1 : Math.max(1, adult),
    children: Number.isNaN(child) ? 0 : Math.max(0, child),
  };
}

// 데이터 필드(en/ko · th 없음) 겹침 · th는 en 폴백(v3.1 규칙 · PATTERNS §1)
function BiText({ en: textEn, ko: textKo, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>{textEn}</span>
      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{textKo}</span>
    </span>
  );
}

// childrenCount · React 예약 prop(children)과의 충돌 회피를 위한 명명
export default function StickyBookPanel({ line, date, time, departure, adults, childrenCount, onPatch }) {
  const seatsLeft = departure ? departure.capacity - departure.booked_count : null;
  const total = computeTotal(line, date, adults, childrenCount);
  const ready = Boolean(date && time && departure && departure.status !== 'closed');
  const bookHref = `/loop/${line.id}/book?date=${date ?? ''}&time=${encodeURIComponent(
    time ?? '',
  )}&adult=${adults}&child=${childrenCount}`;

  return (
    <div className="flex flex-col gap-24 rounded-xl bg-white p-24 shadow-md">
      {/* 패널 제목 · "선택 중인 출발"(§8.3.3) */}
      <LangSwap k="loop.detail.selectedTitle" as="h2" className="text-h3 font-semibold" />

      {/* 라인명 · 원색 도트(§16.1) */}
      <p className="flex items-center gap-8">
        <span aria-hidden="true" className={`h-8 w-8 shrink-0 rounded-pill shadow-sm ${DOT[line.id]}`} />
        <BiText en={line.name_en} ko={line.name_ko} className="min-w-0 text-body font-semibold" />
      </p>

      {/* 날짜 · 회차(Kanit Bold 큰 숫자) · 회차 미선택 시 안내 한 줄(인식>회상 · §16.10) */}
      <div className="flex flex-col gap-4" aria-live="polite">
        <p className="font-display text-h3 font-bold tracking-display">
          {date}
          {time ? ` · ${time}` : ''}
        </p>
        {!time && (
          <LangSwap k="loop.detail.pickTime" as="p" className="text-small font-medium text-inkSec" />
        )}
      </div>

      {/* Adult/Child Stepper · 잔여 좌석 클램프 */}
      <div className="flex flex-col gap-16">
        <Stepper
          value={adults}
          min={1}
          max={seatsLeft !== null ? Math.max(1, seatsLeft - childrenCount) : 12}
          onChange={(v) => onPatch({ adult: v })}
          label="booking.adults"
        />
        <Stepper
          value={childrenCount}
          min={0}
          max={seatsLeft !== null ? Math.max(0, seatsLeft - adults) : 12}
          onChange={(v) => onPatch({ child: v })}
          label="booking.children"
        />
      </div>

      {/* 디바이더 · colors.line 수평 1px(무보더 원칙의 허용 예외, DESIGN §7) */}
      <div aria-hidden="true" className="h-px w-full bg-line" />

      {/* 합계(semibold primary · §15) */}
      <p aria-live="polite" className="flex items-baseline justify-between">
        <LangSwap k="booking.total" className="text-small font-semibold" />
        <span className="font-display text-h3 font-semibold text-primary">
          {'₩'}
          {total.toLocaleString('en-US')}
        </span>
      </p>

      {/* CTA · 플로우 끝까지 동일 어휘 "Reserve seats"(DESIGN §13). grid 래핑 = full 폭 */}
      <div className="grid">
        <Button as={Link} to={bookHref} disabled={!ready}>
          <LangSwap k="booking.title" />
        </Button>
      </div>
    </div>
  );
}
