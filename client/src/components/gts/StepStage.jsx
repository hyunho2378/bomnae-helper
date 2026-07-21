// StepStage · PATTERNS §41 몰입 스텝 오버레이 (존 C5 신설) — BuildProgressBar(하단 진행 바) 대체.
// 구조: fixed inset-0 z-sheet · scrim rgba(10,12,20,0.7)(§41 명세값) + 중앙 리퀴드 글래스 패널
//   (최대 폭 1040px · 높이 84vh 전부 §41 명세값 · 내부 스크롤 scroll-quiet ·
//   blur 허용면 재배정: 구 '지도 위 라인 카드' 슬롯).
// 상단: 스텝 라벨("1 / 3 · …") + 진행 도트 / 하단 중앙 고정 [뒤로](secondary) [다음](primary)
//   페어 — 항상 동일 위치, 첫 스텝 뒤로 = 나가기 확인 Dialog(Modal).
// 스텝 전환: 나가는 콘텐츠 translateX(-24px)+opacity / 들어오는 24px→0+opacity ·
//   280ms(tokens dur) easeInOut · reduced-motion 크로스페이드(StepStage.css 주석 참조).
// Escape = 뒤로 1스텝(첫 스텝은 나가기 확인). 글래스 위 텍스트는 ink 계열 선명색만(§17.4).
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from '../../tokens';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import './StepStage.css';

// Dialog(ui)와 동일한 포커스 트랩 문법(모달리티 표면 공통)
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

export default function StepStage({
  stepIndex,
  stepCount,
  titleKey,
  stepKey,
  onBack,
  onNext,
  nextDisabled = false,
  reasonKey = null,
  onExit,
  children,
}) {
  const { t } = useLang();
  const [exitOpen, setExitOpen] = useState(false);
  // 전환 씬: shown = 현재 스텝, leaving = 나가는 스텝(280ms 유지 후 제거)
  const [shown, setShown] = useState({ key: stepKey, node: children });
  const [leaving, setLeaving] = useState(null);
  const timerRef = useRef(0);
  const panelRef = useRef(null);

  useEffect(() => {
    if (shown.key !== stepKey) {
      clearTimeout(timerRef.current);
      setLeaving(shown);
      setShown({ key: stepKey, node: children });
      timerRef.current = setTimeout(() => setLeaving(null), parseInt(motion.dur, 10));
    } else if (shown.node !== children) {
      // 같은 스텝의 리렌더(선택 변화) 반영 — 전환 아님
      setShown({ key: stepKey, node: children });
    }
  }, [stepKey, children, shown]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // 풀스크린 모달리티 · 배경 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const handleBack = useCallback(() => {
    if (stepIndex === 0) setExitOpen(true);
    else onBack();
  }, [stepIndex, onBack]);

  // Escape = 뒤로 1스텝(§41) · 나가기 확인이 열려 있으면 Modal이 자체 처리
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || exitOpen) return;
      handleBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exitOpen, handleBack]);

  // §41 전환 수치는 tokens.motion 주입(키프레임은 StepStage.css)
  const stepAnim = (name) => ({ animation: `${name} ${motion.dur} ${motion.easeInOut} both` });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(titleKey)}
      className="fixed inset-0 z-sheet grid place-items-center p-16 md:p-24"
      onKeyDown={(e) => {
        if (e.key === 'Tab' && !exitOpen) trapTab(e, panelRef.current);
      }}
    >
      {/* §41 명세값 scrim rgba(10,12,20,0.7) — 명세 인용 한정 허용 */}
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'rgba(10,12,20,0.7)' }} />

      <div
        ref={panelRef}
        tabIndex={-1}
        // §41 명세값: 최대 폭 1040px · 높이 84vh — 명세 인용 한정 허용
        style={{ maxWidth: 1040, height: '84vh' }}
        className="relative flex w-full flex-col overflow-hidden rounded-xl bg-glass shadow-lg backdrop-blur-glass"
      >
        {/* 상단 · 스텝 라벨 + 진행 도트(§41) */}
        <div className="flex flex-col items-center gap-8 px-24 pb-16 pt-24">
          <p className="flex items-baseline gap-8 tracking-glass">
            <span className="font-display text-small font-bold">
              {stepIndex + 1} / {stepCount}
            </span>
            <span aria-hidden="true" className="text-small font-medium text-inkSec">
              ·
            </span>
            <LangSwap k={titleKey} className="text-small font-semibold" />
          </p>
          <div aria-hidden="true" className="flex items-center gap-8">
            {Array.from({ length: stepCount }, (_, i) => (
              // 정적 도트 열 · 개수 고정이라 인덱스 키 허용
              // eslint-disable-next-line react/no-array-index-key
              <span key={i} className={`h-8 w-8 rounded-pill ${i <= stepIndex ? 'bg-primary' : 'bg-line'}`} />
            ))}
          </div>
        </div>

        {/* 콘텐츠 · 내부 스크롤 scroll-quiet(§41) — 전환 중엔 나가는 씬을 절대배치로 겹침 */}
        <div className="relative flex-1 overflow-y-auto scroll-quiet px-24 pb-24 md:px-40">
          {leaving && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-24 top-0 md:inset-x-40"
              style={stepAnim('bh-step-out')}
            >
              {leaving.node}
            </div>
          )}
          <div key={shown.key} style={leaving ? stepAnim('bh-step-in') : undefined}>
            {shown.node}
          </div>
        </div>

        {/* 하단 중앙 고정 버튼 페어(§41) · 항상 동일 위치 · 사유는 aria-live */}
        <div className="flex flex-col items-center gap-8 px-24 py-16">
          <div aria-live="polite">
            {nextDisabled && reasonKey && (
              <LangSwap k={reasonKey} className="text-caption font-medium text-spice" />
            )}
          </div>
          <div className="flex items-center justify-center gap-12">
            <Button variant="secondary" onClick={handleBack}>
              <LangSwap k="common.back" />
            </Button>
            <Button disabled={nextDisabled} onClick={onNext}>
              <LangSwap k="common.next" />
            </Button>
          </div>
        </div>
      </div>

      {/* 첫 스텝 뒤로 = 플로우 나가기 확인(§41) */}
      <Modal open={exitOpen} onClose={() => setExitOpen(false)} title="gts.build.exitTitle">
        <div className="flex flex-col gap-24">
          <LangSwap k="gts.build.exitBody" as="p" className="text-body" />
          <div className="flex flex-wrap items-center gap-12">
            <Button onClick={() => setExitOpen(false)}>
              <LangSwap k="gts.build.exitStay" />
            </Button>
            <Button variant="secondary" onClick={onExit}>
              <LangSwap k="gts.build.exitLeave" />
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
