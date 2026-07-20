// 상태 배지 — DESIGN §7. 색: 출발확정 green / 출발유력 yellow / 마감 inkMeta.
// WCAG AA(DESIGN §2·§14) 준수를 위해 green·yellow 배경 위 텍스트는 ink만 사용
// (green+white는 2.6:1로 AA 미달), closed는 surface 면 + inkMeta 텍스트.
import LangSwap from '../../i18n/LangSwap';

const STYLES = {
  confirmed: 'bg-green text-ink',
  likely: 'bg-yellow text-ink',
  closed: 'bg-surface text-inkMeta',
};

export default function StatusBadge({ status }) {
  return (
    <LangSwap
      k={`status.${status}`}
      className={`inline-flex items-center rounded-pill px-12 py-4 text-caption font-medium ${STYLES[status]}`}
    />
  );
}
