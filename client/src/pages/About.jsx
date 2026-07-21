// About · [I1] v4.4 크라우드펀딩 정밀 전사 — 구도·비례·리듬 = 레퍼런스(대화 첨부 이미지),
// 텍스트 = 지시 문자열(brand.crowd) · 구현 = 토큰·프리미티브만. [H2] §19 버전 완전 대체.
// 섹션 15: 1 Hero(55:45+폰 SVG) / 2 공감 문제 / 3 해결 선언(수평 플로우) / 4 하루 일정(타임라인) /
//   5 숫자 증명(#proof) / 6 실사 풀블리드(글래스 카드) / 7 로컬 스토리 / 8 로컬 순환(궤도 SVG) /
//   9 비용 비교 / 10 후기(시드 인용) / 11 FAQ(상시 노출) / 12 리워드 4카드 / 13 자금 도넛 /
//   14 로드맵 / 15 팀·약속 + CTA 밴드(py-96).
// 리듬: py-64 lg:py-120(명세값 인라인) · 예외 6(py 0)·15(py-96) · 배경 전부 white(회색 밴드 금지).
// 모션: 뷰포트 진입 1회 — 카드 리빌(0.96→1 · 280ms easeOut · 60ms 스태거) · 카운트업 800ms ·
//   SVG draw-on · 진행바 채움. reduced-motion 전부 정적(즉시 최종값).
// sectionH2 = clamp(32,3.2vw,44) — 명세 800은 Kanit 로드 스택(400~700) 밖이라 700로 대체(보고).
// 연출값 단일 출처 = data/about/campaign.js. 사진 부재 시 surface 면(깨진 아이콘 금지).
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  Check,
  ChevronDown,
  Flag,
  ListChecks,
  Map as MapIcon,
  MapPin,
  Mountain,
  Coffee,
  Soup,
  Store,
  User as UserIcon,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import StickyBackBar from '../components/brand/StickyBackBar';
import Button from '../components/ui/Button';
import Container from '../components/layout/Container';
import { campaign, fundSplit, progress, proofStats, roadmap } from '../data/about/campaign';
import { seedReviews } from '../data/reviews';
import { colors, motion } from '../tokens';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 뷰포트 진입 1회 감지(리빌·카운트업·draw-on 공용) · reduced-motion은 즉시 true
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (reduced()) {
      setInView(true);
      return undefined;
    }
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

// 카드 리빌(0.96→1 + opacity · 280ms easeOut · 스태거 60ms) — §17.3 범주 2
function Reveal({ i = 0, on, children, className = '' }) {
  return (
    <div
      className={className}
      style={
        reduced()
          ? undefined
          : {
              opacity: on ? 1 : 0,
              transform: on ? 'none' : 'scale(0.96)',
              transition: `opacity ${motion.dur} ${motion.easeOut}, transform ${motion.dur} ${motion.easeOut}`,
              transitionDelay: `${i * 60}ms`,
            }
      }
    >
      {children}
    </div>
  );
}

// 카운트업(뷰포트 진입 1회 · 800ms) — reduced 즉시 최종값
function CountUp({ value, on }) {
  const [n, setN] = useState(reduced() ? value : 0);
  useEffect(() => {
    if (!on || reduced()) {
      if (on) setN(value);
      return undefined;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 800);
      setN(Math.round(value * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, value]);
  return <>{n.toLocaleString('en-US')}</>;
}

// SVG draw-on(진입 1회) 공용 스타일
const drawStyle = (on, len, delay = 0) =>
  reduced()
    ? undefined
    : {
        strokeDasharray: len,
        strokeDashoffset: on ? 0 : len,
        transition: `stroke-dashoffset 900ms ${motion.easeOut} ${delay}ms`,
      };

// 섹션 래퍼 · 리듬 py-64 lg:py-120(명세값 인라인 허용) — 배경 white 고정
function S({ id, className = '', children, rhythm = 'default' }) {
  const pad =
    rhythm === 'none' ? '' : rhythm === 'cta' ? 'py-96' : 'py-64 lg:py-[120px]';
  return (
    <section id={id} className={`${pad} ${className}`}>
      {children}
    </section>
  );
}

// 이 페이지 전용 sectionH2 · clamp(32,3.2vw,44) 700(Kanit 800 미로드 · 보고) · -0.02em
function H2({ k, center = false, className = '' }) {
  return (
    <LangSwap
      k={k}
      as="h2"
      className={`font-display text-[clamp(32px,3.2vw,44px)] font-bold leading-[1.1] tracking-display ${
        center ? 'text-center' : ''
      } ${className}`}
    />
  );
}

function Sub({ k, center = false }) {
  return (
    <LangSwap
      k={k}
      as="p"
      className={`mt-16 text-[18px] text-inkSec ${center ? 'text-center' : ''}`}
    />
  );
}

// 라벨·태그 12 600 uppercase +0.06em(명세값 인라인)
function Label({ k }) {
  // 라벨 +0.06em은 LangSwap이 style 미수용이라 래퍼가 소유
  return (
    <p className="text-caption font-semibold uppercase text-primary" style={{ letterSpacing: '0.06em' }}>
      <LangSwap k={k} />
    </p>
  );
}

// 사진 폴백 · 부재 시 surface 면(비율 유지 · 깨진 아이콘 금지)
function Photo({ src, alt = '', className = '', imgClassName = '' }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`overflow-hidden bg-surface ${className}`}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      )}
    </div>
  );
}

