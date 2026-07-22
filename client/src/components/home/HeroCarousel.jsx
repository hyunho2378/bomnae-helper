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
          {/* CTA 페어 재구축 · 두 버튼은 동일 컴포넌트(Button size="lg")로 대칭 · 차이는 라벨·variant·목적지뿐.
              래퍼가 배치를 소유(flex gap-12 items-stretch): 개별 버튼에 margin·width·align 금지 → 크기는 컴포넌트,
              폭은 내용 기반, 높이는 stretch로 항상 동일. box-border라 secondary 1.5px 보더는 안쪽(높이 불변).
              secondary white 배경은 래퍼 pill이 제공(전역 secondary=투명 유지 · 사진·스크림 위 가독). */}
          {/* whitespace-nowrap: flex 축소맞춤이 LangSwap 셀을 min-content(공백 있는 EN이 CJK 폭으로 붕괴)로
              줄여 라벨이 2줄 래핑되던 사고 수리 — 각 언어가 최장 1줄 폭을 확보해 높이 동일 보장(래핑 0). */}
          {/* flex-wrap: LangSwap는 폭을 최장 언어(태국어)로 고정 → 두 버튼이 좁은 폭(390 등)에서 한 줄에
              안 들어가면 가로 스크롤 대신 세로로 접힘. 접혀도 각 버튼 높이·좌측 정렬·무래핑 유지. */}
          <div className="mt-32 flex w-fit flex-wrap items-stretch gap-12">
            <span className="grid">
              <Button as={Link} to="/gate" size="lg">
                <LangSwap k="home.hero.ctaGate" className="whitespace-nowrap" />
              </Button>
            </span>
            <span className="grid rounded-pill bg-white">
              <Button as={Link} to="/gts" variant="secondary" size="lg">
                <LangSwap k="home.hero.ctaBuild" className="whitespace-nowrap" />
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
