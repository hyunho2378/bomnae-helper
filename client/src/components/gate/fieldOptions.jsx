// FieldSelect 옵션 빌더 · 존 B 공용(GateForm / GateEntryCard / HandsFree 3곳 사용).
// v3.1: 네이티브 select·date·time input 전면 제거의 데이터 소스.
// 시간 라벨은 전부 사전 키(gate.time.*, 30분 간격 24h) 경유 · OS 오전/오후 누수 차단(PATTERNS §11).
// 날짜 라벨은 언어별 겹침 렌더(PATTERNS §1 동일 패턴)로 전환 시 레이아웃 시프트 0(존 B 명세).
import { CalendarDays, Plane } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
// 자기 네임스페이스(gate) 3언어 파일만 참조 · 타 네임스페이스 참조 없음
import enGate from '../../i18n/en/gate';
import koGate from '../../i18n/ko/gate';
import thGate from '../../i18n/th/gate';

const GATE_DICTS = { en: enGate, ko: koGate, th: thGate };
const LANGS = ['en', 'ko', 'th'];

export const TERMINAL_IDS = ['t1', 't2', 'gmp']; // gateRoutes planGate 키와 동일 계약

// 30분 간격 48개 · id '0000'~'2330'
export const TIME_IDS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  return `${h}${i % 2 ? '30' : '00'}`;
});

export const timeIdToHHMM = (id) => `${id.slice(0, 2)}:${id.slice(2)}`;
export const hhmmToTimeId = (hhmm) => hhmm.replace(':', '');

export const localDateId = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const formatDate = (date, dates) =>
  dates.format
    .replace('{wd}', dates.weekdays[`d${date.getDay()}`])
    .replace('{mon}', dates.months[`m${date.getMonth() + 1}`])
    .replace('{day}', String(date.getDate()));

// 날짜 라벨 · 3언어 겹침 렌더(같은 grid 셀 + 비활성 invisible) · 시프트 0
function DateText({ date }) {
  const { lang } = useLang();
  return (
    <span className="grid">
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {formatDate(date, GATE_DICTS[code].gate.dates)}
        </span>
      ))}
    </span>
  );
}

export function buildTerminalOptions(t) {
  return TERMINAL_IDS.map((id) => ({
    id,
    icon: Plane,
    primary: t(`gate.form.terminals.${id}`),
    secondary: t(`gate.form.terminalCodes.${id}`),
  }));
}

export function buildTimeOptions(t) {
  return TIME_IDS.map((id) => ({ id, primary: t(`gate.time.${id}`) }));
}

// 오늘부터 7일(IA §2.2) · id = YYYY-MM-DD(로컬), primary = 겹침 렌더 노드
// (FieldSelect 계약의 primary는 문자열이 기본이나, 날짜 라벨은 존 B 명세
//  "언어별 겹침으로 시프트 0"에 따라 렌더 노드를 전달한다)
export function buildDateOptions() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { id: localDateId(d), icon: CalendarDays, primary: <DateText date={d} /> };
  });
}
