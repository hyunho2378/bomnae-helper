// Reviews · IA §10.8 — 스텁(존 C5 BUILDER-PAY가 확장한다 · 교체 아님).
// 카드 그리드(별점·국적·코스·좋아요)·정렬 토글·작성 폼 · 시드 data/reviews.js.
import Container from '../components/layout/Container';
import LangSwap from '../i18n/LangSwap';

export default function Reviews() {
  return (
    <Container>
      <div className="flex flex-col gap-24 pb-64 pt-96">
        <LangSwap k="meta.title.reviews" as="h1" className="text-h1 font-bold" />
      </div>
    </Container>
  );
}
