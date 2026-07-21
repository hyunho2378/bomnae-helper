// 라인 칩 · v3.2 신설(PATTERNS §24 · DESIGN §16.9 · COMPONENTS 존 C2):
// 네이버지도 카테고리 필 방식. white pill h-40 + 좌측 라인 컬러 원 10px(원색+shadow.sm) +
// 라벨 600 ink + shadow.md. 선택 = primary 배경 white 반전(라인 컬러 배경 금지 · 크롬 단일색).
// role="tab" 그룹 + ←→ 순회(roving tabindex), 재클릭·Escape 해제.
// 칩이 유일한 라인 진입점이므로 키보드 포커스 1순위(§16.9).
// flashId: POI 앵커 클릭 시 관련 칩 하이라이트(ring · Loop 페이지가 타이머 관리).
import { useRef, useState } from 'react';
import { useLang } from '../../i18n/LangContext';

// 라인 컬러 정적 클래스 매핑(토큰 클래스만)
const DOT = { potato: 'bg-yellow', dakgalbi: 'bg-spice', lake: 'bg-primary' };

// 데이터 필드(en/ko · th 없음) 겹침 · th는 en 폴백(v3.1 규칙 · PATTERNS §1)
function BiText({ en: textEn, ko: textKo, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>{textEn}</span>
      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{textKo}</span>
    </span>
  );
}

export default function LineChips({ lines, selectedId, flashId, onSelect }) {
  const { t } = useLang();
  const refs = useRef([]);
  // roving tabindex · 선택 칩 우선, 없으면 첫 칩
  const [focusIdx, setFocusIdx] = useState(null);
  const selectedIdx = lines.findIndex((l) => l.id === selectedId);
  const activeIdx = focusIdx ?? (selectedIdx >= 0 ? selectedIdx : 0);

  const onKeyDown = (e, i) => {
    if (e.key === 'Escape') {
      onSelect(null); // Escape 해제(§24)
      return;
    }
    const delta = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const next = (i + delta + lines.length) % lines.length; // ←→ 순회(랩)
    setFocusIdx(next);
    refs.current[next]?.focus();
  };

  return (
    <ul
      role="tablist"
      aria-label={t('loop.chips.label')}
      className="pointer-events-auto flex flex-wrap gap-12"
    >
      {lines.map((line, i) => {
        const selected = selectedId === line.id;
        const flash = flashId === line.id && !selected; // POI 하이라이트(§16.9)
        return (
          <li key={line.id}>
            <button
              type="button"
              role="tab"
              aria-selected={selected}
              ref={(el) => {
                refs.current[i] = el;
              }}
              tabIndex={i === activeIdx ? 0 : -1}
              onFocus={() => setFocusIdx(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onClick={() => onSelect(selected ? null : line.id)}
              className={`flex h-40 items-center gap-8 rounded-pill px-16 text-small font-semibold shadow-md transition-colors duration-fast ${
                selected ? 'bg-primary text-white' : 'bg-white text-ink'
              } ${flash ? 'ring-2 ring-primary' : ''}`}
            >
              {/* 라인 컬러 원 10px = §24 명세값(브래킷 허용) · 원색 + shadow.sm */}
              <span
                aria-hidden="true"
                className={`h-[10px] w-[10px] shrink-0 rounded-pill shadow-sm ${DOT[line.id]}`}
              />
              <BiText en={line.name_en} ko={line.name_ko} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
