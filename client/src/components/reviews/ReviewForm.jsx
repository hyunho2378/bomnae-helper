// ReviewForm · IA §10.8 작성 폼 (존 C5 신설) — 별점 선택 + 본문 textarea + 국적 텍스트 입력 +
// 코스 FieldSelect(native select 금지). 데모 유저로 즉시 게시(부모가 세션 메모리 배열 선두 삽입).
// 본문은 현재 UI 언어를 원문 언어로 기록(리뷰 본문 = 사용자 생성 데이터 · 언어 동형 예외).
import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginGate from '../ui/LoginGate';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import FieldSelect from '../ui/FieldSelect';

// 코스 옵션 = i18n reviews.course.* 키 집합(시드 데이터와 동일 소스)
const COURSE_IDS = ['lunch2act', 'lunchDinner2act', 'lunchDinnerMix', 'none2act', 'lunchCafeAct'];

// 데모 유저 이름 → 이니셜("Demo Traveler" → "D.T.")
const initialsOf = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => `${w[0].toUpperCase()}.`)
    .join('');

export default function ReviewForm({ onPost }) {
  const { user } = useAuth();
  const [gateOpen, setGateOpen] = useState(false); // [V1] 리뷰 작성 = 로그인 필요 지점
  const { t, lang } = useLang();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [country, setCountry] = useState('');
  const [courseId, setCourseId] = useState(null);

  const canPost = body.trim().length > 0 && courseId != null;

  const submit = (e) => {
    // [V1] 비로그인 → 글래스 로그인 모달(returnTo=/reviews · OAuth 복귀 후 재작성)
    if (!user) {
      e.preventDefault();
      setGateOpen(true);
      return;
    }
    e.preventDefault();
    if (!canPost) return;
    const countryText = country.trim();
    onPost({
      id: `user-${Date.now()}`,
      rating,
      lang,
      title: null,
      body: body.trim(),
      initials: initialsOf(user?.name ?? 'Guest'),
      // 국적은 사용자 원문 그대로(자동 번역 없음) — 3언어 표기 동일
      country: countryText ? { en: countryText, ko: countryText, th: countryText } : null,
      courseKey: `reviews.course.${courseId}`,
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
      mock: false,
    });
    setRating(5);
    setBody('');
    setCountry('');
    setCourseId(null);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-16 rounded-xl bg-white p-24 shadow-sm">
      <LangSwap k="reviews.form.title" as="h2" className="text-h3 font-semibold" />

      {/* 별점 선택 · 채운 별 primary(빈 별 inkMeta) · 44px 타깃 */}
      <div className="flex flex-col gap-8">
        <LangSwap k="reviews.form.ratingLabel" className="text-small font-semibold" />
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={n <= rating}
              aria-label={`${t('reviews.form.ratingLabel')} ${n}`}
              onClick={() => setRating(n)}
              className="pressable flex min-h-44 min-w-44 items-center justify-center"
            >
              <Star
                size={24}
                aria-hidden="true"
                fill={n <= rating ? 'currentColor' : 'none'}
                className={n <= rating ? 'text-primary' : 'text-inkMeta'}
              />
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-8">
        <LangSwap k="reviews.form.bodyLabel" className="text-small font-semibold" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('reviews.form.bodyPlaceholder')}
          rows={4}
          className="rounded-md bg-surface p-16 text-body focus:ring-2 focus:ring-primary"
        />
      </label>

      <div className="grid gap-16 md:grid-cols-2">
        <label className="flex flex-col gap-8">
          <LangSwap k="reviews.form.countryLabel" className="text-small font-semibold" />
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder={t('reviews.form.countryPlaceholder')}
            className="h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary"
          />
        </label>
        <FieldSelect
          label="reviews.form.courseLabel"
          value={courseId}
          placeholder="reviews.form.coursePlaceholder"
          options={COURSE_IDS.map((id) => ({ id, primary: t(`reviews.course.${id}`) }))}
          onChange={setCourseId}
        />
      </div>

      <div className="flex">
        <Button type="submit" disabled={!canPost}>
          <LangSwap k="reviews.form.submit" />
        </Button>
      </div>
      <LoginGate open={gateOpen} onClose={() => setGateOpen(false)} returnTo="/reviews" />
    </form>
  );
}
