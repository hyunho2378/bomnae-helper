// Gate 플래너 폼 · COMPONENTS B + v3.2 존 B2(IA §8.2).
// v3.2: 출발지 FieldSelect 첫 옵션 = 현재 위치 사용(geolocation 1회 getCurrentPosition,
//   성공 시 최근접 공항 자동 매칭, 거부·실패 시 에러 톤 없이 공항 수동 선택으로 자연 폴백)
//   + 날짜 = CalendarField(§19 · 리스트 옵션 폐지). 시간 FieldSelect는 기존 유지.
// 시간 라벨은 사전 키(gate.time.*, 24h) · 쿼리 프리필이 완전하면 마운트 1회 자동 실행.
// 에러: 인라인(PATTERNS §6) · FieldSelect 계약에 에러 prop이 없어 래퍼에 ring-spice 적용.
import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import FieldSelect from '../ui/FieldSelect';
import CalendarField from './CalendarField';
import { planGate } from '../../data/gateRoutes';
import {
  CURRENT_LOCATION_ID,
  TERMINAL_IDS,
  TIME_IDS,
  buildFromOptions,
  buildTimeOptions,
  hhmmToTimeId,
  localDateId,
  nearestAirport,
  timeIdToHHMM,
} from './fieldOptions';

// 1회 측위 옵션 · PATTERNS §21 watch 옵션과 동일 계열(고정밀 불필요)
const LOCATE_OPTIONS = { enableHighAccuracy: false, maximumAge: 30000, timeout: 20000 };

export default function GateForm({ initial, onResult }) {
  const { t } = useLang();
  const todayStr = localDateId(new Date());
  // fromValue = 표시값('current' 포함) · lastAirport = planGate에 넘길 실제 공항
  const [fromValue, setFromValue] = useState(
    TERMINAL_IDS.includes(initial?.terminal) ? initial.terminal : 't1',
  );
  const lastAirport = useRef(TERMINAL_IDS.includes(initial?.terminal) ? initial.terminal : 't1');
  const locating = useRef(false);
  // 쿼리 날짜는 오늘 이후 형식 유효값만 채택(캘린더 과거 비활성과 동일 규칙), 그 외 오늘
  const [date, setDate] = useState(
    /^\d{4}-\d{2}-\d{2}$/.test(initial?.date ?? '') && initial.date >= todayStr
      ? initial.date
      : todayStr,
  );
  // 쿼리 시각은 30분 간격 id로 변환되는 값만 채택(GateEntryCard가 같은 옵션을 쓰므로 항상 일치)
  const initialTimeId = initial?.time ? hhmmToTimeId(initial.time) : null;
  const [timeId, setTimeId] = useState(TIME_IDS.includes(initialTimeId) ? initialTimeId : null);
  const [error, setError] = useState(false);
  const autoRan = useRef(false);

  const run = (params) => {
    onResult(planGate(params));
  };

  // 쿼리 프리필이 시각까지 갖춰졌으면 결과를 바로 계산(마운트 1회)
  useEffect(() => {
    if (autoRan.current || !timeId) return;
    autoRan.current = true;
    run({ terminal: lastAirport.current, date, time: timeIdToHHMM(timeId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 현재 위치 선택 · geolocation 1회 조회(IA §8.2.1) · 성공 시 최근접 공항 자동 매칭,
  // 거부·실패 시 이전 공항으로 조용히 복귀(에러 톤 금지 · 수동 선택 자연 폴백)
  const pickFrom = (id) => {
    if (id !== CURRENT_LOCATION_ID) {
      locating.current = false; // 측위 대기 중 수동 선택이 이기도록 응답 무시 플래그
      lastAirport.current = id;
      setFromValue(id);
      return;
    }
    if (!('geolocation' in navigator)) return; // 미지원 · 현 선택 유지(에러 톤 금지)
    locating.current = true;
    setFromValue(CURRENT_LOCATION_ID);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!locating.current) return;
        locating.current = false;
        const matched = nearestAirport({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        });
        lastAirport.current = matched;
        setFromValue(matched);
      },
      () => {
        if (!locating.current) return;
        locating.current = false;
        setFromValue(lastAirport.current);
      },
      LOCATE_OPTIONS,
    );
  };

  const submit = (e) => {
    e.preventDefault();
    if (!timeId) {
      setError(true);
      return;
    }
    // 측위가 아직 진행 중이면 마지막 확정 공항으로 계산(제출을 막지 않는다)
    run({ terminal: lastAirport.current, date, time: timeIdToHHMM(timeId) });
  };

  return (
    <form noValidate onSubmit={submit} className="rounded-lg bg-white p-24 shadow-sm">
      <div className="grid gap-16 md:grid-cols-3">
        <FieldSelect
          label="gate.form.from"
          value={fromValue}
          placeholder="gate.form.placeholders.terminal"
          options={buildFromOptions(t)}
          onChange={pickFrom}
        />
        <CalendarField
          label="gate.form.date"
          value={date}
          placeholder="gate.form.placeholders.date"
          onChange={setDate}
        />
        <div className={error ? 'rounded-md ring-2 ring-spice' : ''}>
          <FieldSelect
            label="gate.form.time"
            value={timeId}
            placeholder="gate.form.placeholders.time"
            options={buildTimeOptions(t)}
            onChange={(id) => {
              setTimeId(id);
              setError(false);
            }}
          />
        </div>
      </div>
      {error && (
        <p id="gate-form-time-error" className="mt-8 text-small text-spice">
          {t('gate.form.errors.time')}
        </p>
      )}
      <div className="mt-24">
        <Button type="submit">
          <LangSwap k="gate.form.submit" />
        </Button>
      </div>
    </form>
  );
}
