// GTS 셋업 · IA §9.3 — 스텁(존 C4 BUILDER가 확장한다 · 교체 아님).
// 인원 Stepper(1~12) + 짐 보관 토글 + 매칭 결과 카드 + CTA → /gts/build.
import Container from '../components/layout/Container';
import LangSwap from '../i18n/LangSwap';

export default function GtsSetup() {
  return (
    <Container>
      <div className="flex flex-col gap-24 pb-64 pt-96">
        <LangSwap k="meta.title.gtsSetup" as="h1" className="text-h1 font-bold" />
      </div>
    </Container>
  );
}
