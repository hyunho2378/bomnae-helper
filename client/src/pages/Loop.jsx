// Loop · 시그니처 화면(IA §2.4 v3.1): 풀블리드 LoopMap + 지도 위 글래스 라인 카드(LinePanel)
// + StopPopup(동시 1개) + LinePreviewOverlay(라우팅 없는 미리보기).
// 사이드 컬럼 폐지 · 카드가 지도 대체 접근 경로(키보드 완전 지원).
// Footer 숨김은 셸(PageLayout)이 처리.
import { useEffect, useState } from 'react';
import { getLines, getStops } from '../data/api';
import LinePanel from '../components/loop/LinePanel';
import LinePreviewOverlay from '../components/loop/LinePreviewOverlay';
import LoopMap from '../components/map/LoopMap';
import Skeleton from '../components/ui/Skeleton';

const LINE_IDS = ['potato', 'dakgalbi', 'lake'];

export default function Loop() {
  const [lines, setLines] = useState(null);
  const [stopsByLine, setStopsByLine] = useState(null);
  const [focus, setFocus] = useState({ lineId: null, stopId: null });
  const [popupStopId, setPopupStopId] = useState(null); // StopPopup · 카메라 포커스와 분리
  const [previewLineId, setPreviewLineId] = useState(null); // LinePreviewOverlay

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

  // 라인 탭: 재선택 시 해제(전체 보기 복귀). 정류장 선택: 라인+정류장 포커스 + 팝업.
  const onSelectLine = (lineId) => {
    setPopupStopId(null);
    setFocus((f) =>
      f.lineId === lineId && !f.stopId ? { lineId: null, stopId: null } : { lineId, stopId: null },
    );
  };
  const onSelectStop = (lineId, stopId) => {
    setFocus({ lineId, stopId });
    setPopupStopId(stopId);
  };
  // 미리보기 오픈 · 팝업은 닫는다(Escape 대상이 오버레이 하나가 되도록)
  const onViewLine = (lineId) => {
    setPopupStopId(null);
    setPreviewLineId(lineId);
  };

  return (
    <div className="relative h-screen">
      {/* 풀블리드 맵(허용 3곳 중 1 · DESIGN §5). 헤더는 불투명면으로 위에 뜬다(DESIGN §6). */}
      <div className="absolute inset-0">
        <LoopMap
          focusLineId={focus.lineId}
          focusStopId={focus.stopId}
          popupStopId={popupStopId}
          onSelectStop={(stop) => onSelectStop(stop.line_id, stop.id)}
          onClosePopup={() => setPopupStopId(null)}
          onViewLine={onViewLine}
        />
      </div>

      {/* 지도 위 글래스 라인 카드 · 컨테이너 마진 안(IA §2.4 v3.1) */}
      {lines && stopsByLine ? (
        <LinePanel
          lines={lines}
          stopsByLine={stopsByLine}
          focusLineId={focus.lineId}
          focusStopId={focus.stopId}
          onSelectLine={onSelectLine}
          onSelectStop={onSelectStop}
          onViewLine={onViewLine}
        />
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-content flex gap-16 px-20 pb-96 md:px-32 lg:inset-y-0 lg:right-auto lg:w-[340px] lg:flex-col lg:px-48 lg:pb-24 lg:pt-96">
          {/* 340px = IA §2.4 카드 스택 폭 명세값(로딩 스켈레톤 동일 폭) */}
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {/* 라우팅 없는 라인 미리보기(IA §2.4.4 · PATTERNS §14) */}
      {previewLineId && lines && stopsByLine && (
        <LinePreviewOverlay
          line={lines.find((l) => l.id === previewLineId)}
          stops={stopsByLine[previewLineId] ?? []}
          onClose={() => setPreviewLineId(null)}
        />
      )}
    </div>
  );
}
