// Gate 플래너 폼 — COMPONENTS B: terminal/date/time, 제출 → planGate 호출 결과 상위로.
// 쿼리 프리필(initial)이 완전하면 마운트 1회 자동 실행(Home 미니 입력 → 결과 즉시 노출).
// 폼 규칙: DESIGN §7, 에러 인라인(PATTERNS §6). terminal 키 t1|t2|gmp(gateRoutes 계약).
import { useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import { planGate } from '../../data/gateRoutes';

const TERMINALS = ['t1', 't2', 'gmp'];

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function GateForm({ initial, onResult }) {
  const { t } = useLang();
  const [terminal, setTerminal] = useState(
    TERMINALS.includes(initial?.terminal) ? initial.terminal : 't1',
  );
  const [date, setDate] = useState(initial?.date ?? localToday());
  const [time, setTime] = useState(initial?.time ?? '');
  const [error, setError] = useState(false);
  const autoRan = useRef(false);

  const run = (params) => {
    onResult(planGate(params));
  };

  // 쿼리 프리필이 시각까지 갖춰졌으면 결과를 바로 계산(마운트 1회)
  useEffect(() => {
    if (autoRan.current || !initial?.time) return;
    autoRan.current = true;
    run({
      terminal: TERMINALS.includes(initial.terminal) ? initial.terminal : 't1',
      date: initial.date ?? localToday(),
      time: initial.time,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!time) {
      setError(true);
      return;
    }
    run({ terminal, date, time });
  };

  return (
    <form noValidate onSubmit={submit} className="rounded-md border border-line bg-white p-24">
      <div className="flex flex-col gap-16 md:flex-row md:items-end">
        <label className="flex flex-1 flex-col gap-8">
          <LangSwap k="gate.form.terminal" className="text-small font-medium" />
          <select
            value={terminal}
            onChange={(e) => setTerminal(e.target.value)}
            className="h-48 rounded-sm border border-line bg-surface px-16 text-body focus:border-primary"
          >
            {TERMINALS.map((id) => (
              <option key={id} value={id}>
                {t(`gate.form.terminals.${id}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-8">
          <LangSwap k="gate.form.date" className="text-small font-medium" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-48 rounded-sm border border-line bg-surface px-16 text-body focus:border-primary"
          />
        </label>
        <label className="flex flex-1 flex-col gap-8">
          <LangSwap k="gate.form.time" className="text-small font-medium" />
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? 'gate-form-time-error' : undefined}
            className={`h-48 rounded-sm border bg-surface px-16 text-body focus:border-primary ${
              error ? 'border-spice' : 'border-line'
            }`}
          />
        </label>
        <Button type="submit">
          <LangSwap k="gate.form.submit" />
        </Button>
      </div>
      {error && (
        <p id="gate-form-time-error" className="mt-8 text-small text-spice">
          {t('gate.form.errors.time')}
        </p>
      )}
    </form>
  );
}