// ── §1 Hero: 55:45 · 우측 폰 SVG(지도면 + 루트 폴리라인 + 핀 3 draw-on 1회) ──
function HeroPhoneSvg({ on }) {
  return (
    <svg viewBox="0 0 320 400" className="mx-auto w-full max-w-[320px]" aria-hidden="true">
      {/* 폰 아래 primary 12% 타원 그림자 1개(그라데이션 아님) */}
      <ellipse cx="160" cy="386" rx="120" ry="12" fill={colors.primary} opacity="0.12" />
      {/* 폰 프레임 radius 24 ink stroke 2 */}
      <rect x="70" y="12" width="180" height="360" rx="24" fill="#fff" stroke={colors.ink} strokeWidth="2" />
      <rect x="86" y="44" width="148" height="296" rx="12" fill={colors.surface} />
      {/* 지도면 격자(line) */}
      {[88, 132, 176, 220, 264, 308].map((y) => (
        <line key={y} x1="86" y1={y} x2="234" y2={y} stroke={colors.line} strokeWidth="1" />
      ))}
      {[118, 160, 202].map((x) => (
        <line key={x} x1={x} y1="44" x2={x} y2="340" stroke={colors.line} strokeWidth="1" />
      ))}
      {/* primary 루트 폴리라인 draw-on */}
      <path
        d="M100 320 L140 268 L128 220 L176 176 L168 120 L212 84"
        fill="none"
        stroke={colors.primary}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={drawStyle(on, 420)}
      />
      {/* 핀 3 */}
      {[
        [100, 320],
        [176, 176],
        [212, 84],
      ].map(([x, y], i) => (
        <g key={`${x}-${y}`} style={reduced() ? undefined : { opacity: on ? 1 : 0, transition: `opacity 200ms ${motion.easeOut} ${300 + i * 200}ms` }}>
          <circle cx={x} cy={y} r="9" fill={colors.primary} />
          <circle cx={x} cy={y} r="3.5" fill="#fff" />
        </g>
      ))}
    </svg>
  );
}

// ── §3 수평 플로우 노드(모바일 수직) ──
const SYSTEM_NODES = [
  { key: 'route', icon: MapIcon },
  { key: 'ride', icon: Bus },
  { key: 'day', icon: ListChecks },
  { key: 'arrive', icon: Flag },
];

// ── §4 타임라인 ──
const DAY_ITEMS = [
  { key: 'i1', time: '12:00', icon: UtensilsCrossed },
  { key: 'i2', time: '14:00', icon: Mountain },
  { key: 'i3', time: '16:00', icon: Coffee },
  { key: 'i4', time: '18:00', icon: Soup },
  { key: 'i5', time: '20:00', icon: MapPin },
];

