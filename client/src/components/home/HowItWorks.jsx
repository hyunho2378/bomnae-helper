// How it works — IA §2.1.5: 3단계(Reserve a seat → We pre-order ahead → Arrive, it's ready).
// 선주문 대행이 핵심 차별점임을 step2 카피에서 명시. 번호는 실제 순서이므로 숫자 마커 허용(COMPONENTS B).
import LangSwap from '../../i18n/LangSwap';

const STEPS = ['step1', 'step2', 'step3'];

export default function HowItWorks() {
  return (
    <ol className="grid gap-16 md:grid-cols-3 md:gap-24 xl:gap-32">
      {STEPS.map((step, i) => (
        <li key={step} className="rounded-md border border-line p-24">
          <span aria-hidden="true" className="font-display text-h1 font-bold text-primary">
            {i + 1}
          </span>
          <LangSwap k={`home.how.${step}.title`} as="h3" className="mt-16 text-h3 font-medium" />
          <LangSwap k={`home.how.${step}.body`} as="p" className="mt-8 text-small font-normal text-inkSec" />
        </li>
      ))}
    </ol>
  );
}
