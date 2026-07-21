// Gate 플래너 폼 · v4 존 B4(IA §9.2 양방향 위치 기반 플래너).
// 방향 토글 2탭(Chip 재사용): 탭 전환은 출발·도착 필드의 역할만 반전 · DOM 구조·요소 수·순서 불변.
// To Chuncheon: 출발 = 현재 위치 + 허브 6(hubs.js) / 도착 = 춘천역·터미널 2택 고정.
// From Chuncheon: 출발 = 춘천 2점 + 현재 위치 / 도착 = 허브 목록. 날짜 CalendarField + 시간 FieldSelect 유지.
// 현재 위치: §21 동의 패턴 재사용(사전 설명 모달 → 허용 시에만 geolocation 1회 · 브라우저 권한 직행 금지),
// 거부·실패 시 이전 확정 값으로 조용히 복귀(에러 톤 금지 · v3.2 폴백 규칙 유지).
// 결과는 planRoutes.lookupRoutes(hubs.js 조회 전용 · §29)만 호출 · 폼은 경로를 계산하지 않는다.
// 시간은 결과 계산에 쓰이지 않으므로(시각표 생성 금지) 필수 검증 없음.
import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import FieldSelect from '../ui/FieldSelect';
import Modal from '../ui/Modal';
import CalendarField from './CalendarField';
import {
  CURRENT_LOCATION_ID,
  TERMINAL_IDS,
  TIME_IDS,
  buildDestOptions,
  buildOriginOptions,
  buildTimeOptions,
  hhmmToTimeId,
  localDateId,
  terminalToHub,
} from './fieldOptions';
import { DEFAULT_HUB_ID, DEFAULT_POINT_ID, lookupRoutes } from './planRoutes';

// 1회 측위 옵션 · PATTERNS §21 watch 옵션과 동일 계열(고정밀 불필요)
const LOCATE_OPTIONS = { enableHighAccuracy: false, maximumAge: 30000, timeout: 20000 };

