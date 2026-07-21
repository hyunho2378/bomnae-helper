// StickyBackBar · [I1] v4.4 신규 — About 크라우드펀딩 하단 글래스 바(§35 머티리얼 · 높이 64).
// 히어로를 지나면 등장, §15 CTA 밴드 도달 시 사라짐(IO 2개 · 진입/이탈 상태만).
// 좌: 라벨 12 600 uppercase + "₩raised of ₩goal" 14 600 / 우: primary pill "Support GTS"
//   → §12 리워드 앵커 스무스 스크롤(reduced-motion은 즉시 점프).
// blur 허용면은 §41 StepStage와 슬롯 공유(동시 표시 불가 라우트 — 중첩 없음).
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { campaign } from '../../data/about/campaign';
import LangSwap from '../../i18n/LangSwap';

const fmt = (n) => `₩${n.toLocaleString('en-US')}`;

export default function StickyBackBar({ heroEndRef, ctaBandRef }) {
  const [pastHero, setPastHero] = useState(false);
  const [atCta, setAtCta] = useState(false);

  useEffect(() => {
    const hero = heroEndRef.current;
    const cta = ctaBandRef.current;
    if (!hero || !cta) return undefined;
    const ioHero = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0));
    const ioCta = new IntersectionObserver(([e]) => setAtCta(e.isIntersecting));
    ioHero.observe(hero);
    ioCta.observe(cta);
    return () => {
      ioHero.disconnect();
      ioCta.disconnect();
    };
  }, [heroEndRef, ctaBandRef]);

  const visible = pastHero && !atCta;

  const goRewards = (e) => {
    e.preventDefault();
    document.getElementById('rewards')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  return (
    <div
      aria-hidden={!visible || undefined}
      className={`chrome fixed inset-x-0 bottom-0 z-header transition-opacity duration-fast motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex h-64 w-full max-w-lg items-center justify-between gap-16 px-16 md:px-24 lg:px-40 2xl:max-w-2xl 3xl:max-w-3xl">
        <div className="flex min-w-0 flex-col">
          <span className="text-caption font-semibold uppercase text-primary" style={{ letterSpacing: '0.06em' }}>
            <LangSwap k="brand.crowd.sticky.label" />
          </span>
          <p className="truncate text-small font-semibold text-ink">
            {fmt(campaign.raised)} <LangSwap k="brand.crowd.sticky.of" /> {fmt(campaign.goal)}
          </p>
        </div>
        <Button as="a" href="#rewards" onClick={goRewards}>
          <LangSwap k="brand.crowd.sticky.cta" />
        </Button>
      </div>
    </div>
  );
}
