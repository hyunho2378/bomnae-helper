// FieldSelect 옵션 빌더 · 존 B 공용(GateForm / GateEntryCard / HandsFree / CalendarField 사용).
// v3.1: 네이티브 select·date·time input 전면 제거의 데이터 소스.
// v3.2 §8.2: 날짜 리스트 옵션(buildDateOptions) 폐지 → CalendarField(§19)로 대체,
//   출발지 옵션(buildFromOptions) 신설: 현재 위치 1옵션 + 공항 3개 병존, 최근접 공항 매칭.
// 시간 라벨은 전부 사전 키(gate.time.*, 30분 간격 24h) 경유 · OS 오전/오후 누수 차단(PATTERNS §11).
// 날짜·터미널 라벨은 언어별 겹침 렌더(PATTERNS §1 동일 패턴)로 전환 시 레이아웃 시프트 0(존 B 명세).
import { LocateFixed, Plane } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { haversineKm } from '../../context/ArrivalContext';
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
// v3.2: CalendarField 트리거 표시값으로도 사용(export)
export function DateText({ date }) {
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

// 터미널 라벨 · 3언어 겹침 렌더(날짜와 동일 패턴) · 트리거 표시값 전환 시프트 0([BR] 검수 수정)
function TerminalText({ id }) {
  const { lang } = useLang();
  return (
    <span className="grid">
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {GATE_DICTS[code].gate.form.terminals[id]}
        </span>
      ))}
    </span>
  );
}

export function buildTerminalOptions(t) {
  return TERMINAL_IDS.map((id) => ({
    id,
    icon: Plane,
    primary: <TerminalText id={id} />,
    secondary: t(`gate.form.terminalCodes.${id}`),
  }));
}

export function buildTimeOptions(t) {
  return TIME_IDS.map((id) => ({ id, primary: t(`gate.time.${id}`) }));
}

// 현재 위치 라벨 · 3언어 겹침 렌더(터미널·날짜와 동일 패턴) · 시프트 0
function CurrentLocationText() {
  const { lang } = useLang();
  return (
    <span className="grid">
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {GATE_DICTS[code].gate.form.currentLocation}
        </span>
      ))}
    </span>
  );
}

// 공항 좌표 · 최근접 공항 매칭용(공개 시설 근사 좌표 · DRAFT)
const AIRPORT_COORDS = {
  t1: { lng: 126.4505, lat: 37.4482 },
  t2: { lng: 126.4407, lat: 37.467 },
  gmp: { lng: 126.791, lat: 37.5583 },
};

// geolocation 성공 시 가장 가까운 공항 id 반환(IA §8.2.1 자동 매칭)
export function nearestAirport(coords) {
  return TERMINAL_IDS.reduce((best, id) =>
    haversineKm(coords, AIRPORT_COORDS[id]) < haversineKm(coords, AIRPORT_COORDS[best]) ? id : best,
  );
}

// 출발지 옵션 · v3.2 §8.2.1: 첫 항목 = 현재 위치 사용(LocateFixed) + 공항 3개 병존
export const CURRENT_LOCATION_ID = 'current';
export function buildFromOptions(t) {
  return [
    { id: CURRENT_LOCATION_ID, icon: LocateFixed, primary: <CurrentLocationText /> },
    ...buildTerminalOptions(t),
  ];
}