// ── §8 순환 SVG(원궤도 solid 2.5 + 노드 3 + 화살촉 3 · draw-on 1회) ──
function CycleSvg({ on }) {
  const R = 120;
  const C = 2 * Math.PI * R;
  const nodes = [
    { icon: Bus, a: -90 },
    { icon: Store, a: 30 },
    { icon: UserIcon, a: 150 },
  ];
  const pos = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return [170 + R * Math.cos(rad), 150 + R * Math.sin(rad)];
  };
  return (
    <svg viewBox="0 0 340 300" className="mx-auto w-full max-w-[420px]" aria-hidden="true">
      <circle
        cx="170"
        cy="150"
        r={R}
        fill="none"
        stroke={colors.primary}
        strokeWidth="2.5"
        style={drawStyle(on, C)}
      />
      {/* 화살촉 3(궤도 진행 방향) */}
      {[-30, 90, 210].map((a) => {
        const [x, y] = pos(a);
        return (
          <g key={a} transform={`translate(${x} ${y}) rotate(${a + 180})`}>
            <path d="M-6 -8 L6 0 L-6 8" fill="none" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      {nodes.map(({ icon: Icon, a }) => {
        const [x, y] = pos(a);
        return (
          <g key={a}>
            <circle cx={x} cy={y} r="32" fill="#fff" style={{ filter: 'drop-shadow(0 2px 10px rgba(20,23,46,0.07))' }} />
            <Icon x={x - 14} y={y - 14} width="28" height="28" color={colors.primary} strokeWidth={2} />
          </g>
        );
      })}
    </svg>
  );
}

// ── §13 도넛(진입 1회 채움 · conic 아님 · stroke 원호) ──
function DonutSvg({ on }) {
  const R = 84;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const palette = { ops: colors.primary, local: colors.ink, platform: '#7FB8F6', reserve: colors.line };
  return (
    <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[260px]" aria-hidden="true">
      <circle cx="110" cy="110" r={R} fill="none" stroke={colors.surface} strokeWidth="26" />
      {fundSplit.map(({ key, pct }) => {
        const start = acc;
        acc += pct;
        const len = (pct / 100) * C;
        return (
          <circle
            key={key}
            cx="110"
            cy="110"
            r={R}
            fill="none"
            stroke={palette[key]}
            strokeWidth="26"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={reduced() || on ? C * (1 - start / 100) + C * 0.25 : C * 1.25}
            style={reduced() ? undefined : { transition: `stroke-dashoffset 900ms ${motion.easeOut} ${start * 6}ms` }}
          />
        );
      })}
    </svg>
  );
}

// 후기 3건 · 기존 시드 인용(창작 금지 · en 시드 상위 3)
const SAID = seedReviews.filter((r) => r.lang === 'en').slice(0, 3);

export default function About() {
  const { t } = useLang();
  const [heroRef, heroOn] = useInView();
  const [sysRef, sysOn] = useInView();
  const [dayRef, dayOn] = useInView();
  const [proofRef, proofOn] = useInView();
  const [storyRef, storyOn] = useInView();
  const [cycleRef, cycleOn] = useInView();
  const [mathRef, mathOn] = useInView();
  const [saidRef, saidOn] = useInView();
  const [rewardRef, rewardOn] = useInView();
  const [fundsRef, fundsOn] = useInView();
  const [roadRef, roadOn] = useInView();
  const heroEndRef = useRef(null);
  const ctaBandRef = useRef(null);

  const fmt = (n) => `₩${n.toLocaleString('en-US')}`;

  return (
    <div className="bg-white">
      <StickyBackBar heroEndRef={heroEndRef} ctaBandRef={ctaBandRef} />

      {/* 1 · Hero — 55:45, h1 2행(ink/primary), CTA 52 */}
      <S id="hero" rhythm="none" className="pb-64 pt-96 lg:pb-[120px] lg:pt-[152px]">
        <Container>
          <div ref={heroRef} className="grid items-center gap-40 lg:grid-cols-[55fr_45fr]">
            <div className="flex flex-col gap-24">
              <h1 className="font-display text-[clamp(44px,5vw,72px)] font-bold leading-[1.05] tracking-display">
                <LangSwap k="brand.crowd.hero.title1" as="span" className="block text-ink" />
                <LangSwap k="brand.crowd.hero.title2" as="span" className="block text-primary" />
              </h1>
              <LangSwap k="brand.crowd.hero.sub" as="p" className="text-[18px] text-inkSec" />
              <div className="flex">
                {/* CTA 높이 52 = 명세값 */}
                <Button as="a" href="#rewards" style={{ height: 52 }}>
                  <LangSwap k="brand.crowd.hero.cta" />
                </Button>
              </div>
            </div>
            <HeroPhoneSvg on={heroOn} />
          </div>
        </Container>
        <div ref={heroEndRef} aria-hidden="true" />
      </S>

      {/* 2 · 공감 문제 — 중앙 정렬 허용 섹션 */}
      <S id="problem">
        <Container>
          <H2 k="brand.crowd.problem.title" center />
          <Sub k="brand.crowd.problem.sub" center />
          <div ref={sysRef} className="mt-48 grid gap-24 md:grid-cols-3">
            {[
              { key: 'signs', icon: MapIcon },
              { key: 'spread', icon: MapPin },
              { key: 'taxi', icon: Bus },
            ].map(({ key, icon: Icon }, i) => (
              <Reveal key={key} i={i} on={sysOn}>
                <article className="flex h-full flex-col items-center gap-16 rounded-lg bg-white p-32 text-center shadow-sm transition-shadow duration-fast hover:shadow-md">
                  {/* 아이콘 44 primary 단독(원 배경 금지) */}
                  <Icon size={44} strokeWidth={2} aria-hidden="true" className="text-primary" />
                  <LangSwap
                    k={`brand.crowd.problem.cards.${key}.t`}
                    as="h3"
                    className="flex min-h-[56px] items-center text-[19px] font-bold leading-[1.35]"
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </S>

      {/* 3 · 해결 선언 — 좌정렬 헤더 + 전폭 패널 수평 플로우 */}
      <S id="system">
        <Container>
          <Label k="brand.crowd.system.label" />
          <H2 k="brand.crowd.system.title" className="mt-8" />
          <div className="mt-40 rounded-xl bg-white p-24 shadow-sm lg:p-48">
            <div className="flex flex-col gap-32 lg:flex-row lg:items-start lg:justify-between lg:gap-0">
              {SYSTEM_NODES.map(({ key, icon: Icon }, i) => (
                <div key={key} className="flex flex-1 items-start gap-16 lg:flex-col lg:items-center lg:text-center">
                  <div className="relative flex shrink-0 items-center lg:w-full lg:justify-center">
                    {/* 연결선 primary 3px(진입 draw-on · lg 수평) */}
                    {i < 3 && (
                      <svg
                        aria-hidden="true"
                        className="absolute left-[72px] top-1/2 hidden h-[3px] w-[calc(100%-72px)] -translate-y-1/2 lg:block"
                        preserveAspectRatio="none"
                        viewBox="0 0 100 3"
                      >
                        <line x1="0" y1="1.5" x2="100" y2="1.5" stroke={colors.primary} strokeWidth="3" style={drawStyle(sysOn, 100, i * 150)} />
                      </svg>
                    )}
                    <span className="relative z-content flex h-[72px] w-[72px] items-center justify-center rounded-pill bg-white shadow-sm">
                      <Icon size={28} strokeWidth={2} aria-hidden="true" className="text-primary" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-4 lg:mt-16">
                    <LangSwap k={`brand.crowd.system.nodes.${key}.t`} className="text-body font-bold" />
                    <LangSwap k={`brand.crowd.system.nodes.${key}.sub`} className="text-[13px] font-medium text-inkSec" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </S>

      {/* 4 · 하루 일정 — 40:60 · 타임라인(밴 아이콘 고정 장식 · 이동 애니메이션 금지 §28) */}
      <S id="day">
        <Container>
          <div ref={dayRef} className="grid gap-40 lg:grid-cols-[40fr_60fr] lg:items-center">
            <div>
              <H2 k="brand.crowd.day.title" />
              <Sub k="brand.crowd.day.sub" />
            </div>
            <div className="relative rounded-xl bg-white p-32 shadow-sm">
              <Bus size={20} aria-hidden="true" className="absolute left-[43px] top-12 text-primary" />
              <ol className="relative flex flex-col">
                {/* 수직 primary 3px 라인 */}
                <span aria-hidden="true" className="absolute bottom-24 left-[23px] top-8 w-[3px] rounded-pill bg-primary" />
                {DAY_ITEMS.map(({ key, time, icon: Icon }) => (
                  <li key={key} className="relative flex items-center gap-20 py-20 pl-0">
                    <span className="relative z-content flex h-48 w-48 shrink-0 items-center justify-center rounded-pill bg-white shadow-sm">
                      <Icon size={20} strokeWidth={2} aria-hidden="true" className="text-primary" />
                    </span>
                    <span className="font-display text-body font-bold text-primary">{time}</span>
                    <LangSwap k={`brand.crowd.day.items.${key}.text`} className="min-w-0 text-body font-medium text-ink" />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </S>

      {/* 5 · 숫자 증명(#proof) — hairline 전폭 · 다른 요소 금지 */}
      <div aria-hidden="true" className="h-px w-full bg-line" />
      <S id="proof">
        <Container>
          <div ref={proofRef}>
            <H2 k="brand.crowd.proof.title" center />
            <div className="mt-64 grid gap-40 md:grid-cols-3">
              {proofStats.map(({ key, value }) => (
                <div key={key} className="flex flex-col items-center gap-12 text-center">
                  <span className="font-display text-[clamp(96px,10vw,160px)] font-bold leading-none text-primary">
                    <CountUp value={value} on={proofOn} />
                  </span>
                  <LangSwap k={`brand.crowd.proof.stats.${key}`} className="text-body font-semibold text-ink" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </S>
      <div aria-hidden="true" className="h-px w-full bg-line" />

      {/* 6 · 실사 풀블리드(py 0) — van-hero + 좌측 8% 글래스 카드(§35) */}
      <S id="photo" rhythm="none">
        <div className="relative h-[72vh] w-full">
          <Photo src="/images/about/van-hero.jpg" className="absolute inset-0 h-full w-full" />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-scrim/20 to-transparent" />
          <div className="absolute left-[8%] top-1/2 w-[320px] max-w-[84%] -translate-y-1/2">
            <div className="chrome flex flex-col gap-16 rounded-xl p-28 shadow-lg" style={{ padding: 28 }}>
              <LangSwap k="brand.crowd.photo.cardTitle" as="h3" className="text-[18px] font-bold" />
              <p className="flex items-baseline gap-8">
                <span className="font-display text-[28px] font-bold text-primary">₩0</span>
                <LangSwap k="brand.crowd.photo.zeroTail" className="text-small font-semibold text-ink" />
              </p>
              <ul className="flex flex-col gap-8">
                {['c1', 'c2', 'c3'].map((c) => (
                  <li key={c} className="flex items-center gap-8">
                    <Check size={16} aria-hidden="true" className="shrink-0 text-primary" />
                    <LangSwap k={`brand.crowd.photo.checks.${c}`} className="text-small font-medium text-ink" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </S>

      {/* 7 · 로컬 스토리 — 2열 · 16:10 사진 · hairline pill 태그 */}
      <S id="stories">
        <Container>
          <H2 k="brand.crowd.stories.title" />
          <Sub k="brand.crowd.stories.sub" />
          <div ref={storyRef} className="mt-40 grid gap-32 md:grid-cols-2">
            {[
              { key: 'bakery', img: '/images/about/story-bakery.jpg' },
              { key: 'roastery', img: '/images/about/story-roastery.jpg' },
            ].map(({ key, img }, i) => (
              <Reveal key={key} i={i} on={storyOn}>
                <article className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow duration-fast hover:shadow-md">
                  <Photo src={img} className="aspect-[16/10] w-full rounded-t-lg" />
                  <div className="flex flex-col gap-12" style={{ padding: 28 }}>
                    <LangSwap k={`brand.crowd.stories.cards.${key}.t`} as="h3" className="text-[19px] font-bold" />
                    <LangSwap k={`brand.crowd.stories.cards.${key}.body`} as="p" className="text-[15px] text-inkSec" />
                    {/* 태그: primary 텍스트 + hairline pill(배경 없음 — 틴트 금지 준수) */}
                    <span className="w-fit rounded-pill px-12 py-4 text-caption font-semibold text-primary" style={{ boxShadow: `inset 0 0 0 1px ${colors.line}` }}>
                      <LangSwap k={`brand.crowd.stories.cards.${key}.tag`} />
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </S>

      {/* 8 · 로컬 순환 — 50:50 · 궤도 SVG draw-on */}
      <S id="cycle">
        <Container>
          <div ref={cycleRef} className="grid items-center gap-40 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-[clamp(32px,3.5vw,48px)] font-bold leading-[1.1] tracking-display">
                {t('brand.crowd.cycle.title')}
              </h2>
              <LangSwap k="brand.crowd.cycle.body" as="p" className="mt-16 text-[18px] text-inkSec" />
            </div>
            <CycleSvg on={cycleOn} />
          </div>
        </Container>
      </S>

      {/* 9 · 비용 비교 — 패널 1장 3열 · GTS 열 승격 */}
      <S id="math">
        <Container>
          <H2 k="brand.crowd.math.title" center />
          <div ref={mathRef} className="mt-56 rounded-xl bg-white p-24 shadow-sm lg:p-40">
            <div className="grid gap-24 md:grid-cols-3">
              {['taxi', 'bus', 'gts'].map((col) => {
                const isGts = col === 'gts';
                return (
                  <div
                    key={col}
                    className={`relative flex flex-col gap-16 rounded-lg p-24 ${
                      isGts ? 'bg-primary text-white shadow-lg md:-translate-y-8' : ''
                    }`}
                  >
                    {isGts && (
                      <span className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-pill bg-white px-12 py-4 text-caption font-bold text-primary shadow-sm">
                        <LangSwap k="brand.crowd.math.badge" />
                      </span>
                    )}
                    <LangSwap k={`brand.crowd.math.cols.${col}.name`} className={`text-small font-semibold ${isGts ? 'text-white' : 'text-inkSec'}`} />
                    <LangSwap k={`brand.crowd.math.cols.${col}.price`} className={`font-display text-[40px] font-bold leading-none ${isGts ? 'text-white' : 'text-ink'}`} />
                    <ul className="flex flex-col gap-8">
                      {['r1', 'r2', 'r3'].map((r) => (
                        <li key={r} className="flex items-start gap-8">
                          {isGts ? (
                            <Check size={16} aria-hidden="true" className="mt-2 shrink-0 text-white" />
                          ) : (
                            <X size={16} aria-hidden="true" className="mt-2 shrink-0 text-ink opacity-40" />
                          )}
                          <LangSwap k={`brand.crowd.math.cols.${col}.${r}`} className={`text-[15px] ${isGts ? 'text-white' : 'text-inkSec'}`} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </S>

      {/* 10 · 후기 — 시드 3건 인용(창작 금지) · 카드 높이 동일 */}
      <S id="said">
        <Container>
          <H2 k="brand.crowd.said.title" center />
          <div ref={saidRef} className="mt-48 grid gap-24 md:grid-cols-3">
            {SAID.map((r, i) => (
              <Reveal key={r.id} i={i} on={saidOn}>
                <article className="flex h-[220px] flex-col gap-12 rounded-lg bg-white p-24 shadow-sm">
                  <span role="img" aria-label={`${r.rating} / 5`} className="flex gap-4 text-primary">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <svg key={n} width="16" height="16" viewBox="0 0 24 24" fill={n <= r.rating ? colors.primary : colors.line} aria-hidden="true">
                        <path d="M12 2l2.9 6.26 6.6.62-5 4.45 1.5 6.47L12 16.9 6 19.8l1.5-6.47-5-4.45 6.6-.62z" />
                      </svg>
                    ))}
                  </span>
                  <p lang={r.lang} className="line-clamp-3 text-[18px] font-semibold leading-[1.4]">
                    {r.body}
                  </p>
                  <p className="mt-auto text-[13px] text-inkSec">
                    {r.initials}, {r.country?.en ?? ''}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </S>

      {/* 11 · FAQ — 행 4 · 답 상시 노출(ChevronDown 장식) */}
      <S id="faq">
        <Container>
          <H2 k="brand.crowd.faq.title" />
          <div className="mt-40 flex flex-col divide-y divide-line">
            {['q1', 'q2', 'q3', 'q4'].map((q) => (
              <div key={q} className="grid min-h-[72px] grid-cols-[1fr_auto] items-center gap-16 py-16 md:grid-cols-[280px_1px_1fr_auto]">
                <LangSwap k={`brand.crowd.faq.${q}.q`} as="h3" className="text-body font-bold" />
                <span aria-hidden="true" className="hidden h-full w-px bg-line md:block" />
                <LangSwap k={`brand.crowd.faq.${q}.a`} as="p" className="col-span-2 text-[15px] text-ink md:col-span-1" />
                <ChevronDown size={16} aria-hidden="true" className="hidden text-inkMeta md:block" />
              </div>
            ))}
          </div>
        </Container>
      </S>

      {/* 12 · 리워드 — 4열 등폭 등고 · Select mt-auto · MOST POPULAR 링+리본 */}
      <S id="rewards">
        <Container>
          <H2 k="brand.crowd.rewards.title" center />
          <div ref={rewardRef} className="mt-56 grid gap-24 md:grid-cols-2 lg:grid-cols-4">
            {[
              { key: 'early' },
              { key: 'full', popular: true },
              { key: 'duo' },
              { key: 'patron' },
            ].map(({ key, popular }, i) => (
              <Reveal key={key} i={i} on={rewardOn} className="h-full">
                <article
                  className={`relative flex h-full min-h-[320px] flex-col gap-16 rounded-lg bg-white p-24 shadow-sm ${
                    popular ? 'ring-[1.5px] ring-primary' : ''
                  }`}
                >
                  {popular && (
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-primary px-12 py-4 text-caption font-bold text-white">
                      <LangSwap k="brand.crowd.rewards.ribbon" />
                    </span>
                  )}
                  <LangSwap k={`brand.crowd.rewards.tiers.${key}.price`} className="font-display text-[28px] font-bold leading-none text-primary" />
                  <LangSwap k={`brand.crowd.rewards.tiers.${key}.name`} className="text-body font-bold" />
                  <ul className="flex flex-col gap-8">
                    {['r1', 'r2', 'r3'].map((r) => (
                      <li key={r} className="flex items-start gap-8">
                        <Check size={16} aria-hidden="true" className="mt-2 shrink-0 text-primary" />
                        <LangSwap k={`brand.crowd.rewards.tiers.${key}.${r}`} className="text-small text-inkSec" />
                      </li>
                    ))}
                  </ul>
                  {/* Select = 세컨더리 pill 풀폭 · mt-auto 바닥 고정 */}
                  <div className="mt-auto grid">
                    <Button as={Link} to="/gts" variant="secondary">
                      <LangSwap k="brand.crowd.rewards.select" />
                    </Button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </S>

      {/* 13 · 자금 사용처 — 도넛 + 캠페인 수치(campaign.js 단일 출처) */}
      <S id="funds">
        <Container>
          <div ref={fundsRef} className="grid items-center gap-40 lg:grid-cols-2">
            <div className="flex flex-col gap-16">
              <H2 k="brand.crowd.funds.title" />
              <p className="flex flex-wrap items-baseline gap-8">
                <span className="font-display text-[28px] font-bold text-ink">{fmt(campaign.raised)}</span>
                <LangSwap k="brand.crowd.funds.raisedOf" className="text-small font-medium text-inkSec" />
                <span className="font-display text-[20px] font-bold text-inkSec">{fmt(campaign.goal)}</span>
                <LangSwap k="brand.crowd.funds.goalTail" className="text-small font-medium text-inkSec" />
              </p>
              {/* 진행바 · 진입 1회 채움 */}
              <div className="h-8 w-full max-w-[420px] overflow-hidden rounded-pill bg-surface">
                <div
                  className="h-full rounded-pill bg-primary"
                  style={{
                    width: reduced() || fundsOn ? `${Math.round(progress * 100)}%` : '0%',
                    transition: reduced() ? undefined : `width 900ms ${motion.easeOut}`,
                  }}
                />
              </div>
              <p className="flex items-baseline gap-16">
                <span className="flex items-baseline gap-4">
                  <span className="font-display text-body font-bold">{campaign.backers}</span>
                  <LangSwap k="brand.crowd.funds.backers" className="text-small font-medium text-inkSec" />
                </span>
                <span className="flex items-baseline gap-4">
                  <span className="font-display text-body font-bold">{campaign.daysLeft}</span>
                  <LangSwap k="brand.crowd.funds.daysLeft" className="text-small font-medium text-inkSec" />
                </span>
              </p>
              <ul className="mt-8 flex flex-col gap-8">
                {fundSplit.map(({ key, pct }) => (
                  <li key={key} className="flex items-center gap-12">
                    <span
                      aria-hidden="true"
                      className="h-12 w-12 rounded-pill"
                      style={{ background: { ops: colors.primary, local: colors.ink, platform: '#7FB8F6', reserve: colors.line }[key] }}
                    />
                    <LangSwap k={`brand.crowd.funds.legend.${key}`} className="text-small font-medium text-ink" />
                    <span className="font-display text-small font-bold text-inkSec">{pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <DonutSvg on={fundsOn} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-h2 font-bold text-ink">{t('brand.crowd.funds.center1')}</span>
                <LangSwap k="brand.crowd.funds.center2" className="text-small font-semibold text-inkSec" />
              </div>
            </div>
          </div>
        </Container>
      </S>

      {/* 14 · 로드맵 — 수평 타임라인 4노드 */}
      <S id="roadmap">
        <Container>
          <H2 k="brand.crowd.roadmap.title" center />
          <div ref={roadRef} className="relative mt-64">
            <svg aria-hidden="true" className="absolute left-0 right-0 top-[35px] hidden h-[3px] w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 3">
              <line x1="0" y1="1.5" x2="100" y2="1.5" stroke={colors.primary} strokeWidth="3" style={drawStyle(roadOn, 100)} />
            </svg>
            <div className="grid gap-32 md:grid-cols-4">
              {roadmap.map(({ key, year }, i) => (
                <div key={key} className="relative flex flex-col items-center gap-12 text-center">
                  <span className="rounded-pill bg-surface px-12 py-4 font-display text-caption font-bold text-ink">{year}</span>
                  <span className="relative z-content h-16 w-16 rounded-pill bg-primary shadow-sm" style={reduced() ? undefined : { opacity: roadOn ? 1 : 0, transition: `opacity 200ms ${motion.easeOut} ${i * 200}ms` }} />
                  <LangSwap k={`brand.crowd.roadmap.steps.${key}`} className="text-small font-semibold" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </S>

      {/* 15 · 팀 + 약속(py-96) → CTA 밴드(primary 풀블리드) */}
      <S id="team" rhythm="cta">
        <Container>
          <div className="grid gap-40 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-16">
              <Label k="brand.crowd.team.label" />
              <H2 k="brand.crowd.team.title" />
              <LangSwap k="brand.crowd.team.body" as="p" className="text-[16px] text-inkSec" />
            </div>
            <div className="flex flex-col gap-16 rounded-xl bg-white p-32 shadow-sm">
              <LangSwap k="brand.crowd.team.promiseTitle" as="h3" className="text-[19px] font-bold" />
              <ul className="flex flex-col gap-12">
                {['p1', 'p2', 'p3', 'p4'].map((p) => (
                  <li key={p} className="flex items-start gap-12">
                    <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-pill bg-primary">
                      <Check size={14} aria-hidden="true" className="text-white" />
                    </span>
                    <LangSwap k={`brand.crowd.team.${p}`} className="text-[15px] font-medium text-ink" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </S>
      <div ref={ctaBandRef}>
        <S id="cta" rhythm="cta" className="bg-primary text-white">
          <Container>
            <div className="flex flex-col items-center gap-24 text-center">
              <span aria-hidden="true" className="flex h-64 w-64 items-center justify-center rounded-lg bg-white font-display text-h2 font-bold text-primary">
                G
              </span>
              <h2 className="font-display text-[clamp(32px,3.2vw,44px)] font-bold leading-[1.1] tracking-display text-white">
                {t('brand.crowd.ctaBand.title')}
              </h2>
              <LangSwap k="brand.crowd.ctaBand.sub" as="p" className="text-[18px] text-white" />
              <div className="flex flex-wrap items-center justify-center gap-12">
                <span className="grid rounded-pill bg-white">
                  <Button as="a" href="#rewards" variant="secondary">
                    <LangSwap k="brand.crowd.ctaBand.primary" />
                  </Button>
                </span>
                <Button as={Link} to="/gts" variant="ghost" style={{ color: '#fff' }}>
                  <LangSwap k="brand.crowd.ctaBand.secondary" />
                </Button>
              </div>
            </div>
          </Container>
        </S>
      </div>
    </div>
  );
}
