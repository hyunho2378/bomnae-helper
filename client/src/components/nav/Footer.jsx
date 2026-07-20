// 푸터 — DESIGN §6: navy 풀블리드(허용 3곳 중 1), 상단 1px 라인 3색 스트라이프,
// 팀/대회 크레딧 + 언어 + 법적 고지.
import LangSwap from '../../i18n/LangSwap';
import Container from '../layout/Container';
import LangToggle from './LangToggle';

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div aria-hidden="true" className="grid h-px grid-cols-3">
        <div className="bg-yellow" />
        <div className="bg-spice" />
        <div className="bg-primary" />
      </div>
      <Container>
        <div className="flex flex-col gap-24 py-48 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-8">
            <span className="font-display text-h3 font-bold">Bomnae Helper</span>
            <LangSwap k="common.footer.credit" className="text-small font-medium" />
            <LangSwap k="common.footer.legal" className="text-small font-light" />
          </div>
          <LangToggle />
        </div>
      </Container>
    </footer>
  );
}
