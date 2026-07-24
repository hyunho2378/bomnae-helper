// Pagination · [H2-11] 숫자 원형 인디케이터(전 카드 그리드 공통 — IA §10.4 페어 규정 대체).
// 원 36px · 현재 = primary 배경 white 700 / 나머지 = white 면 ink 600 + shadow.sm.
// 숫자 클릭 = 해당 페이지 직행 · 키보드 ←→ 이동 유지.
import LangSwap from '../../i18n/LangSwap';

export default function Pagination({ page, pages, onSelect, labelKey = 'common.pagination' }) {
  if (pages <= 1) return null;

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft' && page > 0) {
      e.preventDefault();
      onSelect(page - 1);
    } else if (e.key === 'ArrowRight' && page < pages - 1) {
      e.preventDefault();
      onSelect(page + 1);
    }
  };

  return (
    <nav aria-label="pagination" onKeyDown={onKeyDown} className="flex items-center gap-4">
      <LangSwap k={labelKey} className="sr-only" />
      {Array.from({ length: pages }, (_, i) => (
        // [V22] 터치 타겟 36px 유지(button) · 시각 원은 30px로 축소(무스크롤·경량화) · gap 8→4
        <button
          key={i}
          type="button"
          aria-current={i === page ? 'page' : undefined}
          onClick={() => onSelect(i)}
          style={{ width: 36, height: 36 }}
          className="pressable inline-flex items-center justify-center rounded-pill"
        >
          <span
            style={{ width: 30, height: 30 }}
            className={`inline-flex items-center justify-center rounded-pill font-display text-caption ${
              i === page ? 'bg-primary font-bold text-white' : 'bg-white font-semibold text-ink shadow-sm'
            }`}
          >
            {i + 1}
          </span>
        </button>
      ))}
    </nav>
  );
}
