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
  // 예: "약 12.4km · 25분" (지시 [1] 형식)
  const badge = `${t('gts.build.approx')} ${km.toFixed(1)}km · ${minutes}${t('gts.build.minUnit')}`;
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
          <span className="font-display text-caption font-bold text-primary">{i + 1}</span>
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
      {/* 우측 끝 합계 배지 · 큐 변경마다 즉시 갱신 */}
      <span className="ml-auto shrink-0 rounded-pill bg-primary px-12 py-6 font-display text-caption font-bold text-white">
        {badge}
      </span>
      <style>{`@keyframes bh-queue-in { from { opacity: 0; transform: scale(0.9) translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}
