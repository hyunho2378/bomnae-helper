// Hands-Free 크로스셀 카드 · IA §2.2.5: "Send your bags ahead. Travel with just your body."
// v3.1: 링크 → /hands-free(최상위 승격). 테부라(手ぶら観光) 표준 언급은 카피 한 줄(사전 키).
// 카드 hover: shadow-md + translateY(-2px)(§16).
import { Link } from 'react-router-dom';
import { ArrowRight, Luggage } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';

export default function HandsFreeCard() {
  return (
    <Link
      to="/hands-free"
      className="flex flex-col gap-16 rounded-lg bg-white p-24 shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-md"
    >
      <Luggage size={32} aria-hidden="true" className="text-primary" />
      <LangSwap k="gate.handsfree.title" as="h3" className="text-h3 font-medium" />
      <LangSwap k="gate.handsfree.body" as="p" className="text-small font-normal text-inkSec" />
      <span className="inline-flex min-h-44 items-center gap-8 font-semibold text-primary">
        <LangSwap k="gate.handsfree.cta" />
        <ArrowRight size={20} aria-hidden="true" />
      </span>
    </Link>
  );
}
