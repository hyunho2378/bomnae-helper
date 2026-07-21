// GTS 조립 · IA §9.4 — 스텁(존 C4 BUILDER가 확장한다 · 교체 아님).
// Step 0 식사 플랜 3택 → Step 1 식사 선택 → Step 2 합산 2픽 + VenueGrid(§30) + 진행 바.
// 가드(§31): party 필수 — 미충족 시 setup으로 replace.
import Container from '../components/layout/Container';
import { useGtsGuard } from '../context/GtsContext';
import LangSwap from '../i18n/LangSwap';

export default function GtsBuild() {
  const ok = useGtsGuard('build');
  if (!ok) return null;
  return (
    <Container>
      <div className="flex flex-col gap-24 pb-64 pt-96">
        <LangSwap k="meta.title.gtsBuild" as="h1" className="text-h1 font-bold" />
      </div>
    </Container>
  );
}
