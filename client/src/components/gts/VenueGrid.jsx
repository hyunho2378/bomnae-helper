// VenueGrid · PATTERNS §30 → v4.2 §10.4 개정 (존 C5 — §30 로테이션 조항은 v4.2가 대체).
// "새로고침(RefreshCw · See other places)" 전면 폐지 → [이전 페이지][다음 페이지] 버튼 페어:
//   경계에서 비활성(순환 아님) · 전 카드 그리드 공통 문법.
// props { pool, pageSize, selected[], max, onToggle, badgeKeys, cols } — cols는 §10.4 반반 분할용
//   개정: 'full'(기본 · lg 4열) | 'half'(2열 고정 · 패널 반폭 4장 = 2×2).
// [V9] queueMode(true): 선택된 장소는 그리드에서 사라지고(큐로 이동), 남은 후보를 sortCoord(큐 마지막 좌표)
//   기준 가까운 순으로 재정렬 · 순서 변경은 FLIP 리플로우 애니메이션 · 선택 시 카드가 큐로 내려가는 마이크로인터랙션.
//   queueMode false(식사 스텝 등)는 기존 동작 그대로(선택 카드 = 링+배지로 그리드 잔류).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import { useLang } from '../../i18n/LangContext';
import Pagination from '../ui/Pagination';
import TriText from './TriText';
import { venueCoord } from '../../data/gts/mockCoords';
import { haversineKm } from '../../data/gts/distance';
import { motion } from '../../tokens';

const COLS = {
  full: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  half: 'grid-cols-2',
};

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function VenueGrid({
  pool,
  pageSize = 8,
  selected,
  max,
  onToggle,
  onDetail,
  badgeKeys,
  cols = 'full',
  queueMode = false,
  sortCoord = null,
}) {
  const { t } = useLang();
  const [page, setPage] = useState(0);
  const [leavingId, setLeavingId] = useState(null); // [V9] 큐로 내려가는 중인 카드
  const timerRef = useRef(0);
  const cardRefs = useRef(new Map()); // [V9] FLIP 위치 측정용
  const prevPos = useRef(new Map());

  // [V9] 큐 모드: 선택된 장소 제거 + sortCoord 기준 거리순 재정렬(비면 기본 순서)
  const shown = useMemo(() => {
    if (!queueMode) return pool;
    const rest = pool.filter((v) => !selected.includes(v.id));
    if (!sortCoord) return rest;
    return [...rest].sort(
      (a, b) => haversineKm(venueCoord(a), sortCoord) - haversineKm(venueCoord(b), sortCoord),
    );
  }, [pool, selected, queueMode, sortCoord]);

  const pages = Math.max(1, Math.ceil(shown.length / pageSize));

  // 풀 교체 시 첫 페이지로 · 선택 상태는 Context가 보존
  useEffect(() => {
    setPage(0);
  }, [pool]);
  // [V9] 선택 제거로 페이지가 범위를 넘으면 클램프
  useEffect(() => {
    if (page >= pages) setPage(pages - 1);
  }, [page, pages]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const visible = shown.slice(page * pageSize, page * pageSize + pageSize);

  // [V9] FLIP 리플로우 · shown(순서/구성) 변경 시 이전 위치→현재 위치로 부드럽게 이동
  useLayoutEffect(() => {
    if (!queueMode || prefersReduced()) return;
    cardRefs.current.forEach((el, id) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const prev = prevPos.current.get(id);
      if (prev && (prev.left !== rect.left || prev.top !== rect.top)) {
        el.animate(
          [
            { transform: `translate(${prev.left - rect.left}px, ${prev.top - rect.top}px)` },
            { transform: 'translate(0px, 0px)' },
          ],
          { duration: 280, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
      }
      prevPos.current.set(id, { left: rect.left, top: rect.top });
    });
  });

  // [V9] 큐 모드 선택: 수용될 때만(정원 미만) 카드가 큐로 내려가는 연출 후 토글 · 초과면 즉시 토글(안내)
  const onCardClick = (id) => {
    if (queueMode && selected.length < max && !prefersReduced()) {
      setLeavingId(id);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onToggle(id);
        setLeavingId(null);
      }, 200);
    } else {
      onToggle(id);
    }
  };

  return (
    <div className="flex flex-col gap-16">
      <div className={`grid gap-12 ${COLS[cols]}`}>
        {visible.map((venue) => {
          const orderIdx = selected.indexOf(venue.id);
          const isSelected = orderIdx !== -1;
          const leaving = leavingId === venue.id;
          return (
            <div
              key={venue.id}
              ref={queueMode ? (el) => cardRefs.current.set(venue.id, el) : undefined}
              className="relative"
            >
              <button
                type="button"
                onClick={() => onCardClick(venue.id)}
                aria-pressed={isSelected}
                className={`pressable relative flex h-[172px] w-full flex-col items-start gap-8 overflow-hidden rounded-lg p-16 text-left shadow-sm lg:h-[136px] ${
                  venue.mock ? 'bg-surface' : 'bg-white'
                } ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                // [V9] 큐로 내려가는 마이크로인터랙션(축소+하강+페이드 · §17 이징)
                style={
                  leaving
                    ? {
                        transform: 'scale(0.85) translateY(24px)',
                        opacity: 0,
                        transition: `transform 200ms ${motion.easeOut}, opacity 200ms ${motion.easeOut}`,
                      }
                    : undefined
                }
              >
                {isSelected && (
                  <span className="absolute right-48 top-8 inline-flex items-center rounded-pill bg-primary px-12 py-4 text-caption font-semibold text-white">
                    {badgeKeys?.[orderIdx] ? <LangSwap k={badgeKeys[orderIdx]} /> : orderIdx + 1}
                  </span>
                )}
                <TriText text={venue.name} className="text-body font-bold" clampClass="line-clamp-1" />
                <TriText
                  text={venue.oneLine}
                  className="text-caption font-medium text-inkSec"
                  clampClass="line-clamp-2"
                />
                <span
                  className={`mt-auto inline-flex items-center rounded-pill px-12 py-4 text-caption font-medium text-inkSec ${
                    venue.mock ? 'bg-white' : 'bg-surface'
                  }`}
                >
                  <LangSwap k={venue.mock ? 'gts.build.comingSoon' : `gts.build.cat.${venue.category}`} />
                </span>
              </button>
              {onDetail && (
                <button
                  type="button"
                  aria-label={t('venues.detail.view')}
                  title={t('venues.detail.view')}
                  onClick={(e) =>
                    onDetail(venue, e.currentTarget.parentElement.getBoundingClientRect(), e.detail === 0)
                  }
                  className="pressable absolute right-8 top-8 inline-flex items-center justify-center rounded-pill bg-primary text-white shadow-sm"
                  style={{ width: 36, height: 36 }}
                >
                  <ZoomIn size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Pagination page={page} pages={pages} onSelect={setPage} />
    </div>
  );
}
