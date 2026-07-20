// 필터/탭 칩 — DESIGN §7: Medium 500, caption, pill. 44px 타깃.
export default function Chip({ active = false, onClick, disabled = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex min-h-44 items-center justify-center rounded-pill border px-16 text-caption font-medium transition-colors duration-fast ${
        active ? 'border-primary text-primary' : 'border-line text-inkSec hover:text-ink'
      } ${disabled ? 'pointer-events-none opacity-40' : ''}`}
    >
      {children}
    </button>
  );
}
