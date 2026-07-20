// About · v3.1 신설(IA §2.8 · Pilot 페이지 흡수·대체): 브랜드 상세 롱폼.
// 섹션 순서 고정(11): 1 Brand hero / 2 Problem before / 3 Problem after / 4 What we run /
// 5 How a day works / 6 Proof(#proof · 구 Pilot 흡수) / 7 Local stories / 8 Stay longer /
// 9 Business model / 10 Sustainability and beyond / 11 CTA 밴드.
// 카피 전문은 BRAND_COPY.md → i18n brand 네임스페이스(창작·요약 금지).
import BrandHero from '../components/brand/BrandHero';
import BusinessModel from '../components/brand/BusinessModel';
import CtaBand from '../components/brand/CtaBand';
import DaySteps from '../components/brand/DaySteps';
import LocalStories from '../components/brand/LocalStories';
import ProblemCards from '../components/brand/ProblemCards';
import ProofSection from '../components/brand/ProofSection';
import StayLonger from '../components/brand/StayLonger';
import WhatWeRun from '../components/brand/WhatWeRun';
import Section from '../components/layout/Section';
import { useLang } from '../i18n/LangContext';

export default function About() {
  const { t } = useLang();
  return (
    <div>
      {/* 1 · Brand hero */}
      <BrandHero />

      {/* 2 · Problem, before you arrive(넘버링 카드 3) */}
      <ProblemCards
        id="problem-before"
        titleKey="brand.before.title"
        cardKeys={[
          'brand.before.cards.transfers',
          'brand.before.cards.luggage',
          'brand.before.cards.info',
        ]}
      />

      {/* 3 · Problem, after you arrive(넘버링 카드 3) */}
      <ProblemCards
        id="problem-after"
        titleKey="brand.after.title"
        cardKeys={[
          'brand.after.cards.lastmile',
          'brand.after.cards.queues',
          'brand.after.cards.story',
        ]}
      />

      {/* 4 · What we run(3필러) */}
      <WhatWeRun />

      {/* 5 · How a day works(단계 스트립 5) */}
      <DaySteps />

      {/* 6 · Proof(#proof · 구 Pilot 영상·지표 3·갤러리 흡수) */}
      <ProofSection />

      {/* 7 · Local stories */}
      <LocalStories />

      {/* 8 · Stay longer */}
      <StayLonger />

      {/* 9 · Business model */}
      <BusinessModel />

      {/* 10 · Sustainability and beyond */}
      <Section id="beyond" title="brand.beyond.title">
        {/* 본문 장문 · t() 직접 렌더 허용 영역(PATTERNS §1) */}
        <p className="text-h3 font-light text-inkSec">{t('brand.beyond.body')}</p>
      </Section>

      {/* 11 · CTA 밴드 */}
      <CtaBand />
    </div>
  );
}
