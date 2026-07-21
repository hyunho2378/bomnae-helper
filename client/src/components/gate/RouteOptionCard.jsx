// 경로 옵션 카드 · v4 존 B4: props {option}(planRoutes lookupRoutes 조회 결과 전용 · §29).
// 구 계약({option, selected, onSelect} · 요금·환승·첫 탑승 편)은 v4에서 폐지:
// 시각·요금 표기 금지, "약 N분"(durMin 합) + 배차 카피(headwayNote 사전 키)만.
// 선택 상태 없음 · 타임라인 전부 펼침(§16.10 다크패턴 금지: 정보를 클릭 뒤에 숨기지 않는다).
// 진입 연출 = 카드 리빌 0.96→1.0(PATTERNS §8 · scale 화이트리스트)만 · 주행 애니메이션 금지(§28).
import { useEffect, useRef, useState } from 'react';
import LangSwap from '../../i18n/LangSwap';
import { motion } from '../../tokens';
import RouteTimeline from './RouteTimeline';
import { PlannerSwap } from './fieldOptions';

export default function RouteOptionCard({ option }) {
  const [revealed, setRevealed] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    // reduced-motion: 관찰 없이 즉시 표시(PATTERNS §8)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return undefined;
    }
    const node = cardRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      style={{
        opacity: revealed ? 1 : 0,
        // 카드 리빌 0.96→1.0 · scale 화이트리스트(PATTERNS §8, DESIGN §10) · 240ms 명세값
        transform: revealed ? 'none' : 'scale(0.96)',
        // 진입 리빌 = easeOut(§17.2)
        transition: `opacity 240ms ${motion.easeOut}, transform 240ms ${motion.easeOut}`,
      }}
      className="rounded-lg bg-white p-24 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-16">
        <div className="flex flex-col gap-4">
          <LangSwap k={`gate.planner.routeKind.${option.kind}`} as="h3" className="text-h3 font-semibold" />
          {/* 배차 카피 = hubs.js headwayNote 사전 키 그대로(구체 시각·횟수 생성 금지 · §29) */}
          <LangSwap k={option.headwayNote} as="p" className="text-small text-inkSec" />
        </div>
        {/* 총 소요 "약 N분" = 템플릿 durMin 합(§29) · 큰 숫자 Kanit Bold(DESIGN §4) */}
        <span className="font-display text-h3 font-bold">
          <PlannerSwap k="gate.planner.results.totalApprox" vars={{ min: String(option.totalMin) }} />
        </span>
      </div>
      <div className="mt-24">
        <RouteTimeline origin={option.origin} dest={option.dest} legs={option.legs} />
      </div>
    </article>
  );
}
