// StepIndicator · [V8] 여정 단계 인디케이터 — 순수 표시 컴포넌트(클릭 이동 금지 · 단계 건너뛰기 사고 방지).
// 4단계 고정 · 라벨은 i18n gts.steps.s1~s4(지금 무엇을 하는 단계인지 그대로 · 추상 표현 금지).
// 상태 3종: active(primary 채움·라벨 진하게) / upcoming(회색 번호·라벨 옅게) / done(체크 — 추후 화면 재사용).
// 데스크톱(lg+): 번호 원형 24 + 라벨 + 짧은 연결선 16 · 모바일(<lg): 번호 원형만 + 현재 단계 라벨 1개(컴팩트).
// 접근성: nav aria-label + 현재 단계 aria-current="step".
// 태국어 라벨 줄바꿈 방지: whitespace-nowrap + th만 폰트 1단계 축소(text-caption → 11px 인용값).
import { Check } from 'lucide-react';
import { useLang } from '../../i18n/LangContext';

const STEPS = [1, 2, 3, 4];

export default function StepIndicator({ currentStep = 1 }) {
  const { t, lang } = useLang();
  // th 라벨이 가장 길어 한 줄 유지 위해 폰트 1단계 축소(명세 [3] 대응)
  const labelSize = lang === 'th' ? 'text-[11px]' : 'text-caption';

  const state = (n) => (n === currentStep ? 'active' : n < currentStep ? 'done' : 'upcoming');

  const circle = (n) => {
    const s = state(n);
    const base = 'flex h-24 w-24 shrink-0 items-center justify-center rounded-pill font-display text-caption font-bold';
    if (s === 'active') return `${base} bg-primary text-white`;
    if (s === 'done') return `${base} bg-primary text-white`;
    return `${base} bg-surface text-inkMeta`;
  };

  return (
    <nav aria-label={t('gts.steps.label')}>
      {/* 데스크톱 · 번호+라벨+연결선 4단계 전부 */}
      <ol className="hidden items-center gap-8 lg:flex">
        {STEPS.map((n) => {
          const s = state(n);
          return (
            <li key={n} className="flex items-center gap-8" aria-current={s === 'active' ? 'step' : undefined}>
              <span aria-hidden="true" className={circle(n)}>
                {s === 'done' ? <Check size={14} aria-hidden="true" /> : n}
              </span>
              <span
                className={`whitespace-nowrap ${labelSize} ${
                  s === 'active' ? 'font-semibold text-ink' : 'font-medium text-inkMeta'
                }`}
              >
                {t(`gts.steps.s${n}`)}
              </span>
              {/* 단계 사이 짧은 연결선(마지막 제외) */}
              {n < STEPS.length && <span aria-hidden="true" className="h-px w-16 bg-line" />}
            </li>
          );
        })}
      </ol>
      {/* 모바일 · 컴팩트(번호 원형만 + 현재 단계 라벨 1개) */}
      <ol className="flex items-center gap-8 lg:hidden">
        {STEPS.map((n) => {
          const s = state(n);
          return (
            <li key={n} className="flex items-center gap-8" aria-current={s === 'active' ? 'step' : undefined}>
              <span aria-hidden="true" className={circle(n)}>
                {s === 'done' ? <Check size={14} aria-hidden="true" /> : n}
              </span>
              {s === 'active' && (
                <span className={`whitespace-nowrap ${labelSize} font-semibold text-ink`}>
                  {t(`gts.steps.s${n}`)}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
