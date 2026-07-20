// 반복 액션 아이콘 버튼 — DESIGN §7·§8. lucide 단일, aria-label 필수,
// 데스크탑 툴팁(title), 44×44 히트영역.
import { useLang } from '../../i18n/LangContext';

export default function IconButton({ icon: Icon, label, size = 20, onClick }) {
  const { t } = useLang();
  const text = t(label);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={text}
      title={text}
      className="inline-flex h-44 w-44 items-center justify-center rounded-pill text-inkSec transition-colors duration-fast hover:text-ink"
    >
      <Icon size={size} aria-hidden="true" />
    </button>
  );
}
