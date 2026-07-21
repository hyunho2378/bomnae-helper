// 히어로 캐러셀 · v3.1(IA §2.1.1): 풀블리드(허용 3곳 중 1), 실사진 3장 크로스페이드 6초
// (opacity 400ms, scale 금지), scrim + display 타이포 + CTA 2 + 하단 도트 인디케이터.
// reduced-motion: 자동 전환 없이 1장 고정(도트 수동 전환은 유지 · 사용자 주도 즉시 전환).
// HeroSection.jsx 대체(COMPONENTS v3.1 존 B 행).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import Container from '../layout/Container';

// PLACEHOLDER · verify on site · 무료 스톡 자연 사진(hero-1..3.jpg) · 3~4일차 실촬영분으로 교체
const SLIDES = [1, 2, 3];
const INTERVAL_MS = 6000; // IA §2.1.1 명세값 · 크로스페이드 6초

export default function HeroCarousel() {
  const { t } = useLang();
  const [reduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return undefined; // reduced-motion: 1장 고정(자동 전환 제거)
    const id = setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <section
      className="relative flex items-end overflow-hidden"
      // DESIGN §5 명세값 min-height: clamp(560px,72vh,960px) · 브래킷/인라인 허용 예외
      style={{ minHeight: 'clamp(560px, 72vh, 960px)' }}
    >
      {/* 크로스페이드 스택 · LCP라 lazy 미적용. opacity 400ms = IA §2.1.1 명세값(토큰 외 · 인라인) */}
      {SLIDES.map((n, i) => (
        <img
          key={n}
          src={`/images/hero-${n}.jpg`}
          alt={t(`home.hero.slides.alt${n}`)}
          aria-hidden={i !== active}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: i === active ? 1 : 0, transition: 'opacity 400ms' }}
        />
      ))}
      {/* 그라데이션 예산 1/1 · 히어로 스크림(scrim → transparent), DESIGN §10.
          via-scrim으로 텍스트 존(하단 절반)을 완전 scrim으로 유지 · WCAG AA(대형 텍스트 3:1) 확보. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-scrim via-scrim to-transparent"
      />
      <Container>
        <div className="relative pb-64 pt-128 lg:pb-80">
          <LangSwap
            k="home.hero.title"
            as="h1"
            className="font-display text-display font-bold tracking-display text-white"
          />
          <LangSwap k="home.hero.sub" as="p" className="mt-16 text-h2 font-medium text-white" />
          {/* v4.2 §10.2 CTA 페어 · 동일 size(동일 높이·패딩)·나란히·컨테이너 정렬 축 일치(§16.8).
              secondary는 Button variant 재사용(§16.8 투명 배경+primary 텍스트+1.5px primary 보더).
              §10.2의 white 배경은 래퍼 white pill이 제공(사진·스크림 위 가독 · 변형 스타일 중복 없음). */}
          {/* [H2-1] 페어 동일 폭(넓은 쪽 기준 1fr 균등)·동일 높이·간격 12 · grid 아이템 stretch로 폭 통일 */}
          <div className="mt-32 inline-grid w-fit grid-flow-col auto-cols-fr items-stretch gap-12">
            <span className="grid">
              <Button as={Link} to="/gate" size="lg">
                <LangSwap k="home.hero.ctaGate" />
              </Button>
            </span>
            <span className="grid rounded-pill bg-white">
              <Button as={Link} to="/gts" variant="secondary" size="lg">
                <LangSwap k="home.hero.ctaBuild" />
              </Button>
            </span>
          </div>
        </div>
      </Container>
      {/* 하단 도트 인디케이터 · 현재 슬라이드 동기, 44px 터치 타깃(DESIGN §14) */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center pb-8">
        {SLIDES.map((n, i) => (
          <button
            key={n}
            type="button"
            aria-label={t(`home.hero.dots.d${n}`)}
            aria-current={i === active}
            onClick={() => setActive(i)}
            className="flex min-h-44 min-w-44 items-center justify-center"
          >
            <span
              aria-hidden="true"
              className={`h-8 w-8 rounded-pill transition-colors duration-fast ${
                i === active ? 'bg-white' : 'bg-white/40'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