export default function GateForm({ initial, onResult }) {
  const { t } = useLang();
  const todayStr = localDateId(new Date());
  const initialHub = TERMINAL_IDS.includes(initial?.terminal)
    ? terminalToHub(initial.terminal)
    : DEFAULT_HUB_ID;

  const [direction, setDirection] = useState('to');
  // hubId = 허브 측 값 / pointId = 춘천 측 값 · 방향과 무관하게 역할 고정(토글 시 자동 반전)
  const [hubId, setHubId] = useState(initialHub);
  const [pointId, setPointId] = useState(DEFAULT_POINT_ID);
  // 쿼리 날짜는 오늘 이후 형식 유효값만 채택(캘린더 과거 비활성과 동일 규칙), 그 외 오늘
  const [date, setDate] = useState(
    /^\d{4}-\d{2}-\d{2}$/.test(initial?.date ?? '') && initial.date >= todayStr
      ? initial.date
      : todayStr,
  );
  // 쿼리 시각은 30분 간격 id로 변환되는 값만 채택(GateEntryCard가 같은 옵션을 쓰므로 항상 일치)
  const initialTimeId = initial?.time ? hhmmToTimeId(initial.time) : null;
  const [timeId, setTimeId] = useState(TIME_IDS.includes(initialTimeId) ? initialTimeId : null);
  const [locateOpen, setLocateOpen] = useState(false);

  // 'current' 선택이 확정 전이거나 방향 반전으로 무효화될 때 복귀할 마지막 확정 값
  const lastHub = useRef(initialHub);
  const lastPoint = useRef(DEFAULT_POINT_ID);
  const coords = useRef(null); // 측위 성공 좌표 · 최근접 매칭에만 사용, 노출 금지
  const consented = useRef(false); // 사전 설명 모달 허용 1회 후 세션 내 재표시 생략
  const locating = useRef(false); // 측위 대기 중 수동 조작이 이기도록 응답 무시 플래그
  const hasResults = useRef(false);
  const autoRan = useRef(false);

  const run = (next = {}) => {
    const d = next.direction ?? direction;
    const h = next.hubId ?? hubId;
    const p = next.pointId ?? pointId;
    // 측위 미완의 'current'는 마지막 확정 값으로 계산(제출을 막지 않는다 · v3.2 규칙 유지)
    const effHub = h === CURRENT_LOCATION_ID && !coords.current ? lastHub.current : h;
    const effPoint = p === CURRENT_LOCATION_ID && !coords.current ? lastPoint.current : p;
    hasResults.current = true;
    onResult(lookupRoutes({ direction: d, hubId: effHub, pointId: effPoint, coords: coords.current }));
  };

  // 쿼리 프리필(GateEntryCard 경유)이면 결과를 바로 계산(마운트 1회)
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    if (TERMINAL_IDS.includes(initial?.terminal)) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 방향 토글 · hubId/pointId가 역할을 자동 반전(구조·값 유지). 'current'는 출발지 전용이므로
  // 반전으로 도착 측이 되면 마지막 확정 값으로 치환. 결과가 떠 있으면 즉시 역방향 재조회
  // (동일 템플릿 역조회라 카드 수 동일 · 레이아웃 이동 없음).
  const switchDirection = (next) => {
    if (next === direction) return;
    let h = hubId;
    let p = pointId;
    if (next === 'from' && h === CURRENT_LOCATION_ID) {
      locating.current = false;
      h = lastHub.current;
      setHubId(h);
    }
    if (next === 'to' && p === CURRENT_LOCATION_ID) {
      locating.current = false;
      p = lastPoint.current;
      setPointId(p);
    }
    setDirection(next);
    if (hasResults.current) run({ direction: next, hubId: h, pointId: p });
  };

  const originValue = direction === 'to' ? hubId : pointId;
  const destValue = direction === 'to' ? pointId : hubId;

  // 측위 시작 · 반드시 동의 흐름(requestCurrent → 모달 allow) 뒤에서만 호출된다
  const startLocate = () => {
    const side = direction; // 응답 시점의 방향 변경 대비 캡처
    locating.current = true;
    (side === 'to' ? setHubId : setPointId)(CURRENT_LOCATION_ID);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!locating.current) return;
        locating.current = false;
        coords.current = { lng: position.coords.longitude, lat: position.coords.latitude };
        // 결과가 떠 있으면 현재 위치 기반으로 재조회(최근접 승차 지점 + varies 첫 레그 · §29)
        if (hasResults.current) {
          run(side === 'to' ? { hubId: CURRENT_LOCATION_ID } : { pointId: CURRENT_LOCATION_ID });
        }
      },
      () => {
        if (!locating.current) return;
        locating.current = false;
        // 거부·실패 시 이전 확정 값으로 조용히 복귀(에러 톤 금지 · 수동 선택 자연 폴백)
        if (side === 'to') setHubId(lastHub.current);
        else setPointId(lastPoint.current);
      },
      LOCATE_OPTIONS,
    );
  };

  // 현재 위치 선택 · §21 동의 패턴: 사전 설명 모달 먼저, 허용 시에만 geolocation 요청
  const requestCurrent = () => {
    if (!('geolocation' in navigator)) return; // 미지원 · 현 선택 유지(에러 톤 금지)
    if (consented.current) {
      startLocate();
      return;
    }
    setLocateOpen(true);
  };

  const allowLocate = () => {
    consented.current = true;
    setLocateOpen(false);
    startLocate();
  };

  const pickOrigin = (id) => {
    if (id === CURRENT_LOCATION_ID) {
      requestCurrent();
      return;
    }
    locating.current = false;
    if (direction === 'to') {
      lastHub.current = id;
      setHubId(id);
    } else {
      lastPoint.current = id;
      setPointId(id);
    }
  };

  const pickDest = (id) => {
    if (direction === 'to') {
      lastPoint.current = id;
      setPointId(id);
    } else {
      lastHub.current = id;
      setHubId(id);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run();
  };

  return (
    <>
      <form noValidate onSubmit={submit} className="rounded-lg bg-white p-24 shadow-sm">
        {/* 방향 토글 2탭 · Chip 재사용 · 전환 시 아래 필드 골격 불변(IA §9.2.1) */}
        <div role="group" aria-label={t('gate.planner.dir.label')} className="flex flex-wrap gap-8">
          <Chip active={direction === 'to'} onClick={() => switchDirection('to')}>
            <LangSwap k="gate.planner.dir.to" />
          </Chip>
          <Chip active={direction === 'from'} onClick={() => switchDirection('from')}>
            <LangSwap k="gate.planner.dir.from" />
          </Chip>
        </div>

        <div className="mt-16 grid gap-16 md:grid-cols-2 xl:grid-cols-4">
          <FieldSelect
            label="gate.form.from"
            value={originValue}
            placeholder="gate.planner.form.fromPh"
            options={buildOriginOptions(direction)}
            onChange={pickOrigin}
          />
          <FieldSelect
            label="gate.planner.form.to"
            value={destValue}
            placeholder="gate.planner.form.toPh"
            options={buildDestOptions(direction)}
            onChange={pickDest}
          />
          <CalendarField
            label="gate.planner.form.date"
            value={date}
            placeholder="gate.form.placeholders.date"
            onChange={setDate}
          />
          <FieldSelect
            label="gate.planner.form.time"
            value={timeId}
            placeholder="gate.form.placeholders.time"
            options={buildTimeOptions(t)}
            onChange={setTimeId}
          />
        </div>

        <div className="mt-24">
          <Button type="submit">
            <LangSwap k="gate.form.submit" />
          </Button>
        </div>
      </form>

      {/* 위치 사용 사전 설명 모달 · §21 동의 패턴 재사용(ArrivalExplainModal 구조 동형) ·
          플래너 목적 카피(gate.planner.locate.*) · "허용"에서만 실제 geolocation 요청 */}
      <Modal open={locateOpen} onClose={() => setLocateOpen(false)} title="gate.planner.locate.title">
        <div className="flex flex-col gap-16">
          <LangSwap k="gate.planner.locate.body" as="p" className="text-body font-medium text-inkSec" />
          <div className="flex flex-wrap items-center gap-12">
            <Button onClick={allowLocate}>
              <LangSwap k="gate.planner.locate.allow" />
            </Button>
            <Button variant="secondary" onClick={() => setLocateOpen(false)}>
              <LangSwap k="gate.planner.locate.later" />
            </Button>
          </div>
          <LangSwap k="gate.planner.locate.footnote" as="p" className="text-caption font-medium text-inkMeta" />
        </div>
      </Modal>
    </>
  );
}
