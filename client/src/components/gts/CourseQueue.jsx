// CourseQueue · [V9] 선택 큐 (food·activity 공용 · 유일한 공유 지점).
// 스몰 카드(순번 + 이름 + X) 선택 순서대로 · 우측 끝 합계 배지(거리·시간). 큐 비면 미표시.
// X = 큐에서 제거 → 해당 장소 그리드 복귀(GtsBuild가 togglePick으로 처리).
import { X } from 'lucide-react';
import TriText from './TriText';
import LangSwap from '../../i18n/LangSwap';
import { useLang } from '../../i18n/LangContext';
import { motion } from '../../tokens';

export default function CourseQueue({ items, onRemove, km, minutes }) {
  const { t } = useLang();
  if (!items.length) return null;
  // [V13] 거리 배지 = 픽 2개 이상일 때만(0.0km 상태 숨김). 값은 SUIT(기본 폰트)·저두께·큰 크기.
  const showEstimate = km > 0;
  return (
    <div className="flex flex-wrap items-center gap-8 rounded-lg bg-surface p-12">
      <LangSwap
        k="gts.build.queueTitle"
        className="shrink-0 text-caption font-semibold uppercase tracking-eyebrow text-inkMeta"
      />
      {items.map((v, i) => (
        <span
          key={v.id}
          className="flex items-center gap-6 rounded-pill bg-white py-4 pl-12 pr-4 shadow-sm"
          style={{ animation: `bh-queue-in 220ms ${motion.easeOut} both` }}
        >
          {/* [V13] "1: 이름" 형식 */}
          <span className="font-display text-caption font-bold text-primary">{i + 1}:</span>
          <TriText text={v.name} className="text-small font-semibold" />
          <button
            type="button"
            aria-label={t('gts.build.queueRemove')}
            title={t('gts.build.queueRemove')}
            onClick={() => onRemove(v.id)}
            className="pressable inline-flex h-24 w-24 items-center justify-center rounded-pill text-inkMeta hover:text-ink"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </span>
      ))}
      {/* [V13] 우측 끝 추정 거리 · 라벨(3언어) + 값(SUIT·medium·body). 픽 1개 이하면 숨김 */}
      {showEstimate && (
        <span className="ml-auto flex shrink-0 flex-col items-end leading-tight">
          <LangSwap k="gts.build.routeEstimate" className="text-caption font-medium text-inkMeta" />
          <span className="text-body font-medium text-primary">
            {`${t('gts.build.approx')} ${km.toFixed(1)}km · ${minutes}${t('gts.build.minUnit')}`}
          </span>
        </span>
      )}
      <style>{`@keyframes bh-queue-in { from { opacity: 0; transform: scale(0.9) translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
