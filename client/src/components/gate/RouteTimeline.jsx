// RouteTimeline · v4 세로 경로 타임라인(PATTERNS §28) · 구 수평 주행 인터랙션(§12) 대체.
// ol 시맨틱 · 좌측 2px 수직 라인(colors.line) + 단계 노드(white 원 40px + shadow.sm + lucide 20px ink),
// 마지막 도착 노드만 primary 배경 + white 아이콘.
// 아이콘 매핑(§28): origin=MapPin(공항 Plane) / subway·rail=TrainFront / intercityBus=Bus /
// walk=Footprints / taxi=CarFront / arrive=Building2.
// 이동·주행 애니메이션 금지 · 진입 연출은 부모 카드 리빌(RouteOptionCard)만.
import { Building2, Bus, CarFront, Footprints, MapPin, Plane, TrainFront } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import { PlaceText, PlannerSwap } from './fieldOptions';

const MODE_ICONS = {
  rail: TrainFront,
  subway: TrainFront,
  intercityBus: Bus,
  walk: Footprints,
  taxi: CarFront,
};

export default function RouteTimeline({ origin, dest, legs }) {
  const rows = [
    {
      icon: !origin.current && origin.kind === 'airport' ? Plane : MapPin,
      // 현재 위치 출발 노드 라벨은 기존 사전 키 재사용(gate.form.currentLocation)
      title: origin.current ? (
        <LangSwap k="gate.form.currentLocation" />
      ) : (
        <PlaceText name={origin.name} />
      ),
    },
    ...legs.map((leg) => ({
      icon: MODE_ICONS[leg.mode],
      // §29 현재 위치 첫 레그: "To {최근접 승차 지점}" · 그 외 레그명은 hubs.js label 그대로(생성·보정 금지)
      title: leg.access ? (
        <PlannerSwap k="gate.planner.results.toPlace" vars={{ place: leg.toName }} />
      ) : (
        leg.label
      ),
      // durMin null = "varies" 카피(§29 소요 미상) · 그 외 "약 N분"
      meta:
        leg.durMin == null ? (
          <PlannerSwap k="gate.planner.results.varies" />
        ) : (
          <PlannerSwap k="gate.planner.results.legMin" vars={{ min: String(leg.durMin) }} />
        ),
    })),
    { icon: Building2, title: <PlaceText name={dest.name} />, arrive: true },
  ];

  return (
    <ol className="flex flex-col">
      {rows.map((row, i) => {
        const Icon = row.icon;
        const isLast = i === rows.length - 1;
        return (
          // 정적 단계 리스트 · 항목 수·순서가 렌더 간 불변이라 인덱스 키 허용
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className="flex gap-16">
            <span aria-hidden="true" className="flex flex-col items-center">
              <span
                className={`flex h-40 w-40 shrink-0 items-center justify-center rounded-pill shadow-sm ${
                  row.arrive ? 'bg-primary' : 'bg-white'
                }`}
              >
                <Icon size={20} className={row.arrive ? 'text-white' : 'text-ink'} />
              </span>
              {/* 수직 라인 2px = PATTERNS §28 명세값(스페이싱 토큰 외 · 인라인 허용 예외) */}
              {!isLast && <span className="flex-1 bg-line" style={{ width: 2 }} />}
            </span>
            <div className={`flex min-w-0 flex-1 flex-col gap-4 pt-8 ${isLast ? '' : 'pb-24'}`}>
              <span className="text-body font-semibold">{row.title}</span>
              {row.meta && <span className="text-small text-inkSec">{row.meta}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
