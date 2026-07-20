// STUB 확장 · AGENT-2. 기준: IA §2.1 (7섹션 순서 고정), COMPONENTS.md 섹션 B.
// 1 Hero → 2 Problem strip → 3 Gate entry → 4 Lines preview → 5 How it works
// → 6 Pilot proof strip → 7 Footer(셸이 렌더).
import Section from '../components/layout/Section';
import LangSwap from '../i18n/LangSwap';
import GateEntryCard from '../components/home/GateEntryCard';
import HeroSection from '../components/home/HeroSection';
import HowItWorks from '../components/home/HowItWorks';
import LinesPreview from '../components/home/LinesPreview';
import PilotStrip from '../components/home/PilotStrip';
import ProblemStrip from '../components/home/ProblemStrip';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProblemStrip />
      <Section id="gate-entry" eyebrow="nav.gate" title="home.gateEntry.title">
        <LangSwap k="home.gateEntry.sub" as="p" className="max-w-dialog text-body text-inkSec" />
        <div className="mt-24">
          <GateEntryCard />
        </div>
      </Section>
      <Section id="lines" eyebrow="nav.loop" title="home.lines.title">
        <LinesPreview />
      </Section>
      <Section id="how-it-works" eyebrow="home.how.eyebrow" title="home.how.title">
        <HowItWorks />
      </Section>
      <Section id="pilot-proof" eyebrow="home.pilotStrip.eyebrow" title="pilot.title">
        <PilotStrip />
      </Section>
    </>
  );
}
