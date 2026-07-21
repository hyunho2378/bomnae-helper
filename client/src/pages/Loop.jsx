// DEPRECATED v4(IA §9.0) — 구 City Lines·Bag Delivery 잠정 퇴역: 라우트에서 제거됨. 삭제 금지, 재활용 예정.
// Loop(City Lines) · 시그니처 화면 v3.2(IA §8.3 · DESIGN §16.9):
// 초기 지도 = 라인·정류장·셔틀 비노출 + POI 앵커만. 지도 좌상 라인 칩 3개(§24)가 유일한
// 라인 진입점 · 칩 선택 시에만 draw-on·마커·셔틀 등장, 재클릭·Escape 해제.
// 정류장 hover 즉시 StopPopup(mouseenter 표시 · leave 200ms 유지 후 닫힘 · 터치 = 탭 동등).
// 글래스 카드 스택은 선택 라인의 정류장 리스트로 전환(LinePanel · scroll-quiet).
// POI 클릭 → 관련 라인 칩 하이라이트. LinePreviewOverlay(라우팅 없는 미리보기) 유지.
// /gate 도착 모달 승인 시 location.state.transition === true → GateToLinesTransition(§22).
// Footer 숨김은 셸(PageLayout)이 처리.
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLines, getStops } from '../data/api';
import Container from '../components/layout/Container';
import GateToLinesTransition from '../components/loop/GateToLinesTransition';
import LineChips from '../components/loop/LineChips';
import LinePanel from '../components/loop/LinePanel';
import LinePreviewOverlay from '../components/loop/LinePreviewOverlay';
import LoopMap from '../components/map/LoopMap';
import LangSwap from '../i18n/LangSwap';

const LINE_IDS = ['potato', 'dakgalbi', 'lake'];
const HOVER_CLOSE_MS = 200; // §16.9 명세값 · mouseleave 후 팝업 유지 시간
const POI_FLASH_MS = 1600; // POI 칩 하이라이트 유지(짧은 주의 환기 · §16.9)

