// VenueGrid · PATTERNS §30 → v4.2 §10.4 개정 (존 C5 — §30 로테이션 조항은 v4.2가 대체).
// "새로고침(RefreshCw · See other places)" 전면 폐지 → [이전 페이지][다음 페이지] 버튼 페어:
//   경계에서 비활성(순환 아님) · 전 카드 그리드 공통 문법.
// props { pool, pageSize, selected[], max, onToggle, badgeKeys, cols } — cols는 §10.4 반반 분할용
//   개정: 'full'(기본 · lg 4열) | 'half'(2열 고정 · 패널 반폭 4장 = 2×2).
// 선택 카드: primary 2px 링(ring = box-shadow 구현 · 보더 아님) + 우상단 순서 배지.
// 목업 카드: surface 면 + "Coming soon" Chip · 사진 영역은 어떤 카드에도 렌더하지 않는다
//   (§9.4 "없으면 렌더 안 함 · 빈 박스 금지").
// 정원 초과 시 자동 해제 금지 — 수용 여부 판정은 Context toggle의 반환값을 페이지가 처리.
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import TriText from './TriText';

const COLS = {
  full: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  half: 'grid-cols-2',
};

export default function VenueGrid({ pool, pageSize = 8, selected, max, onToggle, badgeKeys, cols = 'full' }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(pool.length / pageSize));

  // 풀 교체 시 첫 페이지로 · 선택 상태는 Context가 보존
  useEffect(() => {
    setPage(0);
  }, [pool]);

  const visible = pool.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="flex flex-col gap-16">
      <div className={`grid gap-12 ${COLS[cols]}`}>
        {visible.map((venue) => {
          const orderIdx = selected.indexOf(venue.id);
          const isSelected = orderIdx !== -1;
          return (
            <button
              key={venue.id}
              type="button"
              onClick={() => onToggle(venue.id)}
              aria-pressed={isSelected}
              className={`pressable relative flex min-h-44 flex-col items-start gap-8 rounded-lg p-16 text-left shadow-sm ${
                venue.mock ? 'bg-surface' : 'bg-white'
              } ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
            >
              {/* 순서 배지 · 고른 순서 = 점심→저녁 또는 1·2(§9.4) */}
              {isSelected && (
                <span className="absolute right-8 top-8 inline-flex items-center rounded-pill bg-primary px-12 py-4 text-caption font-semibold text-white">
                  {badgeKeys?.[orderIdx] ? <LangSwap k={badgeKeys[orderIdx]} /> : orderIdx + 1}
                </span>
              )}
              <TriText text={venue.name} className="text-body font-bold" />
              <TriText text={venue.oneLine} className="text-caption font-medium text-inkSec" />
              {/* 목업 = Coming soon Chip / 실명 = 카테고리 Chip(§30) */}
              <span
                className={`inline-flex items-center rounded-pill px-12 py-4 text-caption font-medium text-inkSec ${
                  venue.mock ? 'bg-white' : 'bg-surface'
                }`}
              >
                <LangSwap k={venue.mock ? 'gts.build.comingSoon' : `gts.build.cat.${venue.category}`} />
              </span>
            </button>
          );
        })}
      </div>

      {/* §10.4 페이지네이션 페어 · 경계 비활성(순환 아님) — 풀이 한 페이지를 넘는 경우에만 */}
      {pool.length > pageSize && (
        <div className="flex items-center gap-12">
          <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            <ChevronLeft size={16} aria-hidden="true" />
            <LangSwap k="gts.build.prevPage" />
          </Button>
          <Button
            variant="secondary"
            disabled={page === pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
          >
            <LangSwap k="gts.build.nextPage" />
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
