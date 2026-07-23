// TravelLog · [V3] 신설(/travel-log) — 체류형·재방문 장치(지시 [1]).
// 캔버스: 퇴역한 구 Loop 풀블리드 셸 재활용(absolute inset-0 지도 + 마진 안 오버레이 ·
//   Footer 숨김은 PageLayout 분기) · 지도 = TravelLogMap(구 §13 지도 코드 재활용·개명).
// 다른 여행자의 완료 여정(발자취)을 지도 위 다중 라인으로 보여주고, 카드 hover/탭 =
//   해당 라인만 강조(타 라인 40%) · 카드 클릭 = 선택 + "이 여정으로 시작" CTA →
//   applyLogTemplate(로그의 플랜·픽·동선 프리필 + routeVisited) → /gts/setup(인원 선택만) →
//   체크아웃 직행(동일 요금 로직). 데이터 = GET /api/travel-logs(실 로그 + 목업 시드 6).
// 카드 스택: 데스크탑 좌측 세로(scroll-quiet) / 모바일 하단 가로 스냅(§16.9 하단 소형 카드 문법).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TravelLogMap from '../components/map/TravelLogMap';
import TriText from '../components/gts/TriText';
import Button from '../components/ui/Button';
import { useGts } from '../context/GtsContext';
import { getTravelLogs } from '../data/gts/api';
import { venueCoord } from '../data/gts/mockCoords';
import { venues } from '../data/gts/venues';
import LangSwap from '../i18n/LangSwap';
import { useLang } from '../i18n/LangContext';
import { logShades } from '../tokens';

// [V6] 익명화 · 여행자 표기는 Traveler A/B/C…(실명·국가 노출 안 함 · 요청).
const anonLetter = (i) => (i < 26 ? String.fromCharCode(65 + i) : `#${i + 1}`);

// 로그 → 지도 라인·카드 표시 데이터 파생(알 수 없는 venue id는 제외 · 좌표는 venueCoord 상시 유효)
function hydrate(log, i) {
  const stops = log.itinerary.map((id) => venues.find((v) => v.id === id)).filter(Boolean);
  return {
    ...log,
    id: log.code,
    anon: anonLetter(i), // [V6] Traveler A/B/C…
    stops,
    coords: stops.map(venueCoord),
    color: logShades[i % logShades.length],
    // 픽 이름 요약 · 언어별 조인(TriText 계약 {en,ko,th})
    names: {
      en: stops.map((v) => v.name.en).join(' · '),
      ko: stops.map((v) => v.name.ko).join(' · '),
      th: stops.map((v) => v.name.th).join(' · '),
    },
  };
}

function LogCard({ log, active, onHover, onLeave, onSelect, onStart, compact }) {
  const { t } = useLang();
  return (
    <div
      className={`pointer-events-auto flex shrink-0 flex-col gap-8 rounded-lg bg-white p-16 text-left shadow-md transition-shadow duration-fast ${
        active ? 'ring-2 ring-primary' : ''
      } ${compact ? 'w-[260px] snap-start' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <button type="button" onClick={onSelect} className="flex flex-col items-start gap-8 text-left">
        <div className="flex w-full items-baseline justify-between gap-12">
          <span className="flex items-baseline gap-6">
            {/* 라인 컬러 도트(원색 원 + shadow · §16.1) = 지도 라인과 카드의 시각 동기 · 도트 10px(§24) */}
            <span aria-hidden="true" className="self-center rounded-pill shadow-sm" style={{ width: 10, height: 10, background: log.color }} />
            {/* [V6] 익명화 · Traveler A/B/C…(실명·국가 미표기) · t()로 활성 언어만(유령 여백 방지) */}
            <span className="font-display text-body font-bold">{`${t('travelLog.traveler')} ${log.anon}`}</span>
          </span>
          <span className="shrink-0 font-display text-caption font-semibold text-inkMeta">{log.travelDate}</span>
        </div>
        {/* 코스 요약 · 식사 플랜 + 픽 이름들 */}
        <LangSwap k={`gts.build.plan.${log.mealPlan}`} className="text-caption font-semibold text-primary" />
        <TriText text={log.names} className="text-small font-medium" clampClass={compact ? 'line-clamp-1' : 'line-clamp-2'} />
        <span className="flex items-baseline gap-4 text-caption font-medium text-inkSec">
          <LangSwap k="travelLog.partyLabel" />
          <span className="font-display font-semibold">{log.party}</span>
        </span>
      </button>
      {/* 선택된 카드만 CTA 노출(지시 [1] 로그 클릭 → CTA) */}
      {active && (
        <div className="grid">
          <Button onClick={onStart}>
            <LangSwap k="travelLog.startCta" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function TravelLog() {
  const [logs, setLogs] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const { applyLogTemplate } = useGts();
  const navigate = useNavigate();
  const { t } = useLang();

  useEffect(() => {
    let alive = true;
    getTravelLogs().then((raw) => {
      if (alive) setLogs(raw.map(hydrate).filter((l) => l.coords.length >= 2));
    });
    return () => {
      alive = false;
    };
  }, []);

  // 강조 = hover 우선, 없으면 선택 카드(탭 기기 = 선택이 곧 강조)
  const activeHighlight = highlightId ?? selectedId;

  const start = (log) => {
    applyLogTemplate(log); // 플랜·픽·동선 프리필 + routeVisited + log_template 계측
    navigate('/gts/setup');
  };

  const cards = (compact) =>
    (logs ?? []).map((log) => (
      <LogCard
        key={log.id}
        log={log}
        compact={compact}
        active={selectedId === log.id}
        onHover={() => setHighlightId(log.id)}
        onLeave={() => setHighlightId(null)}
        onSelect={() => setSelectedId((v) => (v === log.id ? null : log.id))}
        onStart={() => start(log)}
      />
    ));

  return (
    <div className="relative h-screen">
      {/* 풀블리드 맵 · 구 Loop 셸 재활용(헤더는 크롬 머티리얼로 위에 뜬다) */}
      <div className="absolute inset-0">
        {logs && <TravelLogMap logs={logs} highlightId={activeHighlight} focusId={selectedId} />}
      </div>

      <div className="pointer-events-none absolute inset-0 z-content">
        <h1 className="sr-only">{t('travelLog.title')}</h1>

        {/* 데스크탑 · 마진 안 좌측 로그 카드 스택(헤더 아래 · scroll-quiet) */}
        <div className="absolute inset-x-0 bottom-24 top-96 hidden lg:block">
          {/* Container 마진 문법 직접 적용(h-full 전파 필요 · Container는 className 미지원) */}
          <div className="mx-auto h-full w-full px-16 md:px-24 lg:max-w-lg lg:px-40 2xl:max-w-2xl 3xl:max-w-3xl">
            <div className="flex h-full w-[360px] flex-col gap-12 overflow-y-auto scroll-quiet pb-24 pr-8">
              <div className="pointer-events-auto flex flex-col gap-4 rounded-lg bg-white p-16 shadow-md">
                <LangSwap k="travelLog.title" as="p" className="font-display text-h3 font-bold" />
                <LangSwap k="travelLog.sub" as="p" className="text-caption font-medium text-inkSec" />
              </div>
              {cards(false)}
            </div>
          </div>
        </div>

        {/* 모바일 · 하단 가로 스냅 카드(§16.9 · [V17] Dock 폐지로 bottom-0 + safe-area) */}
        <div className="absolute inset-x-0 bottom-0 lg:hidden">
          <div className="flex snap-x snap-mandatory gap-12 overflow-x-auto scroll-quiet px-16 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
            {cards(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