export default function Loop() {
  const location = useLocation();
  const navigate = useNavigate();
  const [lines, setLines] = useState(null);
  const [stopsByLine, setStopsByLine] = useState(null);
  const [selectedLineId, setSelectedLineId] = useState(null); // 칩 = 유일한 라인 진입점
  const [focusStopId, setFocusStopId] = useState(null);
  const [popupStopId, setPopupStopId] = useState(null); // StopPopup · hover/클릭 공용
  const [previewLineId, setPreviewLineId] = useState(null); // LinePreviewOverlay
  const [poiFlash, setPoiFlash] = useState(null); // POI 클릭 → 칩 하이라이트
  const hoverTimer = useRef(0);
  const flashTimer = useRef(0);
  // 도착 전환 연출(§22) · B2 ArrivalModal이 navigate('/loop', { state:{ transition:true } })
  const [transitionOn, setTransitionOn] = useState(location.state?.transition === true);
  // 이미 /loop에 머무는 중 state만 갱신되는 진입(재방문 내비게이션)도 재생
  useEffect(() => {
    if (location.state?.transition === true) setTransitionOn(true);
  }, [location.state]);

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
      clearTimeout(hoverTimer.current);
      clearTimeout(flashTimer.current);
    };
  }, []);

  // 칩 선택 · 재클릭/Escape 해제는 LineChips가 null 전달(§24)
  const onSelectLine = (lineId) => {
    clearTimeout(hoverTimer.current);
    setPopupStopId(null);
    setFocusStopId(null);
    setSelectedLineId(lineId);
  };

  // 정류장 선택(클릭·리스트) · 카메라 포커스 + 팝업 고정
  const onSelectStop = (stop) => {
    clearTimeout(hoverTimer.current);
    setFocusStopId(stop.id);
    setPopupStopId(stop.id);
  };

  // hover 즉시 팝업(§16.9) · leave 후 200ms 유지, 팝업 위 진입 시 유지 지속
  const onHoverStop = (stop) => {
    clearTimeout(hoverTimer.current);
    setPopupStopId(stop.id);
  };
  const scheduleHoverClose = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setPopupStopId(null), HOVER_CLOSE_MS);
  };
  const cancelHoverClose = () => clearTimeout(hoverTimer.current);

  // 미리보기 오픈 · 팝업은 닫는다(Escape 대상이 오버레이 하나가 되도록)
  const onViewLine = (lineId) => {
    clearTimeout(hoverTimer.current);
    setPopupStopId(null);
    setPreviewLineId(lineId);
  };

  // POI 앵커 클릭 · 관련 라인 칩 하이라이트(§16.9 · 선택이 아니라 주의 환기)
  const onPoiSelect = (lineId) => {
    clearTimeout(flashTimer.current);
    setPoiFlash(lineId);
    flashTimer.current = setTimeout(() => setPoiFlash(null), POI_FLASH_MS);
  };

  // 전환 연출 종료 · history state 소거(replace · §22)
  const onTransitionDone = () => {
    setTransitionOn(false);
    navigate(location.pathname + location.search, { replace: true });
  };

  const selectedLine = selectedLineId && lines ? lines.find((l) => l.id === selectedLineId) : null;
  const selectedStops = selectedLineId && stopsByLine ? stopsByLine[selectedLineId] ?? [] : [];

  return (
    <div className="relative h-screen">
      {/* 풀블리드 맵(허용 3곳 중 1 · DESIGN §5). 헤더는 불투명면으로 위에 뜬다(DESIGN §6). */}
      <div className="absolute inset-0">
        <LoopMap
          selectedLineId={selectedLineId}
          focusStopId={focusStopId}
          popupStopId={popupStopId}
          onSelectStop={onSelectStop}
          onHoverStop={onHoverStop}
          onHoverLeave={scheduleHoverClose}
          onPopupEnter={cancelHoverClose}
          onPopupLeave={scheduleHoverClose}
          onClosePopup={() => setPopupStopId(null)}
          onViewLine={onViewLine}
          onPoiSelect={onPoiSelect}
        />
      </div>

      {/* 지도 위 UI 오버레이 · 컨테이너 마진 안(§24) */}
      <div className="pointer-events-none absolute inset-0 z-content">
        {/* 페이지 제목·힌트(스크린리더 전용 · 시각 UI는 칩·패널) */}
        <h1 className="sr-only">
          <LangSwap k="loop.title" />
        </h1>
        <p className="sr-only">
          <LangSwap k="loop.chips.hint" />
        </p>

        {/* 라인 칩 · 지도 좌상, 헤더(80) 아래 16px = top-96(§24) */}
        <div className="absolute inset-x-0 top-96">
          <Container>
            {lines ? (
              <LineChips
                lines={lines}
                selectedId={selectedLineId}
                flashId={poiFlash}
                onSelect={onSelectLine}
              />
            ) : null}
          </Container>
        </div>

        {/* 선택 라인의 정류장 리스트(§8.3.2) · 미선택 시 지도만(초기 상태) */}
        {selectedLine && stopsByLine && (
          <LinePanel
            line={selectedLine}
            stops={selectedStops}
            focusStopId={focusStopId}
            onSelectStop={onSelectStop}
            onViewLine={onViewLine}
          />
        )}
      </div>

      {/* 라우팅 없는 라인 미리보기(IA §2.4.4 · PATTERNS §14) */}
      {previewLineId && lines && stopsByLine && (
        <LinePreviewOverlay
          line={lines.find((l) => l.id === previewLineId)}
          stops={stopsByLine[previewLineId] ?? []}
          onClose={() => setPreviewLineId(null)}
        />
      )}

      {/* Gate→Lines 전환 연출(§22) · 850ms 이내 · Escape 스킵 · reduced-motion 즉시 */}
      {transitionOn && <GateToLinesTransition onDone={onTransitionDone} />}
    </div>
  );
}
