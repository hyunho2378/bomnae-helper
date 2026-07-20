// tailwind.config.js — 전 테마 값은 src/tokens.js에서만 생성한다 (DESIGN.md §2: 하드코딩 금지).
// default 팔레트를 전면 교체해 토큰 외 클래스가 존재하지 않게 한다.
import tokens from './src/tokens.js';

const px = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, `${v}px`]));

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    colors: {
      ...tokens.colors,
      // 토큰 외 2값 — 명세 근거: white(DESIGN §7 CTA·§8 아이콘, PATTERNS §10 자막),
      // transparent(DESIGN §6 Header 초기 투명 배경)
      white: '#FFFFFF',
      transparent: 'transparent',
      inherit: 'inherit', // CSS 키워드(색상값 아님) — 컨텍스트 상속용
    },
    fontFamily: {
      display: tokens.fonts.display,
      body: tokens.fonts.body,
    },
    fontSize: { ...tokens.typeScale },
    spacing: Object.fromEntries(tokens.spacing.map((v) => [v, `${v}px`])),
    screens: px(tokens.breakpoints),
    borderRadius: px(tokens.radius),
    boxShadow: { ...tokens.shadow },
    zIndex: Object.fromEntries(
      Object.entries(tokens.z).map(([k, v]) => [k, String(v)]),
    ),
    transitionTimingFunction: {
      DEFAULT: tokens.motion.ease,
      spring: tokens.motion.spring,
    },
    transitionDuration: {
      fast: tokens.motion.fast,
      base: tokens.motion.base,
    },
    backdropBlur: { glass: tokens.blur.glass },
    // 자간 — DESIGN §4: display/h1 라틴 -0.01~-0.02em, eyebrow +0.08em
    letterSpacing: { display: '-0.02em', eyebrow: '0.08em' },
    // 컨테이너 캡 — tokens.containers(DESIGN §5) + Dialog 560(DESIGN §7)
    maxWidth: {
      none: 'none',
      full: '100%',
      lg: `${tokens.containers.maxLg}px`,
      '2xl': `${tokens.containers.max2xl}px`,
      '3xl': `${tokens.containers.max3xl}px`,
      dialog: '560px',
    },
    extend: {
      // 명세 고정 치수 — DESIGN §6(Header 72→56, Dock 56)·§7(CTA 48/44, 터치 타깃 44),
      // 푸터 라인 스트라이프 1px(DESIGN §6). 컴포넌트 파일 px 직입력 금지의 단일 출처.
      height: { px: '1px', 44: '44px', 56: '56px', 72: '72px' },
      width: { 44: '44px' },
      minHeight: { 44: '44px' },
      minWidth: { 44: '44px' },
    },
  },
  plugins: [],
};
