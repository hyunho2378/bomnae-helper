// Proof 스트립 · IA §2.1.6 v3.1: 실운행 썸네일 + "We already ran it." → /about#proof
// (Pilot 페이지가 About §Proof로 흡수됨 · COMPONENTS v3.1 존 B 행).
// navy는 강대비 면으로 허용(DESIGN §2). 갤러리 데이터는 data/pilot.js(정적 콘텐츠 ·
// api.js 계약에 파일럿 게터가 없어 직접 import · AR 라운드 확정 사항).
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import { gallery } from '../../data/pilot';

export default function PilotStrip() {
  const { lang } = useLang();
  const thumb = gallery[0];

  return (
    <Link
      to="/about#proof"
      // v3.2 §16.1: navy 면은 티켓 전용 · 크롬 단일색(primary)으로 교체([CR] 수정)
      className="block overflow-hidden rounded-lg bg-primary text-white shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="grid md:grid-cols-2">
        {/* PLACEHOLDER · 파일럿 실운행 촬영분으로 교체(3~4일차, PROGRESS 준비물) */}
        <img
          src={thumb.photo}
          alt={lang === 'ko' ? thumb.alt_ko : thumb.alt_en}
          loading="lazy"
          className="aspect-video h-full w-full bg-surface object-cover"
        />
        <div className="flex flex-col justify-center gap-16 p-24 lg:p-48">
          <LangSwap k="home.proof.body" as="p" className="text-body font-medium" />
          <span className="inline-flex min-h-44 items-center gap-8 font-semibold">
            <LangSwap k="home.proof.cta" />
            <ArrowRight size={20} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
