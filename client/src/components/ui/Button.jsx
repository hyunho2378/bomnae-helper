// CTA 버튼 · DESIGN §7 + §16.8 v3.2 버튼 페어(Apple 패턴).
// primary: primary 면+white / secondary: 투명+primary 텍스트+1.5px primary 보더(무보더 원칙의 명시적 예외 1호)
//   · hover 8% 틴트는 §16.8이 허용한 상호작용 피드백 예외(스케일상 /10 스텝 적용)
// ghost: 흐름 전진 텍스트 버튼. 폭은 텍스트+패딩으로 결정(§16.8 · 임의 고정폭 금지).
const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-navy',
  secondary: 'border-1.5 border-primary bg-transparent text-primary hover:bg-primary/10',
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
