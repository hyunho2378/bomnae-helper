// ReviewCard · IA §10.8 (존 C5 신설).
// 별점 = lucide Star 채움 fill primary(빈 별은 스트로크 inkMeta · DESIGN §8 아이콘 색 토큰).
// 본문·제목은 작성 언어 원문 그대로(언어 동형 원칙의 명시 예외) — lang 속성만 부여,
//   작성자 이니셜 + 국가명 텍스트(국기 이모지 금지) · 이용 코스(courseKey) · 날짜 · 좋아요.
import { Heart, Star } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import TriText from '../gts/TriText';

function Stars({ rating }) {
  return (
    // 숫자 표기라 언어 중립 · role img로 묶어 별 5개를 한 값으로 읽힘
    <span className="flex items-center gap-4" role="img" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          aria-hidden="true"
          fill={n <= rating ? 'currentColor' : 'none'}
          className={n <= rating ? 'text-primary' : 'text-inkMeta'}
        />
      ))}
    </span>
  );
}

export default function ReviewCard({ review, liked, onLike }) {
  const { t } = useLang();
  return (
    <article className="flex min-w-0 flex-col gap-12 rounded-lg bg-white p-16 shadow-sm md:p-24">
      {/* [H1] flex-wrap: 320 2열(§18.2)에서 별점+날짜가 카드 폭을 밀어내던 사고 수리 */}
      <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-4">
        <Stars rating={review.rating} />
        <span className="font-display text-caption font-medium text-inkMeta">{review.date}</span>
      </div>
      {review.title && (
        <p lang={review.lang} className="text-body font-bold">
          {review.title}
        </p>
      )}
      <p lang={review.lang} className="text-small text-inkSec">
        {review.body}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-12 pt-4">
        <span className="flex min-w-0 items-baseline gap-8">
          <span className="font-display text-small font-semibold">{review.initials}</span>
          {review.country && (
            <TriText text={review.country} className="text-caption font-medium text-inkMeta" />
          )}
        </span>
        <LangSwap k={review.courseKey} className="text-caption font-medium text-inkMeta" />
      </div>
      <div className="flex">
        {/* 좋아요 · 세션 메모리 증가 + 중복 방지 토글(§10.8) */}
        <button
          type="button"
          aria-pressed={liked}
          aria-label={t('reviews.like')}
          onClick={onLike}
          className={`pressable inline-flex min-h-44 items-center gap-8 rounded-pill bg-surface px-16 ${
            liked ? 'text-primary' : 'text-inkSec'
          }`}
        >
          <Heart size={16} aria-hidden="true" fill={liked ? 'currentColor' : 'none'} />
          <span className="font-display text-small font-semibold">{review.likes}</span>
        </button>
      </div>
    </article>
  );
}
