// RouteTimeline · v4 세로 경로 타임라인(PATTERNS §28) · 구 수평 주행 인터랙션(§12) 대체.
// ol 시맨틱 · 좌측 2px 수직 라인(colors.line) + 단계 노드(white 원 40px + shadow.sm + lucide 20px ink),
// 마지막 도착 노드만 primary 배경 + white 아이콘.
// 아이콘 매핑(§28): origin=MapPin(공항 Plane) / subway·rail=TrainFront / intercityBus=Bus /
// walk=Footprints / taxi=CarFront / arrive=Building2.
// v4.2 존 B5(§39): 노드 우측 여백에 레그별 계산 시각 표기 · 출발 노드 = 선택한 출발 시각(정확값),
// 레그 노드 = 해당 레그 도착 "HH:MM 예상"(환승 버퍼 10분 PLACEHOLDER 누적), 도착 노드 = 최종 도착
// "예상"(자정 넘김 = etaNextDay 키). durMin null(varies) 레그부터는 시각 미표기(computeLegTimes null).
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

// §39 "HH:MM 예상" 표기 · dayOffset > 0 = 다음 날 키(etaNextDay)
const Eta = ({ at }) => (
  <PlannerSwap
    k={at.dayOffset > 0 ? 'gate.planner.results.etaNextDay' : 'gate.planner.results.eta'}
    vars={{ time: at.hhmm }}
  />
);

export default function RouteTimeline({ origin, dest, legs, departHHMM, times }) {
  const legTimes = times?.legs ?? [];
  const rows = [
    {
      icon: !origin.current && origin.kind === 'airport' ? Plane : MapPin,
      // 현재 위치 출발 노드 라벨은 기존 사전 키 재사용(gate.form.currentLocation)
      title: origin.current ? (
        <LangSwap k="gate.form.currentLocation" />
      ) : (
        <PlaceText name={origin.name} />
      ),
      // 출발 시각 = 사용자가 고른 값 · 계산치가 아니므로 "예상" 라벨 없이 그대로
      time: departHHMM ?? null,
    },
    ...legs.map((leg, i) => ({
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
      // §39 레그 도착 시각 · null이면 미표기(varies 유지)
      time: legTimes[i]?.arriveAt ? <Eta at={legTimes[i].arriveAt} /> : null,
    })),
    {
      icon: Building2,
      title: <PlaceText name={dest.name} />,
      arrive: true,
      time: times?.arrival ? <Eta at={times.arrival} /> : null,
    },
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
            <div
              className={`flex min-w-0 flex-1 items-start justify-between gap-12 pt-8 ${
                isLast ? '' : 'pb-24'
              }`}
            >
              <div className="flex min-w-0 flex-col gap-4">
                <span className="text-body font-semibold">{row.title}</span>
                {row.meta && <span className="text-small text-inkSec">{row.meta}</span>}
              </div>
              {/* §39 우측 시각 슬롯(§28 우측 정렬 슬롯 재사용) · 숫자 Kanit(font-display) */}
              {row.time && (
                <span className="shrink-0 font-display text-small font-semibold">{row.time}</span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
