// Gate 플래너 폼 · v4.2 존 B5(IA §10.3): 칩 토글 폐지 · 방향은 부모 섹션이 prop으로 고정
// (수직 2섹션의 한쪽 · To/From 각자 독립 상태 · 필드 문법 동일).
// 필드: 출발/도착 FieldSelect + CalendarField + TimeWheel(§38 · 30분 스텝 FieldSelect 시간 폐지,
// 디폴트 = Asia/Seoul 현재 시각). 제출 시 결과와 함께 출발 시각(departHHMM)을 올린다(§39 계산용).
// 현재 위치(§39·§21): 사전 설명 모달 → 허용 시에만 geolocation 1회(브라우저 권한 직행 금지),
// 거부·실패 시 이전 확정 값으로 조용히 복귀(에러 톤 금지). 좌표는 최근접 매칭에만 사용, 노출 금지.
// 주소명 라벨(§39): KAKAO_REST_KEY 존재 시 서버 프록시 /api/geo/label?lat&lng(카카오 Local
// coord2address · 브라우저 직호출 금지, 키 노출 방지) 경유가 명세이나 현재 키 부재 →
// "현재 위치" 고정 라벨(gate.form.currentLocation)만 사용(프록시 연동 시 이 주석이 명세다).
// 결과는 planRoutes.lookupRoutes(hubs.js 조회 전용 · §29)만 호출 · 폼은 경로를 계산하지 않는다.
import { useRef, useState } from 'react';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import FieldSelect from '../ui/FieldSelect';
import Modal from '../ui/Modal';
import CalendarField from './CalendarField';
import TimeWheel from './TimeWheel';
import {
  CURRENT_LOCATION_ID,
  buildDestOptions,
  buildOriginOptions,
  kstNowParts,
  localDateId,
} from './fieldOptions';
import { DEFAULT_HUB_ID, DEFAULT_POINT_ID, lookupRoutes } from './planRoutes';

// 1회 측위 옵션 · PATTERNS §21 watch 옵션과 동일 계열(고정밀 불필요)
const LOCATE_OPTIONS = { enableHighAccuracy: false, maximumAge: 30000, timeout: 20000 };

const pad2 = (n) => String(n).padStart(2, '0');

export default function GateForm({ direction, onResult }) {
  // hubId = 허브 측 값 / pointId = 춘천 측 값 · 방향은 prop 고정이라 역할이 바뀌지 않는다
  const [hubId, setHubId] = useState(DEFAULT_HUB_ID);
  const [pointId, setPointId] = useState(DEFAULT_POINT_ID);
  const [date, setDate] = useState(() => localDateId(new Date()));
  // §38 디폴트 = 한국 표준시 현재 시각 · 분 1단위
  const [time, setTime] = useState(kstNowParts);
  const [locateOpen, setLocateOpen] = useState(false);

  // 'current' 선택이 확정 전이거나 측위 실패 시 복귀할 마지막 확정 값
  const lastHub = useRef(DEFAULT_HUB_ID);
  const lastPoint = useRef(DEFAULT_POINT_ID);
  const coords = useRef(null); // 측위 성공 좌표 · 최근접 매칭에만 사용, 노출 금지
  const consented = useRef(false); // 사전 설명 모달 허용 1회 후 세션 내 재표시 생략
  const locating = useRef(false); // 측위 대기 중 수동 조작이 이기도록 응답 무시 플래그
  const hasResults = useRef(false);

  const run = (next = {}) => {
    const h = next.hubId ?? hubId;
    const p = next.pointId ?? pointId;
    // 측위 미완의 'current'는 마지막 확정 값으로 계산(제출을 막지 않는다 · v3.2 규칙 유지)
    const effHub = h === CURRENT_LOCATION_ID && !coords.current ? lastHub.current : h;
    const effPoint = p === CURRENT_LOCATION_ID && !coords.current ? lastPoint.current : p;
    hasResults.current = true;
    onResult({
      options: lookupRoutes({ direction, hubId: effHub, pointId: effPoint, coords: coords.current }),
      // §39 레그 시각 계산 기점 · TimeWheel 선택 값(디폴트 KST 현재)
      departHHMM: `${pad2(time.h)}:${pad2(time.m)}`,
    });
  };

  // 측위 시작 · 반드시 동의 흐름(requestCurrent → 모달 allow) 뒤에서만 호출된다
  const startLocate = () => {
    locating.current = true;
    (direction === 'to' ? setHubId : setPointId)(CURRENT_LOCATION_ID);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!locating.current) return;
        locating.current = false;
        coords.current = { lng: position.coords.longitude, lat: position.coords.latitude };
        // 결과가 떠 있으면 현재 위치 기반으로 재조회(최근접 승차 지점 + varies 첫 레그 · §29)
        if (hasResults.current) {
          run(direction === 'to' ? { hubId: CURRENT_LOCATION_ID } : { pointId: CURRENT_LOCATION_ID });
        }
      },
      () => {
        if (!locating.current) return;
        locating.current = false;
        // 거부·실패 시 이전 확정 값으로 조용히 복귀(에러 톤 금지 · 수동 선택 자연 폴백)
        if (direction === 'to') setHubId(lastHub.current);
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

  const originValue = direction === 'to' ? hubId : pointId;
  const destValue = direction === 'to' ? pointId : hubId;

  return (
    <>
      <form noValidate onSubmit={submit} className="rounded-lg bg-white p-24 shadow-sm">
        <div className="grid gap-16 md:grid-cols-2 xl:grid-cols-3">
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
        </div>

        {/* §38 TimeWheel · 30분 스텝 FieldSelect 시간 폐지 · 디폴트 = KST 현재 시각 */}
        <div className="mt-16">
          <TimeWheel value={time} onChange={setTime} />
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
