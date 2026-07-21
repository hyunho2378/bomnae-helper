// DEPRECATED v4(IA §9.0) — 구 City Lines·Bag Delivery 잠정 퇴역: 라우트에서 제거됨. 삭제 금지, 재활용 예정.
// 라인 미리보기 오버레이 · v3.1 신설(PATTERNS §14 그대로, IA §2.4.4):
// "View line" 클릭 시 라우팅 없이 fixed inset-0 z-sheet: scrim(클릭 닫기) +
// 데스크탑 우측 420px 글래스 패널(translateX 24px→0 + opacity spring, radius 좌측만 xl,
// shadow lg, blur 허용면) / 모바일 BottomSheet 재사용(전고 84%).
// 내용 순서 고정: 아이콘 배지+라인명(Kanit)+소요·가격 / 정류장 수직 미니 노선도 /
// 선주문 한 줄 / CTA "Book and see details" 단 하나(→ /loop/:lineId).
// 금지 블록: StoryClips·DepartureCalendar·호스트·Reserve seats·좌석 문구(§14).
// 포커스 트랩 + Escape. 글래스 위 텍스트는 ink 선명색만(HIG Materials).
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
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

// v3.2 §16.1: 아이콘 배지·틴트 폐지 → 원색 컬러 도트 + shadow.sm
const DOT = { potato: 'bg-yellow', dakgalbi: 'bg-spice', lake: 'bg-primary' };
// 번호 원 · 라인 컬러 면 + AA 대비 텍스트(yellow 위 ink만 · DESIGN §2)
const NUMBER = {
  potato: 'bg-yellow text-ink',
  dakgalbi: 'bg-spice text-white',
  lake: 'bg-primary text-white',
};

// Dialog/BottomSheet과 동일한 로컬 포커스 트랩(기존 스타일 준용)
const trapTab = (e, root) => {
  const els = root.querySelectorAll(
    'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  if (!els.length) return;
  const first = els[0];
  const last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
};

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

// 내용 순서 고정(§14) · 데스크탑 패널과 모바일 시트가 공유
function PreviewContent({ line, stops, onClose }) {
  return (
    <div className="flex flex-col gap-24">
      {/* 1 · 아이콘 배지 + 라인명(Kanit) + 소요·가격 */}
      <div className="flex items-center gap-16">
        <span
          aria-hidden="true"
          className={`h-12 w-12 shrink-0 rounded-pill shadow-sm ${DOT[line.id]}`}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <BiText en={line.name_en} ko={line.name_ko} className="font-display text-h3 font-bold tracking-display text-ink" />
          <span className="flex items-baseline gap-8 text-small font-medium text-inkSec">
            <DictSwap make={(d) => fmtDur(line.duration_min, d)} className="font-display" />
            <span aria-hidden="true">·</span>
            <span className="font-display">
              {'₩'}
              {line.price_adult.toLocaleString('en-US')}
            </span>
            <LangSwap k="loop.detail.priceUnit" className="font-medium" />
          </span>
        </div>
      </div>

      {/* 2 · 정류장 수직 미니 노선도(번호 원 + 이름 + 체류) */}
      <ol className="flex flex-col">
        {stops.map((stop, i) => (
          <li key={stop.id} className="flex items-center gap-12">
            <div aria-hidden="true" className="flex w-24 flex-col items-center self-stretch">
              <span
                className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-pill font-display text-caption font-semibold ${NUMBER[line.id]}`}
              >
                {i + 1}
              </span>
              {i < stops.length - 1 && <span className="w-4 flex-1 bg-line" />}
            </div>
            <div className={`flex min-w-0 flex-1 items-baseline justify-between gap-8 ${i < stops.length - 1 ? 'pb-20' : ''}`}>
              <BiText en={stop.name_en} ko={stop.name_ko} className="min-w-0 text-body font-medium text-ink" />
              <DictSwap
                make={(d) => `${stop.stay_min} ${d.loop.detail.stayUnit}`}
                className="shrink-0 font-display text-caption font-medium text-inkSec"
              />
            </div>
          </li>
        ))}
      </ol>

      {/* 3 · 선주문 한 줄 */}
      <LangSwap k="loop.preview.preorderLine" as="p" className="text-small font-medium text-inkSec" />

      {/* 4 · CTA 단 하나 → /loop/:lineId (§14) · grid 래핑 = full 폭(Button 계약에 className 없음) */}
      <div className="grid">
        <Button as={Link} to={`/loop/${line.id}`} onClick={onClose}>
          <LangSwap k="loop.preview.cta" />
        </Button>
      </div>
    </div>
  );
}

export default function LinePreviewOverlay({ line, stops, onClose }) {
  const panelRef = useRef(null);
  const [shown, setShown] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    panelRef.current?.focus();
    return () => cancelAnimationFrame(raf);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
      return;
    }
    if (e.key === 'Tab') trapTab(e, panelRef.current);
  };

  return (
    <>
      {/* 데스크탑 · scrim + 우측 글래스 패널(§14) */}
      <div className="fixed inset-0 z-sheet hidden lg:block">
        <div
          aria-hidden="true"
          onClick={onClose}
          className={`absolute inset-0 bg-scrim transition-opacity duration-fast ${shown ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('loop.preview.label')}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          // 420px = §14 패널 폭 명세값 / 72px = DESIGN §6 헤더 초기 높이 명세값(top·height 산식)
          className={`absolute right-0 top-[72px] h-[calc(100%-72px)] w-[420px] overflow-y-auto rounded-l-xl bg-glass p-24 shadow-lg backdrop-blur-glass transition-all duration-base ease-spring motion-reduce:transition-none ${
            shown ? 'translate-x-0 opacity-100' : 'translate-x-24 opacity-0'
          }`}
        >
          <div className="mb-8 flex justify-end">
            <IconButton icon={X} label="common.close" size={20} onClick={onClose} />
          </div>
          <PreviewContent line={line} stops={stops} onClose={onClose} />
        </div>
      </div>

      {/* 모바일 · scrim + BottomSheet 재사용(§14) */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-sheet bg-scrim lg:hidden"
        onClick={onClose}
      />
      <BottomSheet open onClose={onClose} title="loop.preview.label">
        {/* 전고 84% = §14 명세값 */}
        <div className="h-[84vh] overflow-y-auto">
          <PreviewContent line={line} stops={stops} onClose={onClose} />
        </div>
      </BottomSheet>
    </>
  );
}
