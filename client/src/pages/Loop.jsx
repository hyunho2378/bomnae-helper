// Loop — 시그니처 화면(IA §2.4): 풀블리드 LoopMap + LinePanel.
// 데스크탑 = 좌측 일반 white 패널(글래스 아님 — blur 예산 초과 금지) 360px,
// 모바일 = 하단 시트형 고정 리스트. 패널↔지도 양방향 선택. Footer 숨김은 셸(PageLayout)이 처리.
import { useEffect, useState } from 'react';
import { getLines, getStops } from '../data/api';
import LinePanel from '../components/loop/LinePanel';
import LoopMap from '../components/map/LoopMap';
import Skeleton from '../components/ui/Skeleton';

const LINE_IDS = ['potato', 'dakgalbi', 'lake'];

export default function Loop() {
  const [lines, setLines] = useState(null);
  const [stopsByLine, setStopsByLine] = useState(null);
  const [focus, setFocus] = useState({ lineId: null, stopId: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      const [lineList, ...stopLists] = await Promise.all([
        getLines(),
        ...LINE_IDS.map((id) => getStops(id)),
      ]);
      if (!alive) return;
      setLines(lineList);
      setStopsByLine(Object.fromEntries(LINE_IDS.map((id, i) => [id, stopLists[i]])));
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 라인 탭: 재선택 시 해제(전체 보기 복귀). 정류장 선택: 라인+정류장 동시 포커스.
  const onSelectLine = (lineId) =>
    setFocus((f) => (f.lineId === lineId && !f.stopId ? { lineId: null, stopId: null } : { lineId, stopId: null }));
  const onSelectStop = (lineId, stopId) => setFocus({ lineId, stopId });

  return (
    <div className="relative h-screen">
      {/* 풀블리드 맵(허용 3곳 중 1 — DESIGN §5). 헤더는 투명 오버레이로 위에 뜬다. */}
      <div className="absolute inset-0">
        <LoopMap
          focusLineId={focus.lineId}
          focusStopId={focus.stopId}
          onSelectStop={(stop) => onSelectStop(stop.line_id, stop.id)}
        />
      </div>

      {/* 라인 패널 — 지도 대체 접근 경로(키보드 완전 지원).
          모바일: 하단 시트형 고정 리스트(내부 스크롤, GlassDock 여백 pb-96),
          데스크탑: 좌측 white 패널. 360px는 IA §2.4 명세 고정 폭(브래킷 허용 예외). */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 overflow-y-auto rounded-t-lg border-t border-line bg-white pb-96 lg:inset-x-auto lg:left-0 lg:top-0 lg:h-full lg:w-[360px] lg:rounded-none lg:border-r lg:border-t-0 lg:pb-0 lg:pt-80"
      >
        {lines && stopsByLine ? (
          <LinePanel
            lines={lines}
            stopsByLine={stopsByLine}
            focusLineId={focus.lineId}
            focusStopId={focus.stopId}
            onSelectLine={onSelectLine}
            onSelectStop={onSelectStop}
          />
        ) : (
          <div className="flex flex-col gap-12 p-20 lg:p-24">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
