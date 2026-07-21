// 하단 고정 진행 바(IA §9.4 · 존 C4) · 현재 스텝 + 선택 요약(children) + 다음 버튼.
// 미충족 시 다음 disabled + 사유 문구(aria-live). 인식>회상(§16.10) — 요약 상시 노출.
// 위치: 모바일은 GlassDock(하단 필 · z-dock) 위에 뜨는 카드(shadow.md), lg+는 바닥 풀폭 바
//   (shadow.sheet · 독 없음). z-header(40) — 독(50)·시트(60) 아래.
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';

export default function BuildProgressBar({
  stepIndex,
  stepCount,
  disabled,
  reasonKey,
  onBack,
  onNext,
  children,
}) {
  return (
    <div className="fixed inset-x-16 bottom-80 z-header lg:inset-x-0 lg:bottom-0">
      <div className="rounded-lg bg-white shadow-md lg:rounded-none lg:shadow-sheet">
        <div className="mx-auto flex w-full flex-wrap items-center gap-x-16 gap-y-8 px-16 py-12 md:px-24 lg:max-w-lg lg:px-40 2xl:max-w-2xl 3xl:max-w-3xl">
          <div className="flex items-baseline gap-8">
            <LangSwap k="gts.build.stepLabel" className="text-caption font-medium text-inkSec" />
            <span className="font-display text-small font-bold">
              {stepIndex + 1} / {stepCount}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-12">{children}</div>
          <div aria-live="polite" className="flex items-center gap-12">
            {disabled && reasonKey && (
              <LangSwap k={reasonKey} className="text-caption font-medium text-spice" />
            )}
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                <LangSwap k="common.back" />
              </Button>
            )}
            <Button disabled={disabled} onClick={onNext}>
              <LangSwap k="common.next" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
