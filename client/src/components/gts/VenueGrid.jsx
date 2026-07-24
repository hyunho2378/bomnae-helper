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
  // [V20] 로드 실패 이미지 id 집합 — onError 시 해당 카드를 라이트 폴백으로 전환(§9.4 빈 박스 금지)
  const [failedImg, setFailedImg] = useState(() => new Set());
  const markFailed = (id) => setFailedImg((s) => (s.has(id) ? s : new Set(s).add(id)));
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
          { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }, // [V13] 재정렬 420ms(오류처럼 안 보이게)
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
      // [V13] 420ms — 카드가 축소되며 큐(아래)로 내려가는 경로가 눈에 보이게(사라짐이 아니라 이동)
      timerRef.current = setTimeout(() => {
        onToggle(id);
        setLeavingId(null);
      }, 420);
    } else {
      onToggle(id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className={`grid gap-8 ${COLS[cols]}`}>
        {visible.map((venue) => {
          const orderIdx = selected.indexOf(venue.id);
          const isSelected = orderIdx !== -1;
          const leaving = leavingId === venue.id;
          // [V20] 이미지 앞면: 파일 있고 로드 실패 안 했으면 사진+그라데이션+흰 텍스트, 아니면 라이트 폴백
          const hasImage = !!venue.image && !failedImg.has(venue.id);
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
                className={`pressable relative flex ${cols === 'half' ? 'h-[72px]' : 'h-[92px]'} w-full flex-col items-start gap-4 overflow-hidden rounded-lg p-12 text-left shadow-sm lg:h-[124px] ${
                  hasImage ? 'bg-ink' : venue.mock ? 'bg-surface' : 'bg-white'
                } ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                // [V13] 큐로 내려가는 마이크로인터랙션 420ms · 축소하며 아래(큐)로 이동하는 경로가 보이게
                //   (opacity는 약간 늦게 페이드 → 이동 중에도 카드가 보임 = "사라짐 아닌 이동" 인지)
                style={
                  leaving
                    ? {
                        transform: 'scale(0.6) translateY(72px)',
                        opacity: 0,
                        transformOrigin: 'center bottom',
                        transition: `transform 420ms ${motion.easeOut}, opacity 360ms ${motion.easeOut} 60ms`,
                      }
                    : undefined
                }
              >
                {/* [V20] 앞면 배경 사진 + 하단→상단 그라데이션(하단 0.72·상단 0.28로 밝은 사진서도 흰 텍스트 대비 확보) */}
                {hasImage && (
                  <>
                    <img
                      src={venue.image}
                      alt={venue.name.en}
                      loading="lazy"
                      onError={() => markFailed(venue.id)}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/40 to-ink/25"
                    />
                  </>
                )}
                {/* [V22] 선택 배지 = 우상단(돋보기가 우하단으로 이동해 자리 반환) */}
                {isSelected && (
                  <span className="absolute right-8 top-8 z-[1] inline-flex items-center rounded-pill bg-primary px-8 py-2 text-caption font-semibold text-white">
                    {badgeKeys?.[orderIdx] ? <LangSwap k={badgeKeys[orderIdx]} /> : orderIdx + 1}
                  </span>
                )}
                {/* [V22] 제목 말줄임 · 우패딩으로 선택 배지와 분리(돋보기는 우하단이라 제목과 안 겹침)
                    · half(컴팩트 picks) 카드는 1줄(칩 공간 확보), full(meal) 카드는 2줄 */}
                <TriText
                  text={venue.name}
                  className={`relative z-[1] pr-12 text-body font-bold ${hasImage ? 'text-white' : ''}`}
                  clampClass={cols === 'half' ? 'line-clamp-1' : 'line-clamp-2'}
                />
                {/* half 카드는 높이가 짧아 oneLine 생략(칩·제목 우선) · 상세 패널에 전체 소개 */}
                {cols !== 'half' && (
                  <TriText
                    text={venue.oneLine}
                    className={`relative z-[1] text-caption font-medium ${hasImage ? 'text-white/90' : 'text-inkSec'}`}
                    clampClass="line-clamp-1"
                  />
                )}
                {/* [V22] 칩 = 좌하단 · content 크기 고정(self-start)·돋보기(우하단) 자리 확보(max-w)·px-4로 라벨 잘림 방지 */}
                <span
                  className={`relative z-[1] mt-auto inline-flex shrink-0 items-center self-start rounded-pill px-8 py-2 text-caption font-medium ${
                    hasImage
                      ? 'bg-white/25 text-white'
                      : venue.mock
                        ? 'bg-white text-inkSec'
                        : 'bg-surface text-inkSec'
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
                  /* [V22] 우상단 → 우하단(칩과 좌우 분리) · bg-primary라 이미지/폴백 양쪽 대비 확보 */
                  className="pressable absolute bottom-8 right-8 inline-flex items-center justify-center rounded-pill bg-primary text-white shadow-sm"
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
