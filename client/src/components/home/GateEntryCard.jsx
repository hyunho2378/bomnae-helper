// Gate 진입 미니 입력 · IA §2.1.3: 터미널·시간 미니 입력, 제출 시 /gate로 쿼리 전달
// (ROUTES §1 쿼리 계약 ?terminal=&time=&date=; 미니 입력이라 날짜는 오늘 로컬 날짜로 채운다).
// v3.1: 네이티브 select·time input 제거 → FieldSelect 2종(터미널/시간).
// 에러 인라인(PATTERNS §6) · FieldSelect 계약에 에러 prop이 없어 래퍼에 ring-spice 적용.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import FieldSelect from '../ui/FieldSelect';
import {
  buildTerminalOptions,
  buildTimeOptions,
  localDateId,
  timeIdToHHMM,
} from '../gate/fieldOptions';

export default function GateEntryCard() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [terminal, setTerminal] = useState('t1');
  const [timeId, setTimeId] = useState(null);
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!timeId) {
      setError(true);
      return;
    }
    navigate(
      `/gate?terminal=${terminal}&time=${timeIdToHHMM(timeId)}&date=${localDateId(new Date())}`,
    );
  };

  return (
    <form noValidate onSubmit={submit} className="rounded-lg bg-white p-24 shadow-sm">
      <div className="flex flex-col gap-16 sm:flex-row sm:items-end">
        <div className="flex-1">
          <FieldSelect
            label="gate.form.terminal"
            value={terminal}
            placeholder="gate.form.placeholders.terminal"
            options={buildTerminalOptions(t)}
            onChange={setTerminal}
          />
        </div>
        <div className={`flex-1 ${error ? 'rounded-md ring-2 ring-spice' : ''}`}>
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
