// 라인 카드 · COMPONENTS B + v3.1 존 B 행: 사진(캐릭터) 자리 대신 lucide 아이콘 배지
// (potato=Sprout, dakgalbi=Flame, lake=Waves · 라인 컬러 소프트 배경 원 = 토큰 클래스 + opacity 유틸),
// 정류장 3, 소요·가격. 무보더 + shadow-sm, hover shadow-md + translateY(-2px)(§16).
// 배지의 라인 컬러 사용 근거: DESIGN §3(라인을 지칭하는 배지는 3색으로 식별) · 장식이라 aria-hidden.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Flame, Sprout, Waves } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 언어별 소요 포맷 겹침 렌더용(PATTERNS §1) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';
import th from '../../i18n/th';
import Skeleton from '../ui/Skeleton';
import { getStops } from '../../data/api';

// 라인 식별 3색만 사용(DESIGN §3) · tokens 생성 클래스 매핑
const BADGE = {
  potato: { icon: Sprout, circle: 'bg-yellow/15', color: 'text-yellow' },
  dakgalbi: { icon: Flame, circle: 'bg-spice/15', color: 'text-spice' },
  lake: { icon: Waves, circle: 'bg-primary/15', color: 'text-primary' },
};

const UNITS = { en: en.common.units, ko: ko.common.units, th: th.common.units };
const LANGS = ['en', 'ko', 'th'];

// PATTERNS §1 동일 패턴을 데이터 텍스트(en/ko 필드 · th 없음)에 적용 · 시프트 0.
// v3.1 폴백 규칙: en 스팬은 lang!=='ko'일 때 표시(th는 en 폴백).
function BiText({ en: textEn, ko: textKo, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>
        {textEn}
      </span>
      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>
        {textKo}
      </span>
    </span>
  );
}

const fmtDuration = (min, units) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h}${units.h}` : null, m ? `${m}${units.m}` : null].filter(Boolean).join(' ');
};

// 소요 표기 · 3언어 단위 문자열 겹침 렌더(시프트 0)
function DurationText({ min }) {
  const { lang } = useLang();
  return (
    <span className="grid">
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {fmtDuration(min, UNITS[code])}
        </span>
      ))}
    </span>
  );
}

export default function LineCard({ line }) {
  const { t } = useLang();
  const [stops, setStops] = useState(null);
  const badge = BADGE[line.color_token];
  const BadgeIcon = badge.icon;

  useEffect(() => {
    let alive = true;
    // api.js는 전부 async · await 계약(PROGRESS 인수인계 노트)
    getStops(line.id).then((result) => {
      if (alive) setStops(result);
    });
    return () => {
      alive = false;
    };
  }, [line.id]);

  return (
    <Link
      to={`/loop/${line.id}`}
      className="block h-full overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex flex-col gap-16 p-24">
        {/* 아이콘 배지 · 라인 컬러 소프트 배경 원(토큰 클래스 + opacity 유틸) */}
        <span
          aria-hidden="true"
          className={`flex h-64 w-64 items-center justify-center rounded-pill ${badge.circle}`}
        >
          <BadgeIcon size={32} className={badge.color} />
        </span>
        <BiText en={line.name_en} ko={line.name_ko} className="text-h3 font-medium" />
        {stops ? (
          <p className="flex flex-wrap items-center gap-8 text-small text-inkSec">
            {stops.map((stop, i) => (
              <span key={stop.id} className="flex items-center gap-8">
                <BiText en={stop.name_en} ko={stop.name_ko} />
                {i < stops.length - 1 && <ArrowRight size={16} aria-hidden="true" className="text-inkMeta" />}
              </span>
            ))}
          </p>
        ) : (
          <Skeleton className="h-16 w-full" />
        )}
        <div className="flex items-end justify-between gap-16">
          <span className="flex items-center gap-8 text-small text-inkSec">
            <Clock size={16} aria-hidden="true" />
            {/* 언어별 포맷 폭이 달라 겹침 렌더(시프트 0) */}
            <DurationText min={line.duration_min} />
          </span>
          <span className="flex items-baseline gap-8">
            {/* 가격 DRAFT · 5일차 BM 검토 확정(IA §4), 값은 data/lines.js */}
            <span className="font-display text-h3 font-bold">
              {t('common.currency')}
              {line.price_adult.toLocaleString('en-US')}
            </span>
            <LangSwap k="home.lines.perAdult" className="text-caption font-medium text-inkMeta" />
          </span>
        </div>
      </div>
    </Link>
  );
}
