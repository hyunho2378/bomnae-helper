// GateJourney · v3.1 시그니처 인터랙션(PATTERNS §12, IA §2.2.1).
// 좌 Plane 원형 배지(surface bg, shadow sm) + 2px 트랙(colors.line) + 우 Building2 배지.
// 모드별 TrainFront/Bus 아이콘(28px primary)이 left 애니메이션 8s linear 무한 주행,
// reduced-motion 시 중앙 정지(GateJourney.css). 모드 카드 선택과 단일 state로 동기(부모 state).
// 장식 모션 그래픽 · 정보는 옵션 카드가 전달하므로 전체 aria-hidden.
import { Building2, Bus, Plane, TrainFront } from 'lucide-react';
import './GateJourney.css';

export default function GateJourney({ mode = 'rail' }) {
  const Vehicle = mode === 'bus' ? Bus : TrainFront;
  return (
    <div aria-hidden="true" className="flex items-center gap-16">
      <span className="flex h-48 w-48 shrink-0 items-center justify-center rounded-pill bg-surface shadow-sm">
        <Plane size={24} className="text-inkSec" />
      </span>
      <span className="relative flex-1">
        {/* 트랙 높이 2px = PATTERNS §12 명세값(스페이싱 토큰 외 · 인라인 허용 예외) */}
        <span className="block w-full bg-line" style={{ height: 2 }} />
        <span className="bh-journey-vehicle text-primary">
          {/* 28px = PATTERNS §12 명세값(아이콘 5단계 스케일의 문서화 예외) */}
          <Vehicle size={28} />
        </span>
      </span>
      <span className="flex h-48 w-48 shrink-0 items-center justify-center rounded-pill bg-surface shadow-sm">
        <Building2 size={24} className="text-inkSec" />
      </span>
    </div>
  );
}
