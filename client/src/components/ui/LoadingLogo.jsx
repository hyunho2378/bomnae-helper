// [V13] 전역 로딩 인디케이터 · 공식 로고의 부드러운 페이드 펄스(§17 · 회전 금지 · reduced-motion 정적).
//   client/public/images/brand/logo-mark.svg 사용(운영자 배치) · 파일 부재 시 기존 LogoMark(assets)로 폴백.
//   라우트 전환(RequireAuth ready 대기)·데이터 로딩(티켓 등) 공용.
import { useState } from 'react';
import LogoMark from '../../assets/logo-mark.svg?react';

export default function LoadingLogo({ size = 48, className = '', label = 'Loading' }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      role="status"
      aria-label={label}
      className={`bh-logo-pulse inline-flex items-center justify-center ${className}`}
    >
      {failed ? (
        <LogoMark style={{ width: size, height: size }} className="text-primary" aria-hidden="true" />
      ) : (
        <img
          src="/images/brand/logo-mark.svg"
          alt=""
          width={size}
          height={size}
          onError={() => setFailed(true)}
        />
      )}
      <style>{`
        .bh-logo-pulse { animation: bh-logo-pulse 1200ms ease-in-out infinite; will-change: opacity; }
        @keyframes bh-logo-pulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .bh-logo-pulse { animation: none; opacity: 1; } }
      `}</style>
    </span>
  );
}

// 중앙 정렬 풀영역 로딩(페이지·섹션 로딩 슬롯 공용)
export function LoadingLogoCenter({ className = 'min-h-[240px]' }) {
  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <LoadingLogo />
    </div>
  );
}
