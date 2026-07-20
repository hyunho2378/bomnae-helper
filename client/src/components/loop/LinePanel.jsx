// 지도 위 라인 카드 · v3.1 rev(IA §2.4, COMPONENTS v3.1 존 C "Loop rev"):
// 사이드 컬럼 폐지 → 컨테이너 마진 안쪽, 지도 위에 뜨는 글래스 카드
// (blur 허용면 · DESIGN §10: 지도 위 라인 카드). 데스크탑 좌측 세로 스택 340px,
// 모바일 하단 가로 스크롤 스냅. 카드: 아이콘 배지(Sprout/Flame/Waves, 라인 컬러) +
// 라인명 + 소요·가격 + 정류장 3 미니 리스트 + "View line".
// 정류장 리스트가 지도 대체 접근 경로(키보드 완전 지원 · DESIGN §14).
import Container from '../layout/Container';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 언어별 포맷 문자열 겹침 렌더용(PATTERNS §1·§18) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';
import th from '../../i18n/th';

const DICTS = { en, ko, th };
const LANGS = ['en', 'ko', 'th'];

const fmtDur = (min, dict) =>
  `${Math.floor(min / 60)}${dict.loop.detail.hoursUnit} ${min % 60}${dict.loop.detail.minutesUnit}`;

// 라인 컬러 클래스 · 정적 클래스 매핑(tailwind 스캐너 대응, 토큰 클래스만)
// v3.2 §16.1: 아이콘 배지·틴트 폐지 → 원색 컬러 도트 + shadow.sm
const DOT = { potato: 'bg-yellow', dakgalbi: 'bg-spice', lake: 'bg-primary' };

// 사전 유래 문자열 3언어 겹침(시프트 0 · PATTERNS §1·§18)
function DictSwap({ make, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {make(DICTS[code])}
        </span>
      ))}
    </span>
  );
}

// 데이터 필드(en/ko · th 없음) 겹침 · th는 en 폴백(v3.1 규칙: lang!=='ko'일 때 en 스팬)
function BiText({ en: textEn, ko: textKo, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>{textEn}</span>
      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{textKo}</span>
    </span>
  );
}

function LineGlassCard({ line, stops, active, focusStopId, onSelectLine, onSelectStop, onViewLine }) {
  return (
    <article
      className={`rounded-lg bg-glass shadow-lg backdrop-blur-glass ${
        active ? 'ring-2 ring-primary' : '' // 선택 상태 = ring(v3.1 무보더 · DESIGN §7)
      }`}
    >
      {/* 라인 선택 · flyTo + 타 라인 opacity 0.4(LoopMap) */}
      <button
        type="button"
        aria-pressed={active}
        onClick={() => onSelectLine(line.id)}
        className="flex min-h-44 w-full items-center gap-12 p-16 text-left"
      >
        <span
          aria-hidden="true"
          className={`h-12 w-12 shrink-0 rounded-pill shadow-sm ${DOT[line.id]}`}
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <BiText en={line.name_en} ko={line.name_ko} className="font-display text-body font-semibold text-ink" />
          <span className="flex items-baseline gap-8 text-caption font-medium text-inkSec">
            <DictSwap make={(d) => fmtDur(line.duration_min, d)} className="font-display" />
            <span aria-hidden="true">·</span>
            <span className="font-display">
              {'₩'}
              {line.price_adult.toLocaleString('en-US')}
            </span>
          </span>
        </span>
      </button>

      {/* 정류장 3 미니 리스트 · 키보드 대체 경로(탭 이동만으로 도달) */}
      <ul className="flex flex-col px-8">
        {stops.map((stop) => {
          const stopActive = focusStopId === stop.id;
          return (
            <li key={stop.id}>
              <button
                type="button"
                aria-pressed={stopActive}
                onClick={() => onSelectStop(line.id, stop.id)}
                className={`flex min-h-44 w-full items-center gap-8 rounded-sm px-8 text-left text-small transition-colors duration-fast ${
                  stopActive ? 'font-medium text-ink' : 'text-inkSec hover:text-ink'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-8 w-8 shrink-0 rounded-pill ${stopActive ? DOT[line.id] : 'bg-inkMeta'}`}
                />
                <BiText en={stop.name_en} ko={stop.name_ko} className="min-w-0 flex-1" />
                <DictSwap
                  make={(d) => `${stop.stay_min} ${d.loop.detail.stayUnit}`}
                  className="shrink-0 font-display text-caption font-medium text-inkSec"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {/* View line · 라우팅 없는 미리보기(LinePreviewOverlay) 오픈(IA §2.4) */}
      <div className="px-16 pb-8">
        <button
          type="button"
          onClick={() => onViewLine(line.id)}
          className="inline-flex min-h-44 items-center text-small font-medium text-primary transition-colors duration-fast hover:text-navy"
        >
          <LangSwap k="loop.panel.viewLine" />
        </button>
      </div>
    </article>
  );
}

export default function LinePanel({
  lines,
  stopsByLine,
  focusLineId,
  focusStopId,
  onSelectLine,
  onSelectStop,
  onViewLine,
}) {
  const cards = (layout) =>
    lines.map((line) => (
      <li key={line.id} className={layout === 'row' ? 'w-4/5 shrink-0 snap-start' : ''}>
        <LineGlassCard
          line={line}
          stops={stopsByLine[line.id] ?? []}
          active={focusLineId === line.id}
          focusStopId={focusStopId}
          onSelectLine={onSelectLine}
          onSelectStop={onSelectStop}
          onViewLine={onViewLine}
        />
      </li>
    ));

  return (
    <div className="pointer-events-none absolute inset-0 z-content">
      {/* 페이지 제목·힌트 · 시각 UI는 카드가 대신한다(스크린리더 전용) */}
      <h1 className="sr-only">
        <LangSwap k="loop.title" />
      </h1>
      <p className="sr-only">
        <LangSwap k="loop.panel.hint" />
      </p>

      {/* 데스크탑 · 컨테이너 마진 안 좌측 세로 스택. 340px는 IA §2.4 v3.1 명세값 */}
      <div className="hidden h-full lg:block">
        <Container>
          <ul className="pointer-events-auto flex max-h-screen w-[340px] flex-col gap-16 overflow-y-auto pb-24 pt-96">
            {cards('stack')}
          </ul>
        </Container>
      </div>

      {/* 모바일 · 하단 가로 스크롤 스냅(마진 = 컨테이너 규칙 px-20/md:px-32), GlassDock 위 여백 */}
      <div className="absolute inset-x-0 bottom-0 pb-96 lg:hidden">
        {/* scroll-pl = 컨테이너 마진과 동일 · 스냅 정지 위치가 마진 경계 안에 오도록 */}
        <ul className="pointer-events-auto flex snap-x snap-mandatory gap-16 overflow-x-auto scroll-pl-16 px-16 pb-8 md:scroll-pl-24 md:px-24">
          {cards('row')}
        </ul>
      </div>
    </div>
  );
}
