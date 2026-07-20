// 로딩 스켈레톤 · surface 배경 펄스, reduced-motion 시 정지 (PATTERNS §6).
export default function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-surface motion-reduce:animate-none ${className}`}
    />
  );
}
