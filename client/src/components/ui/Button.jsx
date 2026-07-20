// CTA 버튼 — DESIGN §7. SemiBold, pill, 높이 48(모바일)/44(데스크탑),
// hover 시 navy 전환 160ms. focus-visible은 index.css 전역 스타일.
const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-navy',
  ghost: 'bg-transparent text-primary hover:text-navy',
};

const SIZES = {
  md: 'px-24',
  lg: 'px-32',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  as: Tag = 'button',
  disabled = false,
  children,
  ...rest
}) {
  return (
    <Tag
      disabled={Tag === 'button' ? disabled : undefined}
      className={`inline-flex h-48 items-center justify-center gap-8 rounded-pill font-semibold transition-colors duration-fast lg:h-44 ${VARIANTS[variant]} ${SIZES[size]} ${disabled ? 'pointer-events-none opacity-40' : ''}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
