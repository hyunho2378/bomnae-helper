// VenueGrid · PATTERNS §30 명세 그대로 (존 C4).
// props { pool, pageSize:8, selected[], max, onToggle } + badgeKeys(선택 · 순서 배지 사전 키 —
//   미지정 시 숫자 1·2, meals에서 Lunch/Dinner 키 전달 · §30 배지 규칙의 표기 소스).
// lg 4열(8장 = 2행) / md 3열 / 모바일 2열. 새로고침 = 세컨더리 버튼(RefreshCw + 사전 키)
//   page = (page+1) % ceil(pool/pageSize) 로테이션 · 선택은 Context 소유라 페이지 전환에도 보존.
// 선택 카드: primary 2px 링(ring = box-shadow 구현 · 보더 아님) + 우상단 순서 배지.
// 목업 카드: surface 면 + "Coming soon" Chip. 사진 데이터가 없으므로 사진 영역은 어떤 카드에도
//   렌더하지 않는다(§9.4 "없으면 렌더 안 함 · 빈 박스 금지").
// 정원 초과 시 자동 해제 금지 — 수용 여부 판정은 Context toggle의 반환값을 페이지가 처리.
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import TriText from './TriText';

export default function VenueGrid({ pool, pageSize = 8, selected, max, onToggle, badgeKeys }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(pool.length / pageSize));

  // 풀 교체(탭 전환) 시 첫 페이지로 · 선택 상태는 Context가 보존
  useEffect(() => {
    setPage(0);
  }, [pool]);

  const visible = pool.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="flex flex-col gap-16">
      <div className="grid grid-cols-2 gap-12 md:grid-cols-3 lg:grid-cols-4">
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

      {/* 로테이션 · 풀이 한 페이지를 넘는 경우에만(§30) */}
      {pool.length > pageSize && (
        <div className="flex">
          <Button variant="secondary" onClick={() => setPage((p) => (p + 1) % pages)}>
            <RefreshCw size={16} aria-hidden="true" />
            <LangSwap k="gts.build.refresh" />
          </Button>
        </div>
      )}
    </div>
  );
}
