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
import { ZoomIn } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import { useLang } from '../../i18n/LangContext';
import Pagination from '../ui/Pagination';
import TriText from './TriText';

const COLS = {
  full: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  half: 'grid-cols-2',
};

export default function VenueGrid({
  pool,
  pageSize = 8,
  selected,
  max,
  onToggle,
  onDetail,
  badgeKeys,
  cols = 'full',
}) {
  const { t } = useLang();
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
            // [V2] 래퍼 div: 돋보기(상세)와 카드 본체(선택)를 형제 버튼으로 분리 —
            //   중첩 button 금지 + 이벤트 상호 오염 0(전파 경로 자체가 없음). 카드 높이 불변(버튼 absolute).
            <div key={venue.id} className="relative">
              <button
                type="button"
                onClick={() => onToggle(venue.id)}
                aria-pressed={isSelected}
                // [H2-12]+[v4.4-1] 카드 규격: 모바일 172 / lg 136(무스크롤 수납 명세값) ·
                //   이름·한 줄·Chip y좌표 전 카드 동일(Chip = mt-auto 바닥) · line-clamp
                className={`pressable relative flex h-[172px] w-full flex-col items-start gap-8 overflow-hidden rounded-lg p-16 text-left shadow-sm lg:h-[136px] ${
                  venue.mock ? 'bg-surface' : 'bg-white'
                } ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              >
                {/* 순서 배지 · 고른 순서 = 점심→저녁 또는 1·2(§9.4) — [V2] 돋보기(36) 좌측으로 이동 */}
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
                {/* 목업 = Coming soon Chip / 실명 = 카테고리 Chip(§30) · [H2-12] mt-auto 바닥 고정 */}
                <span
                  className={`mt-auto inline-flex items-center rounded-pill px-12 py-4 text-caption font-medium text-inkSec ${
                    venue.mock ? 'bg-white' : 'bg-surface'
                  }`}
                >
                  <LangSwap k={venue.mock ? 'gts.build.comingSoon' : `gts.build.cat.${venue.category}`} />
                </span>
              </button>
              {/* [V2] 돋보기 = 상세 오픈 전용(카드 클릭 = 선택 토글 유지) · rect = 카드 셀(FLIP 시작점) */}
              {onDetail && (
                <button
                  type="button"
                  aria-label={t('venues.detail.view')}
                  title={t('venues.detail.view')}
                  onClick={(e) =>
                    onDetail(venue, e.currentTarget.parentElement.getBoundingClientRect(), e.detail === 0)
                  }
                  className="pressable absolute right-8 top-8 inline-flex items-center justify-center rounded-pill bg-primary text-white shadow-sm"
                  style={{ width: 36, height: 36 }} // 36px 지시 명세값(spacing 토큰 외 수치)
                >
                  <ZoomIn size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* [H2-11] 숫자 원형 페이지네이션(IA §10.4 페어 규정 대체 · 전 그리드 공통) */}
      <Pagination page={page} pages={pages} onSelect={setPage} />
    </div>
  );
}
