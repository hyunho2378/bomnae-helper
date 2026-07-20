// Gate 진입 미니 입력 — IA §2.1.3: 터미널·시간 미니 입력, 제출 시 /gate로 쿼리 전달
// (ROUTES §1 쿼리 계약 ?terminal=&time=&date=; 미니 입력이라 날짜는 오늘 로컬 날짜로 채운다).
// 폼 규칙: DESIGN §7(입력 surface/보더 line/focus primary), 에러 인라인(PATTERNS §6).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';

const TERMINALS = ['t1', 't2', 'gmp']; // gateRoutes planGate 키와 동일(t1|t2|gmp)

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function GateEntryCard() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [terminal, setTerminal] = useState('t1');
  const [time, setTime] = useState('');
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!time) {
      setError(true);
      return;
    }
    navigate(`/gate?terminal=${terminal}&time=${time}&date=${localToday()}`);
  };

  return (
    <form noValidate onSubmit={submit} className="rounded-md border border-line bg-white p-24">
      <div className="flex flex-col gap-16 sm:flex-row sm:items-end">
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
          <LangSwap k="gate.form.time" className="text-small font-medium" />
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? 'gate-entry-time-error' : undefined}
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
        <p id="gate-entry-time-error" className="mt-8 text-small text-spice">
          {t('gate.form.errors.time')}
        </p>
      )}
    </form>
  );
}
