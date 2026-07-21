// Reviews · IA §10.8 (존 C5 확장) — 시드 12개(data/reviews.js · 전부 mock:true) + 세션 메모리.
// 카드 그리드(별점 primary 채운 별 · 작성자 이니셜+국가명 · 코스 · 날짜 · 좋아요) ·
// 정렬 토글(최신순/좋아요순 Chip 페어) · 좋아요 = 세션 메모리 증가 + 중복 방지 토글 ·
// 작성 폼 → 데모 유저로 즉시 게시(세션 메모리 배열 선두 삽입 · localStorage 금지).
// 리뷰 본문은 원문 그대로(언어 동형 예외) — UI 크롬만 3언어. v3.2 컨테이너 확폭 실사용(§10.4).
import { useMemo, useState } from 'react';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewForm from '../components/reviews/ReviewForm';
import Container from '../components/layout/Container';
import Chip from '../components/ui/Chip';
import { seedReviews } from '../data/reviews';
import LangSwap from '../i18n/LangSwap';

export default function Reviews() {
  const [reviews, setReviews] = useState(seedReviews);
  const [likedIds, setLikedIds] = useState(() => new Set());
  const [sort, setSort] = useState('latest');

  const sorted = useMemo(() => {
    const list = [...reviews];
    if (sort === 'likes') list.sort((a, b) => b.likes - a.likes);
    else list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return list;
  }, [reviews, sort]);

  // 좋아요 · 세션 메모리 증가 + 중복 방지 토글(§10.8)
  const toggleLike = (id) => {
    const isLiked = likedIds.has(id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(id);
      else next.add(id);
      return next;
    });
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, likes: r.likes + (isLiked ? -1 : 1) } : r)));
  };

  return (
    <Container>
      <div className="flex flex-col gap-32 pb-64 pt-96">
        <div className="flex flex-col gap-8">
          <LangSwap k="reviews.title" as="h1" className="text-h1 font-bold tracking-display" />
          <LangSwap k="reviews.sub" as="p" className="text-body text-inkSec" />
        </div>

        {/* 작성 폼 · 즉시 게시 = 배열 선두 삽입(§10.8) */}
        <ReviewForm onPost={(review) => setReviews((rs) => [review, ...rs])} />

        {/* 정렬 토글 · 최신순/좋아요순 Chip 페어(§10.8) */}
        <div className="flex items-center gap-8">
          <Chip active={sort === 'latest'} onClick={() => setSort('latest')}>
            <LangSwap k="reviews.sortLatest" />
          </Chip>
          <Chip active={sort === 'likes'} onClick={() => setSort('likes')}>
            <LangSwap k="reviews.sortLikes" />
          </Chip>
        </div>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24 xl:grid-cols-3">
          {sorted.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              liked={likedIds.has(review.id)}
              onLike={() => toggleLike(review.id)}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
