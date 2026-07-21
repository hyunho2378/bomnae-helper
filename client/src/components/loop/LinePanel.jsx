// DEPRECATED v4(IA §9.0) — 구 City Lines·Bag Delivery 잠정 퇴역: 라우트에서 제거됨. 삭제 금지, 재활용 예정.
// 정류장 패널 · v3.2 rev(IA §8.3.2 · COMPONENTS 존 C2 "Loop 초기화 개정"):
// v3.1 라인 카드 3장 스택 폐지 → 선택된 라인의 정류장 리스트로 전환(칩이 라인 진입점).
// 데스크탑: 칩 아래 지도 위 글래스 패널 340px(blur 허용면 · DESIGN §10 "지도 위 라인 카드"),
//   내부 스크롤 scroll-quiet(§25) + tabindex 스크롤 영역(키보드 스크롤 생존).
// 모바일: 하단 소형 카드 가로 스냅 · 높이 132px 상한(§16.9 · max-h-132) · 지도 점유율 최우선.
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

// 라인 컬러 정적 클래스 매핑(tailwind 스캐너 대응, 토큰 클래스만)
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

// 데이터 필드(en/ko · th 없음) 겹침 · th는 en 폴백(v3.1 규칙)
function BiText({ en: textEn, ko: textKo, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>{textEn}</span>
      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{textKo}</span>
    </span>
  );
}

// 라인 요약 행 · 데스크탑 패널 헤더 + 모바일 첫 카드가 공유
function LineSummary({ line, onViewLine }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <span className="flex items-center gap-8">
        <span aria-hidden="true" className={`h-[10px] w-[10px] shrink-0 rounded-pill shadow-sm ${DOT[line.id]}`} />
        {/* 10px = §24 라인 컬러 원 명세값 */}
        <BiText en={line.name_en} ko={line.name_ko} className="min-w-0 font-display text-body font-semibold text-ink" />
      </span>
      <span className="flex items-baseline gap-8 text-caption font-medium text-inkSec">
        <DictSwap make={(d) => fmtDur(line.duration_min, d)} className="font-display" />
        <span aria-hidden="true">·</span>
        <span className="font-display">
          {'₩'}
          {line.price_adult.toLocaleString('en-US')}
        </span>
      </span>
      <button
        type="button"
        onClick={() => onViewLine(line.id)}
        className="inline-flex min-h-44 w-fit items-center text-small font-semibold text-primary transition-colors duration-fast hover:text-ink"
      >
        <LangSwap k="loop.panel.viewLine" />
      </button>
    </div>
  );
}

export default function LinePanel({ line, stops, focusStopId, onSelectStop, onViewLine }) {
  const { t } = useLang();

  return (
    <>
      {/* 데스크탑 · 칩 아래 글래스 패널. top 152 = 헤더 오프셋 96 + 칩 40 + 간격 16(§24 배치 산식) */}
      <div className="absolute inset-x-0 top-[152px] hidden lg:block">
        <Container>
          {/* 340px = IA §2.4 패널 폭 명세값 / max-h 산식: 100vh - (top 152 + 하단 여백 40) */}
          <section
            aria-label={t('loop.detail.routeTitle')}
            className="pointer-events-auto flex max-h-[calc(100vh-192px)] w-[340px] flex-col rounded-lg bg-glass shadow-lg backdrop-blur-glass"
          >
            <header className="p-16 pb-8">
              <LineSummary line={line} onViewLine={onViewLine} />
            </header>
            {/* 내부 스크롤 · scroll-quiet(§25) + tabindex 0(키보드 PageUp/Down·화살표 스크롤 생존) */}
            <ul
              tabIndex={0}
              aria-label={t('loop.panel.hint')}
              className="scroll-quiet min-h-0 flex-1 overflow-y-auto px-8 pb-16"
            >
              {stops.map((stop) => {
                const active = focusStopId === stop.id;
                return (
                  <li key={stop.id}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSelectStop(stop)}
                      className={`flex min-h-44 w-full items-center gap-8 rounded-sm px-8 text-left text-small transition-colors duration-fast ${
                        active ? 'font-semibold text-ink' : 'font-medium text-inkSec hover:text-ink'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-8 w-8 shrink-0 rounded-pill shadow-sm ${DOT[line.id]}`}
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
          </section>
        </Container>
      </div>

      {/* 모바일 · 하단 소형 카드 가로 스냅(§16.9 · 높이 132 상한, 지도 점유율 최우선).
          GlassDock 위 여백(pb-96) · 스냅 정지 위치 = 컨테이너 마진 경계 */}
      <div className="absolute inset-x-0 bottom-0 pb-96 lg:hidden">
        <ul className="scroll-quiet pointer-events-auto flex snap-x snap-mandatory gap-12 overflow-x-auto scroll-pl-16 px-16 pb-8 md:scroll-pl-24 md:px-24">
          <li className="w-4/5 shrink-0 snap-start">
            <div className="h-132 overflow-hidden rounded-lg bg-glass p-12 shadow-lg backdrop-blur-glass">
              <LineSummary line={line} onViewLine={onViewLine} />
            </div>
          </li>
          {stops.map((stop) => {
            const active = focusStopId === stop.id;
            return (
              <li key={stop.id} className="w-4/5 shrink-0 snap-start">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectStop(stop)}
                  className={`flex h-132 w-full flex-col gap-4 overflow-hidden rounded-lg bg-glass p-12 text-left shadow-lg backdrop-blur-glass ${
                    active ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <span className="flex items-center gap-8">
                    <span
                      aria-hidden="true"
                      className={`h-8 w-8 shrink-0 rounded-pill shadow-sm ${DOT[line.id]}`}
                    />
                    <BiText en={stop.name_en} ko={stop.name_ko} className="min-w-0 text-small font-semibold text-ink" />
                  </span>
                  <DictSwap
                    make={(d) => `${stop.stay_min} ${d.loop.detail.stayUnit}`}
                    className="font-display text-caption font-medium text-inkSec"
                  />
                  {/* 선주문 한 줄 · 데이터 본문(시프트 허용 영역) */}
                  <StopPreorder stop={stop} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

// 선주문 문구(모바일 카드) · 데이터 본문은 현재 언어 직접 렌더(th는 en 폴백)
function StopPreorder({ stop }) {
  const { lang } = useLang();
  return (
    <span className="line-clamp-2 text-caption font-medium text-inkSec">
      {lang === 'ko' ? stop.preorder_ko : stop.preorder_en}
    </span>
  );
}
