// 경로 옵션 카드 · v4 존 B4: props {option}(planRoutes lookupRoutes 조회 결과 전용 · §29).
// v4.2 존 B5(§39): + departHHMM(TimeWheel 제출 값) · computeLegTimes로 레그별 누적 시각을 계산해
// 헤더 우측(도착 "예상")과 타임라인 노드 우측에 표기 · durMin 합산일 뿐 시간표 생성 아님.
// 요금·환승·첫 탑승 편 표기 금지 유지 · "약 N분"(durMin 합) + 배차 카피(headwayNote 사전 키).
// 선택 상태 없음 · 타임라인 전부 펼침(§16.10 다크패턴 금지: 정보를 클릭 뒤에 숨기지 않는다).
// 진입 연출 = 카드 리빌 0.96→1.0(PATTERNS §8 · scale 화이트리스트)만 · 주행 애니메이션 금지(§28).
import { useEffect, useRef, useState } from 'react';
import LangSwap from '../../i18n/LangSwap';
import { motion } from '../../tokens';
import RouteTimeline from './RouteTimeline';
import { PlannerSwap } from './fieldOptions';
import { computeLegTimes } from './planRoutes';

// [G1] /api/transit live 분기(명세 5-③ · 분기 파일 1곳) — live면 실시각 편 표기, fallback이면 기존 추정 유지.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
// option.id = `${direction}-${from}-${to}`(planRoutes) → 허브 id 복원(허브 id에 '-' 포함 주의)
const parseHubs = (option) => {
  const rest = option.id.replace(/^(to|from)-/, '');
  const m = rest.match(/^(.+)-(chuncheon-(?:station|terminal))$/);
  if (!m) return null;
  const [, hub, point] = m;
  return option.direction === 'to' ? { from: hub, to: point } : { from: point, to: hub };
};
// live 지원 조합만 조회(§29 템플릿 중 단일 수단 직행): rail=용산·상봉↔춘천역 / bus=동서울↔춘천터미널
const liveEndpoint = (option) => {
  const hubs = parseHubs(option);
  if (!hubs) return null;
  const ids = [hubs.from, hubs.to];
  if (option.kind === 'rail' && ids.every((id) => ['yongsan', 'sangbong', 'chuncheon-station'].includes(id)))
    return { path: 'train', ...hubs };
  if (option.kind === 'bus' && ids.every((id) => ['dongseoul', 'chuncheon-terminal'].includes(id)))
    return { path: 'bus', ...hubs };
  return null;
};

export default function RouteOptionCard({ option, departHHMM }) {
  const [revealed, setRevealed] = useState(false);
  const [live, setLive] = useState(null); // { rows } — 서버 live 응답 시에만
  const cardRef = useRef(null);

  // live 시각 조회 · fallback/실패/비지원 조합은 조용히 기존 추정 유지(라벨 불변)
  useEffect(() => {
    const ep = liveEndpoint(option);
    if (!ep) return undefined;
    const ac = new AbortController();
    fetch(`${API_BASE}/api/transit/${ep.path}?from=${ep.from}&to=${ep.to}`, {
      credentials: 'include',
      signal: ac.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.source === 'live' && json.rows?.length) setLive(json);
      })
      .catch(() => {
        /* fallback 유지 */
      });
    return () => ac.abort();
  }, [option]);
  // §39 레그별 누적 시각 · departHHMM 미전달 방어(그 경우 시각 미표기)
  const times = departHHMM
    ? computeLegTimes(departHHMM, option.legs)
    : { legs: [], arrival: null };

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
        <div className="flex flex-col items-end gap-4">
          {/* 총 소요 "약 N분" = 템플릿 durMin 합(§29) · 큰 숫자 Kanit Bold(DESIGN §4) */}
          <span className="font-display text-h3 font-bold">
            <PlannerSwap k="gate.planner.results.totalApprox" vars={{ min: String(option.totalMin) }} />
          </span>
          {/* §39 도착 시각 · "예상" 라벨 필수 · 자정 넘김은 다음 날 표기 */}
          {times.arrival && (
            <span className="font-display text-small font-semibold text-primary">
              <PlannerSwap
                k={times.arrival.dayOffset > 0 ? 'gate.planner.results.etaNextDay' : 'gate.planner.results.eta'}
                vars={{ time: times.arrival.hhmm }}
              />
            </span>
          )}
        </div>
      </div>
      <div className="mt-24">
        <RouteTimeline
          origin={option.origin}
          dest={option.dest}
          legs={option.legs}
          departHHMM={departHHMM}
          times={times}
        />
      </div>
      {/* [G1] live 배차 · TAGO 실시각(당일) — "LIVE"는 언어 불변 상태 라벨(§16.7 연출 카피 예외 선례),
          시각·등급·요금은 API 데이터. fallback이면 이 블록 자체가 렌더되지 않는다(기존 추정 유지). */}
      {live && (
        <div className="mt-16 flex flex-col gap-8">
          <span className="font-display text-caption font-semibold uppercase tracking-eyebrow text-primary">
            LIVE
          </span>
          <ul className="flex flex-wrap gap-x-24 gap-y-4">
            {live.rows.slice(0, 3).map((row) => (
              <li key={`${row.depTime}-${row.arrTime}`} className="flex items-baseline gap-8">
                <span className="font-display text-small font-semibold">
                  {row.depTime} - {row.arrTime}
                </span>
                {(row.trainType || row.grade) && (
                  <span className="text-caption font-medium text-inkSec">{row.trainType || row.grade}</span>
                )}
                {row.fare != null && (
                  <span className="font-display text-caption font-medium text-inkSec">
                    {'₩'}
                    {row.fare.toLocaleString('en-US')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
