// 문제 선언 스트립 — IA §2.1.2: 팀 리서치 근거 한 문장, 숫자 "4 / 5" Kanit Bold display.
import LangSwap from '../../i18n/LangSwap';
import Container from '../layout/Container';

export default function ProblemStrip() {
  return (
    <div className="border-b border-line">
      <Container>
        <div className="flex flex-col gap-24 py-64 lg:flex-row lg:items-center lg:gap-80 lg:py-80">
          <LangSwap
            k="home.problem.stat"
            className="shrink-0 font-display text-display font-bold tracking-display text-primary"
          />
          <LangSwap
            k="home.problem.text"
            as="p"
            className="max-w-dialog text-h3 font-normal text-inkSec"
          />
        </div>
      </Container>
    </div>
  );
}
