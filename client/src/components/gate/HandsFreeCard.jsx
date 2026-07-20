// Hands-Free 크로스셀 카드 — IA §2.2.4: "Send your bags ahead. Travel with just your body."
// → /gate/hands-free. 테부라(手ぶら観光) 표준 언급은 카피 한 줄(사전 키). 카드 hover DESIGN §7.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Luggage } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';

export default function HandsFreeCard() {
  const [lift, setLift] = useState(false);

  return (
    <Link
      to="/gate/hands-free"
      onMouseEnter={() => setLift(true)}
      onMouseLeave={() => setLift(false)}
      style={{ transform: lift ? 'translateY(-2px)' : 'none' }} // DESIGN §7 카드 hover 명세값
      className="flex flex-col gap-16 rounded-md border border-line bg-white p-24 transition-all duration-fast hover:border-primary"
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
