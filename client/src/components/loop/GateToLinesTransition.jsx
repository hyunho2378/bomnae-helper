// DEPRECATED v4(IA §9.0) — 구 City Lines·Bag Delivery 잠정 퇴역: 라우트에서 제거됨. 삭제 금지, 재활용 예정.
// Gate→Lines 전환 모핑 · v3.2 신설(PATTERNS §22 · IA §8.5.5 · COMPONENTS 존 C2).
// /loop 진입 시 location.state?.transition === true면 Loop 페이지가 렌더.
// 타임라인(rAF · §22 대안 구현: stroke-dashoffset 조합, spring 금지 · linear/ease만):
//   ① 0~200ms   직선 3개(라인 3색) opacity 수렴(중앙으로 모임)
//   ② 200~700ms 원형 path draw-on(stroke-dasharray)
//   ③ 700~850ms "LINES ACTIVE" 라벨 fade
// 연출 총 850ms 이내(§22). 이후 상단 상태 라벨만 1.5s 잔존(IA §8.5.5 · 비차단) 후 종료.
// Escape = 즉시 스킵(사용자 통제) · reduced-motion = 연출 생략 즉시 종료.
// 종료 시 onDone → Loop가 history state 소거(replace). 과한 브랜드 애니 금지 · 장식 최소.
import { useEffect, useRef, useState } from 'react';
import { lineColors } from '../../tokens';
import { useLang } from '../../i18n/LangContext';

// §22 명세 타이밍(ms) · 총 850 이내
const CONVERGE_MS = 200;
const DRAW_MS = 500;
const LABEL_MS = 150;
const OVERLAY_MS = CONVERGE_MS + DRAW_MS + LABEL_MS; // 850
const LABEL_HOLD_MS = 1500; // IA §8.5.5 · 상태 라벨 1.5s 표시(비차단)

// 원 궤적 기하 · viewBox 240 기준(SVG 내부 좌표 · 레이아웃 px 아님)
const R = 60;
const CIRCUMFERENCE = 2 * Math.PI * R;
const LINE_YS = [-28, 0, 28]; // 직선 3개 세로 오프셋(수렴 시작점)
const LINE_COLOR_KEYS = ['potato', 'dakgalbi', 'lake'];

export default function GateToLinesTransition({ onDone }) {
  const { t } = useLang();
  const [phase, setPhase] = useState('overlay'); // 'overlay' → 'label'
  const lineRefs = useRef([]);
  const circleRef = useRef(null);
  const labelRef = useRef(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // reduced-motion · 연출 생략 즉시 종료(§22)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doneRef.current?.();
      return undefined;
    }

    let raf = 0;
    let holdTimer = 0;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
      doneRef.current?.();
    };

    // Escape 스킵 · 연출·잔존 라벨 어느 시점이든 즉시 종료(§22)
    const onKey = (e) => {
      if (e.key === 'Escape') finish();
    };
    document.addEventListener('keydown', onKey);

    const start = performance.now();
    const easeOut = (x) => 1 - (1 - x) ** 2; // §22 "ease"(spring 금지)
    const step = (now) => {
      const el = now - start;
      // ① 직선 3개 · opacity 수렴 + 중앙(0)으로 모임
      const p1 = Math.min(el / CONVERGE_MS, 1);
      lineRefs.current.forEach((node, i) => {
        if (!node) return;
        node.setAttribute('opacity', String(1 - p1));
        node.setAttribute('transform', `translate(0 ${LINE_YS[i] * (1 - easeOut(p1)) - LINE_YS[i]})`);
      });
      // ② 원형 path draw-on · stroke-dashoffset
      const p2 = Math.min(Math.max((el - CONVERGE_MS) / DRAW_MS, 0), 1);
      if (circleRef.current) {
        circleRef.current.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE * (1 - easeOut(p2))));
        circleRef.current.setAttribute('opacity', p2 > 0 ? '1' : '0');
      }
      // ③ 라벨 fade
      const p3 = Math.min(Math.max((el - CONVERGE_MS - DRAW_MS) / LABEL_MS, 0), 1);
      if (labelRef.current) labelRef.current.style.opacity = String(p3);

      if (el < OVERLAY_MS) {
        raf = requestAnimationFrame(step);
      } else {
        // 연출 종료(≤850ms) · 오버레이 해제, 상태 라벨만 1.5s 잔존(비차단)
        setPhase('label');
        holdTimer = setTimeout(finish, LABEL_HOLD_MS);
      }
    };
    raf = requestAnimationFrame(step);

    return () => {
      document.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
    };
  }, []);

  // 잔존 단계 · 상단 상태 라벨 필(비차단 · pointer-events 없음)
  if (phase === 'label') {
    return (
      <div
        role="status"
        aria-label={t('loop.transition.aria')}
        className="pointer-events-none fixed inset-x-0 top-96 z-dialog flex justify-center"
      >
        <span className="flex h-40 items-center rounded-pill bg-white px-16 font-display text-caption font-semibold uppercase tracking-eyebrow text-ink shadow-md">
          {t('loop.transition.label')}
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={t('loop.transition.aria')}
      className="fixed inset-0 z-dialog flex items-center justify-center bg-white"
    >
      <div className="flex flex-col items-center gap-24">
        <svg viewBox="0 0 240 240" aria-hidden="true" className="h-128 w-128">
          <g transform="translate(120 120)">
            {/* ① 직선 3개 · 라인 3색(tokens.lineColors) */}
            {LINE_COLOR_KEYS.map((key, i) => (
              <line
                key={key}
                ref={(node) => {
                  lineRefs.current[i] = node;
                }}
                x1={-84}
                x2={84}
                y1={LINE_YS[i]}
                y2={LINE_YS[i]}
                stroke={lineColors[key]}
                strokeWidth="6"
                strokeLinecap="round"
              />
            ))}
            {/* ② 원형 궤적 · draw-on(stroke-dasharray) · 크롬 단일색 primary */}
            <circle
              ref={circleRef}
              r={R}
              fill="none"
              stroke={lineColors.lake}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE}
              opacity="0"
              transform="rotate(-90)"
            />
          </g>
        </svg>
        {/* ③ "LINES ACTIVE" 라벨 · §16.7 연출 카피 예외 */}
        <p
          ref={labelRef}
          className="font-display text-small font-semibold uppercase tracking-eyebrow text-ink"
          style={{ opacity: 0 }}
        >
          {t('loop.transition.label')}
        </p>
      </div>
    </div>
  );
}
