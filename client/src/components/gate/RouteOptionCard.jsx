// 경로 옵션 카드 — COMPONENTS B: props {option, selected, onSelect}.
// 총 소요·요금·환승 수·첫 탑승 편(도착+60분 버퍼 반영값, data/gateRoutes.js 계산).
// 큰 숫자(가격·시간)는 Kanit Bold(DESIGN §4). 카드 hover는 DESIGN §7(보더 primary + translateY(-2px)).
import { useState } from 'react';
import { Check } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';

// PATTERNS §1 동일 패턴을 데이터 텍스트(en/ko 필드)에 적용 — 전환 시 레이아웃 시프트 0
function BiText({ en, ko, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>
        {en}
      </span>
      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>
        {ko}
      </span>
    </span>
  );
}

const fmtDuration = (min, t) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h}${t('common.units.h')}` : null, m ? `${m}${t('common.units.m')}` : null]
    .filter(Boolean)
    .join(' ');
};

export default function RouteOptionCard({ option, selected, onSelect }) {
  const { t } = useLang();
  const [lift, setLift] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      onMouseEnter={() => setLift(true)}
      onMouseLeave={() => setLift(false)}
      style={{ transform: lift ? 'translateY(-2px)' : 'none' }} // DESIGN §7 카드 hover 명세값
      className={`w-full rounded-md border bg-white p-24 text-left transition-all duration-fast hover:border-primary ${
        selected ? 'border-primary' : 'border-line'
      }`}
    >
      <span className="flex items-start justify-between gap-16">
        <BiText en={option.name_en} ko={option.name_ko} className="text-h3 font-medium" />
        {selected && <Check size={20} aria-hidden="true" className="shrink-0 text-primary" />}
      </span>
      <span className="mt-16 grid grid-cols-2 gap-x-16 gap-y-12">
        <span className="flex flex-col gap-4">
          <LangSwap k="gate.results.duration" className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta" />
          <span className="font-display text-h3 font-bold">{fmtDuration(option.total_duration_min, t)}</span>
        </span>
        <span className="flex flex-col gap-4">
          <LangSwap k="gate.results.fare" className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta" />
          <span className="font-display text-h3 font-bold">
            {t('common.currency')}
            {option.fare.toLocaleString('en-US')}
          </span>
        </span>
        <span className="flex flex-col gap-4">
          <LangSwap k="gate.results.transfers" className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta" />
          {option.transfers === 0 ? (
            <LangSwap k="gate.results.direct" className="font-display text-h3 font-bold" />
          ) : (
            <span className="font-display text-h3 font-bold">{option.transfers}</span>
          )}
        </span>
        <span className="flex flex-col gap-4">
          <LangSwap k="gate.results.firstAvailable" className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta" />
          <span className="flex items-center gap-8">
            <span className="font-display text-h3 font-bold">{option.first_available}</span>
            {option.next_day && (
              // 경고성 배지 — yellow + ink 텍스트(DESIGN §2: yellow 위 white 금지)
              <LangSwap
                k="gate.results.nextDay"
                className="rounded-pill bg-yellow px-8 py-4 text-caption font-medium text-ink"
              />
            )}
          </span>
        </span>
      </span>
    </button>
  );
}
