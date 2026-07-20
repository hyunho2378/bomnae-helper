// Gate 플래너 폼 · COMPONENTS B: terminal/date/time, 제출 → planGate 호출 결과 상위로.
// v3.1: 네이티브 select·date·time input 전면 제거 → FieldSelect 3종(터미널/날짜/시간).
// 시간 라벨은 사전 키(gate.time.*, 24h) · 날짜는 오늘부터 7일(fieldOptions).
// 쿼리 프리필(initial)이 완전하면 마운트 1회 자동 실행(Home 미니 입력 → 결과 즉시 노출).
// 에러: 인라인(PATTERNS §6) · FieldSelect 계약에 에러 prop이 없어 래퍼에 ring-spice 적용.
import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import FieldSelect from '../ui/FieldSelect';
import { planGate } from '../../data/gateRoutes';
import {
  TERMINAL_IDS,
  TIME_IDS,
  buildDateOptions,
  buildTerminalOptions,
  buildTimeOptions,
  hhmmToTimeId,
  timeIdToHHMM,
} from './fieldOptions';

export default function GateForm({ initial, onResult }) {
  const { t } = useLang();
  const dateOptions = buildDateOptions();
  const [terminal, setTerminal] = useState(
    TERMINAL_IDS.includes(initial?.terminal) ? initial.terminal : 't1',
  );
  // 쿼리 날짜가 7일 옵션 안에 있을 때만 채택, 그 외 오늘
  const [date, setDate] = useState(
    dateOptions.some((option) => option.id === initial?.date) ? initial.date : dateOptions[0].id,
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
    run({ terminal, date, time: timeIdToHHMM(timeId) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!timeId) {
      setError(true);
      return;
    }
    run({ terminal, date, time: timeIdToHHMM(timeId) });
  };

  return (
    <form noValidate onSubmit={submit} className="rounded-lg bg-white p-24 shadow-sm">
      <div className="grid gap-16 md:grid-cols-3">
        <FieldSelect
          label="gate.form.terminal"
          value={terminal}
          placeholder="gate.form.placeholders.terminal"
          options={buildTerminalOptions(t)}
          onChange={setTerminal}
        />
        <FieldSelect
          label="gate.form.date"
          value={date}
          placeholder="gate.form.placeholders.date"
          options={dateOptions}
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
