// 히어로 · IA §2.1.1: 풀블리드(허용 3곳 중 1), display 타이포, 실사진 배경 + scrim,
// CTA 2("Find my route" → /gate, "See the lines" → /loop). COMPONENTS B.
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import Container from '../layout/Container';

export default function HeroSection() {
  const { t } = useLang();
  return (
    <section
      className="relative flex items-end overflow-hidden"
      // DESIGN §5 명세값 min-height: clamp(560px,72vh,960px) · 브래킷/인라인 1곳 허용 예외
      style={{ minHeight: 'clamp(560px, 72vh, 960px)' }}
    >
      {/* PLACEHOLDER · 텍스트 없는 실사진으로 교체(3~4일차 촬영, PROGRESS 준비물). 단색 surface placeholder.
          LCP 이미지라 lazy 미적용(DESIGN §12 lazy 규칙은 콘텐츠 사진 대상 · 보고서에 명시). */}
      <img
        src="/images/hero.jpg"
        alt={t('home.hero.photoAlt')}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* 그라데이션 예산 1/1 · 히어로 스크림(scrim → transparent), DESIGN §10.
          via-scrim으로 텍스트 존(하단 절반)을 완전 scrim으로 유지 · 단색 placeholder 위에서도
          WCAG AA(대형 텍스트 3:1) 확보. 양 끝점은 명세 그대로 scrim → transparent. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-scrim via-scrim to-transparent"
      />
      <Container>
        <div className="relative pb-64 pt-128 lg:pb-80">
          <LangSwap
            k="home.hero.title"
            as="h1"
            className="max-w-3xl font-display text-display font-bold tracking-display text-white"
          />
          <LangSwap
            k="home.hero.sub"
            as="p"
            className="mt-16 text-h2 font-light text-white"
          />
          <div className="mt-32 flex flex-wrap gap-16">
            <Button as={Link} to="/gate" size="lg">
              <LangSwap k="home.hero.ctaGate" />
            </Button>
            <Button as={Link} to="/loop" size="lg">
              <LangSwap k="home.hero.ctaLoop" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
