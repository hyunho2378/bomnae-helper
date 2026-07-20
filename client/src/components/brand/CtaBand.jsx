// About §11 CTA 밴드(IA §2.8.11) · "Back the first line." + 크라우드펀딩 예정 문구 + CTA → /loop.
// 풀블리드는 히어로·지도·푸터뿐(DESIGN §5) · 컨테이너 안 surface 패널로 구현.
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Container from '../layout/Container';
import LangSwap from '../../i18n/LangSwap';

export default function CtaBand() {
  return (
    <section id="back-the-line" className="py-64 lg:py-80">
      <Container>
        <div className="flex flex-col items-center gap-16 rounded-xl bg-surface p-48 text-center">
          <LangSwap
            k="brand.cta.title"
            as="h2"
            className="font-display text-h2 font-bold tracking-display"
          />
          <LangSwap k="brand.cta.sub" as="p" className="text-body font-regular text-inkSec" />
          <Button as={Link} to="/loop" size="lg">
            <LangSwap k="brand.cta.button" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
