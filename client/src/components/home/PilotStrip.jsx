// 파일럿 증빙 스트립 — IA §2.1.6: 실운행 썸네일 + "We already ran it." + /pilot 링크.
// navy는 강대비 면으로 허용(DESIGN §2). 갤러리 데이터는 data/pilot.js(정적 콘텐츠 —
// api.js 계약에 파일럿 게터가 없어 직접 import, 완료 보고 질문 목록에 명시).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import { gallery } from '../../data/pilot';

export default function PilotStrip() {
  const { lang } = useLang();
  const [lift, setLift] = useState(false);
  const thumb = gallery[0];

  return (
    <Link
      to="/pilot"
      onMouseEnter={() => setLift(true)}
      onMouseLeave={() => setLift(false)}
      style={{ transform: lift ? 'translateY(-2px)' : 'none' }} // DESIGN §7 카드 hover 명세값
      className="block overflow-hidden rounded-lg border border-navy bg-navy text-white transition-all duration-fast hover:border-primary"
    >
      <div className="grid md:grid-cols-2">
        {/* PLACEHOLDER — 파일럿 실운행 촬영분으로 교체(3~4일차, PROGRESS 준비물) */}
        <img
          src={thumb.photo}
          alt={lang === 'ko' ? thumb.alt_ko : thumb.alt_en}
          loading="lazy"
          className="aspect-video h-full w-full bg-surface object-cover"
        />
        <div className="flex flex-col justify-center gap-16 p-24 lg:p-48">
          <LangSwap k="home.pilotStrip.body" as="p" className="text-body font-normal" />
          <span className="inline-flex min-h-44 items-center gap-8 font-semibold">
            <LangSwap k="home.pilotStrip.cta" />
            <ArrowRight size={20} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
