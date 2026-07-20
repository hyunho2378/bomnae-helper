// 컨테이너 — DESIGN §5 캡 규칙: ~md 마진 20 / md~lg 32 / lg+ 48,
// lg~2xl 1200 / 2xl~3xl 1400 / 3xl(1920)~3840 1560 고정(콘텐츠 확장 금지).
// size 지정 시 해당 캡 고정, 미지정 시 뷰포트 자동 스텝.
const CAPS = {
  lg: 'max-w-lg',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

export default function Container({ size, children }) {
  const cap = size ? CAPS[size] : 'lg:max-w-lg 2xl:max-w-2xl 3xl:max-w-3xl';
  return (
    <div className={`mx-auto w-full px-20 md:px-32 lg:px-48 ${cap}`}>{children}</div>
  );
}
