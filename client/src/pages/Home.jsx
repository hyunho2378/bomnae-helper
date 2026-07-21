// Home · v4.2 존 B5 재건(IA §10.2 섹션 순서 고정):
// ①Hero(캐러셀 + BRAND_COPY §12 카피 + CTA 페어) ②서비스 진입 카드 2장 ③How it works(GTS 기준 재작성)
// ④Reviews 스트립(상위 3 미리보기) ⑤Proof 스트립(→/about#proof) ⑥Footer(셸이 렌더).
// 삭제(§10.2): "4/5 리서처" 스탯 스트립 · 시내 라인 3장 섹션 · 홈 미니 플래너 폼 · 구 시내 라인 링크 전부.
import Section from '../components/layout/Section';
import HeroCarousel from '../components/home/HeroCarousel';
import HowItWorks from '../components/home/HowItWorks';
import PilotStrip from '../components/home/PilotStrip';
import ReviewsStrip from '../components/home/ReviewsStrip';
import ServiceCards from '../components/home/ServiceCards';

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <Section id="services" eyebrow="home.services.eyebrow" title="home.services.title">
        <ServiceCards />
      </Section>
      <Section id="how-it-works" eyebrow="home.how.eyebrow" title="home.how.title">
        <HowItWorks />
      </Section>
      <Section id="reviews" eyebrow="home.reviews.eyebrow" title="home.reviews.title">
        <ReviewsStrip />
      </Section>
      <Section id="proof" eyebrow="home.proof.eyebrow" title="home.proof.title">
        <PilotStrip />
      </Section>
    </>
  );
}
