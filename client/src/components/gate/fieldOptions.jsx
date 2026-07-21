// FieldSelect 옵션 빌더 · 존 B 공용(GateForm / HandsFree / CalendarField 사용).
// v3.1: 네이티브 select·date·time input 전면 제거의 데이터 소스.
// v4 존 B4(IA §9.2): 허브·춘천 2점 옵션(buildOriginOptions/buildDestOptions, data/gts/hubs.js 소비).
//   허브 명칭은 데이터({en,ko}) 겹침 렌더(PlaceText · th는 en 폴백, RouteOptionCard BiText 선례).
// v4.2 존 B5(IA §10.3): 30분 스텝 시간 옵션(TIME_IDS·buildTimeOptions)·쿼리 시각 변환 헬퍼 폐지
//   (TimeWheel §38 대체 · 홈 미니 폼 GateEntryCard 삭제로 쿼리 계약 소멸) + kstNowParts(§38) 신설.
// 날짜·터미널 라벨은 언어별 겹침 렌더(PATTERNS §1 동일 패턴)로 전환 시 레이아웃 시프트 0(존 B 명세).
import { Bus, LocateFixed, Plane, TrainFront } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';
import { chuncheonPoints, hubs } from '../../data/gts/hubs';
// 자기 네임스페이스(gate) 3언어 파일만 참조 · 타 네임스페이스 참조 없음
import enGate from '../../i18n/en/gate';
import koGate from '../../i18n/ko/gate';
import thGate from '../../i18n/th/gate';

const GATE_DICTS = { en: enGate, ko: koGate, th: thGate };
const LANGS = ['en', 'ko', 'th'];

export const TERMINAL_IDS = ['t1', 't2', 'gmp']; // buildTerminalOptions(HandsFree) 데이터 소스

// §38 디폴트 = Asia/Seoul 현재 시각 · 명세의 toLocaleString 기반을 formatToParts로 견고화
// (hourCycle h23 명시 · 자정 "24" 표기 편차 차단). TimeWheel 디폴트·KoreaClock 틱이 공유한다.
const KST_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});
export const kstNowParts = () => {
  const parts = Object.fromEntries(
    KST_FMT.formatToParts(new Date())
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );
  return { h: parts.hour, m: parts.minute, s: parts.second };
};

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

export const CURRENT_LOCATION_ID = 'current';

// 데이터 명칭({en,ko}) 겹침 렌더 · th는 en 폴백(RouteOptionCard BiText 선례) · 시프트 0
export function PlaceText({ name }) {
  const { lang } = useLang();
  return (
    <span className="grid">
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {name[code] ?? name.en}
        </span>
      ))}
    </span>
  );
}

// 보간 라벨 3언어 겹침 렌더 · {var} 치환 값이 명칭 객체({en,ko})면 언어별 해석(th는 en 폴백)
const pickPath = (dict, key) => key.split('.').reduce((o, part) => o?.[part], dict);
export function PlannerSwap({ k, vars = {} }) {
  const { lang } = useLang();
  return (
    <span className="grid">
      {LANGS.map((code) => {
        let text = pickPath(GATE_DICTS[code], k) ?? k;
        Object.entries(vars).forEach(([name, val]) => {
          text = text.replace(`{${name}}`, typeof val === 'object' ? (val[code] ?? val.en) : val);
        });
        return (
          <span
            key={code}
            aria-hidden={lang !== code}
            className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
          >
            {text}
          </span>
        );
      })}
    </span>
  );
}

// 허브·춘천 지점 옵션 · v4 §9.2(데이터는 hubs.js 소비 전용) · kind별 lucide 아이콘
const KIND_ICONS = { airport: Plane, rail: TrainFront, bus: Bus };
const placeOption = (place) => ({
  id: place.id,
  icon: KIND_ICONS[place.kind],
  primary: <PlaceText name={place.name} />,
});
const currentOption = {
  id: CURRENT_LOCATION_ID,
  icon: LocateFixed,
  primary: <CurrentLocationText />,
};

// 출발지: To Chuncheon = 현재 위치 1옵션 + 허브 6 / From Chuncheon = 춘천 2점 + 현재 위치(IA §9.2.3 순서)
export const buildOriginOptions = (direction) =>
  direction === 'to'
    ? [currentOption, ...hubs.map(placeOption)]
    : [...chuncheonPoints.map(placeOption), currentOption];

// 도착지: To Chuncheon = 춘천역·터미널 2택 고정 / From Chuncheon = 허브 목록
export const buildDestOptions = (direction) =>
  (direction === 'to' ? chuncheonPoints : hubs).map(placeOption);
