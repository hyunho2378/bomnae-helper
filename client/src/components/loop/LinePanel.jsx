// 라인 패널 · 라인 3개 리스트 + 정류장 하위 리스트(COMPONENTS C).
// 지도 대체 접근 경로: 키보드만으로 전 정류장 선택 가능(DESIGN §14, IA §2.4).
// 선택 → LoopMap focus(양방향 · 지도 마커 선택도 이 리스트에 반영).
import { Link } from 'react-router-dom';
import { lineColors } from '../../tokens';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 언어별 포맷 문자열 겹침 렌더용(PATTERNS §1) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';

const fmtDur = (min, dict) =>
  `${Math.floor(min / 60)}${dict.loop.detail.hoursUnit} ${min % 60}${dict.loop.detail.minutesUnit}`;

// 라인 컬러 클래스 · 정적 클래스 매핑(tailwind 스캐너 대응, 토큰 클래스만)
const DOT = {
  potato: 'bg-yellow',
  dakgalbi: 'bg-spice',
  lake: 'bg-primary',
};

export default function LinePanel({
  lines,
  stopsByLine,
  focusLineId,
  focusStopId,
  onSelectLine,
  onSelectStop,
}) {
  const { lang } = useLang();
  const name = (item) => (lang === 'ko' ? item.name_ko : item.name_en);

  return (
    <div className="flex flex-col gap-16 p-20 lg:p-24">
      <div>
        <LangSwap
          k="loop.title"
          as="h1"
          className="font-display text-h3 font-bold tracking-display"
        />
        <LangSwap k="loop.panel.hint" as="p" className="mt-4 text-small font-light text-inkSec" />
      </div>

      <ul className="flex flex-col gap-12">
        {lines.map((line) => {
          const active = focusLineId === line.id;
          return (
            <li key={line.id} className="rounded-md border border-line">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelectLine(line.id)}
                className={`flex min-h-44 w-full items-center gap-12 rounded-md px-16 py-12 text-left transition-colors duration-fast ${
                  active ? 'bg-surface' : 'hover:bg-surface'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-12 w-12 shrink-0 rounded-pill ${DOT[line.id]}`}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-body font-semibold">
                    {name(line)}
                  </span>
                  <span className="flex items-baseline gap-8 text-caption font-medium text-inkMeta">
                    {/* 소요 · 언어별 포맷 폭이 달라 겹침 렌더(시프트 0) */}
                    <span className="grid font-display">
                      <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>{fmtDur(line.duration_min, en)}</span>
                      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{fmtDur(line.duration_min, ko)}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-display">
                      {'₩'}
                      {line.price_adult.toLocaleString('en-US')}
                    </span>
                  </span>
                </span>
              </button>

              {/* 정류장 하위 리스트 · 항상 노출(키보드 대체 경로: 탭 이동만으로 도달) */}
              <ul className="flex flex-col border-t border-line py-4">
                {(stopsByLine[line.id] ?? []).map((stop) => {
                  const stopActive = focusStopId === stop.id;
                  return (
                    <li key={stop.id}>
                      <button
                        type="button"
                        aria-pressed={stopActive}
                        onClick={() => onSelectStop(line.id, stop.id)}
                        className={`flex min-h-44 w-full items-center gap-12 px-16 text-left text-small transition-colors duration-fast ${
                          stopActive
                            ? 'font-medium text-ink'
                            : 'text-inkSec hover:text-ink'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-8 w-8 shrink-0 rounded-pill border ${
                            stopActive ? `border-transparent ${DOT[line.id]}` : 'border-inkMeta'
                          }`}
                        />
                        <span className="min-w-0 flex-1 truncate">{name(stop)}</span>
                        {/* 체류 · 언어별 단위 폭이 달라 겹침 렌더(시프트 0) */}
                        <span className="grid shrink-0 font-display text-caption font-medium text-inkMeta">
                          <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>{stop.stay_min}{en.loop.detail.minutesUnit}</span>
                          <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{stop.stay_min}{ko.loop.detail.minutesUnit}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
                <li className="px-16 py-8">
                  <Link
                    to={`/loop/${line.id}`}
                    className="inline-flex min-h-44 items-center text-small font-medium text-primary transition-colors duration-fast hover:text-navy"
                  >
                    <LangSwap k="loop.panel.viewLine" />
                  </Link>
                </li>
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
