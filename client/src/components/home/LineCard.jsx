// 라인 카드 · COMPONENTS B: props `line`. 라인 컬러 상단 스트라이프 4px, 캐릭터 이미지,
// 정류장 3, 소요·가격. hover 보더 primary + translateY(-2px) · DESIGN §7 명세값 2px는
// spacing 토큰에 없어 JS hover 상태 + 인라인 transform으로 구현(scale 아님).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 언어별 소요 포맷 겹침 렌더용(PATTERNS §1) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';
import Skeleton from '../ui/Skeleton';
import { getStops } from '../../data/api';

// 라인 식별 3색만 사용(DESIGN §3) · tokens 생성 클래스 매핑
const STRIPE = { potato: 'bg-yellow', dakgalbi: 'bg-spice', lake: 'bg-primary' };

// PATTERNS §1 동일 패턴을 데이터 텍스트(en/ko 필드)에 적용 · 전환 시 레이아웃 시프트 0
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

const fmtDuration = (min, units) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h}${units.h}` : null, m ? `${m}${units.m}` : null].filter(Boolean).join(' ');
};

export default function LineCard({ line }) {
  const { lang, t } = useLang();
  const [stops, setStops] = useState(null);
  const [lift, setLift] = useState(false);

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
      onMouseEnter={() => setLift(true)}
      onMouseLeave={() => setLift(false)}
      style={{ transform: lift ? 'translateY(-2px)' : 'none' }} // DESIGN §7 카드 hover 명세값
      className="block overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-fast hover:shadow-md"
    >
      <div aria-hidden="true" className={`h-4 ${STRIPE[line.color_token]}`} />
      <div className="flex flex-col gap-16 p-24">
        {/* PLACEHOLDER · 봄내크루 배경 제거본 에셋 대기(PROGRESS 준비물). 콘텐츠 이미지로만(DESIGN §1). */}
        <img
          src={line.character_img}
          alt={lang === 'ko' ? line.name_ko : line.name_en}
          loading="lazy"
          className="h-96 w-96 rounded-md bg-surface object-contain"
        />
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
            <BiText
              en={fmtDuration(line.duration_min, en.common.units)}
              ko={fmtDuration(line.duration_min, ko.common.units)}
            />
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
