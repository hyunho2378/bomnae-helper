// i18n 사전(EN 기본) — ko.js와 키 완전 동형(AGENT-REVIEW diff 검사 대상).
// UI 하드코딩 문자열 0 규칙의 단일 출처. AGENT-2/3는 키를 추가(삭제·개명 금지)한다.
const en = {
  meta: {
    title: {
      home: 'Home',
      gate: 'Gate',
      handsfree: 'Hands-Free',
      loop: 'Loop',
      lineDetail: 'Line',
      booking: 'Reserve seats',
      ticket: 'Ticket',
      pilot: 'Pilot',
      notFound: 'Not found',
    },
  },
  nav: {
    home: 'Home',
    gate: 'Gate',
    loop: 'Loop',
    pilot: 'Pilot',
    login: 'Sign in',
    logout: 'Sign out',
    menu: 'Menu',
  },
  home: {
    hero: {
      title: "You can't visit what you can't reach.",
      sub: 'Airport to Chuncheon, and everywhere inside it.',
      ctaGate: 'Find my route',
      ctaLoop: 'See the lines',
    },
  },
  gate: {
    title: 'Airport to Chuncheon',
  },
  handsfree: {
    title: 'Send your bags ahead',
  },
  loop: {
    title: 'Live line map',
  },
  booking: {
    title: 'Reserve seats',
    adults: 'Adults',
    children: 'Children',
    total: 'Total',
  },
  ticket: {
    title: 'Your ticket',
  },
  pilot: {
    title: 'We already ran it.',
  },
  status: {
    confirmed: 'Confirmed',
    likely: 'Likely to run',
    closed: 'Closed',
  },
  common: {
    close: 'Close',
    back: 'Back',
    next: 'Next',
    confirm: 'Confirm',
    loading: 'Loading',
    increase: 'Increase',
    decrease: 'Decrease',
    share: 'Share',
    download: 'Download',
    language: 'Language',
    lang: { en: 'EN', ko: 'KR' },
    loginGate: {
      title: 'Sign in to confirm',
      google: 'Continue with Google',
    },
    notFound: {
      title: "This stop doesn't exist.",
      body: 'The page you are looking for has moved or never ran.',
      cta: 'Back to Home',
    },
    footer: {
      credit: 'Team Bomnae · Station C Solverthon',
      legal: 'Prototype for demonstration — schedules, prices and stops are draft values.',
    },
  },
};

export default en;
