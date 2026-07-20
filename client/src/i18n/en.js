// i18n 사전(EN 기본) — ko.js와 키 완전 동형(AGENT-REVIEW diff 검사 대상).
// UI 하드코딩 문자열 0 규칙의 단일 출처. 키 추가만 허용(삭제·개명 금지), 병합은 오케스트레이터가 수행.
const en = {
  meta: {
    title: {
      home: "Home",
      gate: "Gate",
      handsfree: "Hands-Free",
      loop: "Loop",
      lineDetail: "Line",
      booking: "Reserve seats",
      ticket: "Ticket",
      pilot: "Pilot",
      notFound: "Not found",
    },
  },
  nav: {
    home: "Home",
    gate: "Gate",
    loop: "Loop",
    pilot: "Pilot",
    login: "Sign in",
    logout: "Sign out",
    menu: "Menu",
  },
  home: {
    hero: {
      title: "You can't visit what you can't reach.",
      sub: "Airport to Chuncheon, and everywhere inside it.",
      ctaGate: "Find my route",
      ctaLoop: "See the lines",
      photoAlt: "Evening light over Soyang Lake and downtown Chuncheon",
    },
    problem: {
      stat: "4 / 5",
      text: "4 of 5 researchers, independently, reached the same conclusion: the problem isn't content — it's reach.",
    },
    gateEntry: {
      title: "Plan your arrival",
      sub: "Tell us where you land and when — we hand you the fastest way into Chuncheon.",
    },
    lines: {
      title: "Three lines, one Chuncheon",
      perAdult: "per adult",
    },
    how: {
      eyebrow: "Why it works",
      title: "How it works",
      step1: {
        title: "Reserve a seat",
        body: "Pick a line and a departure. Twelve seats per van — your seat is the match.",
      },
      step2: {
        title: "We pre-order ahead",
        body: "This is the difference: while you ride, we call ahead. Food starts cooking and passes get issued before the van arrives.",
      },
      step3: {
        title: "Arrive — it's ready",
        body: "No waiting line, no ordering hurdle. Walk in and it is already on the table.",
      },
    },
    pilotStrip: {
      eyebrow: "Pilot proof",
      body: "A real van, real riders, a real line — filmed on the road, not mocked up.",
      cta: "See the pilot run",
    },
  },
  gate: {
    title: "Airport to Chuncheon",
    intro: "Land at Incheon or Gimpo, clear immigration, and compare the two ways into Chuncheon — rail or direct bus.",
    form: {
      terminal: "Arrival terminal",
      date: "Arrival date",
      time: "Arrival time",
      submit: "Find my route",
      terminals: {
        t1: "Incheon T1",
        t2: "Incheon T2",
        gmp: "Gimpo (GMP)",
      },
      errors: {
        time: "Enter your arrival time — we need it to find the first departure you can catch.",
      },
    },
    results: {
      heading: "Your options",
      buffer: "Includes a 60-minute immigration buffer after landing.",
      duration: "Total time",
      fare: "Fare",
      transfers: "Transfers",
      direct: "Direct",
      firstAvailable: "First departure",
      nextDay: "Next day",
      stepsHeading: "Step by step",
    },
    handsfree: {
      title: "Send your bags ahead. Travel with just your body.",
      body: "Hands-free travel on the Japanese tebura (手ぶら観光) standard — your luggage goes straight to your Chuncheon stay.",
      cta: "Send my bags",
    },
  },
  handsfree: {
    title: "Send your bags ahead",
    intro: "Check your bags at the airport counter and they reach your Chuncheon accommodation first. An established luggage-delivery partner carries them — we run the Chuncheon booking layer.",
    form: {
      bags: "Bags",
      address: "Chuncheon accommodation address",
      email: "Contact email",
      perBag: "per bag",
      submit: "Send my bags",
      errors: {
        date: "Pick your arrival date so the counter expects your bags.",
        address: "Enter the Chuncheon address your bags should reach — the name of the stay plus its street address.",
        email: "Enter an email like name@example.com — your drop-off code goes there.",
      },
    },
    success: {
      title: "Your bags are booked.",
      codeLabel: "Drop-off code",
      body: "Show this code at the airport luggage counter on arrival day.",
      home: "Back to Home",
    },
  },
  loop: {
    title: "Live line map",
  },
  booking: {
    title: "Reserve seats",
    adults: "Adults",
    children: "Children",
    total: "Total",
  },
  ticket: {
    title: "Your ticket",
  },
  pilot: {
    title: "We already ran it.",
  },
  status: {
    confirmed: "Confirmed",
    likely: "Likely to run",
    closed: "Closed",
  },
  common: {
    close: "Close",
    back: "Back",
    next: "Next",
    confirm: "Confirm",
    loading: "Loading",
    increase: "Increase",
    decrease: "Decrease",
    share: "Share",
    download: "Download",
    language: "Language",
    lang: {
      en: "EN",
      ko: "KR",
    },
    loginGate: {
      title: "Sign in to confirm",
      google: "Continue with Google",
    },
    notFound: {
      title: "This stop doesn't exist.",
      body: "The page you are looking for has moved or never ran.",
      cta: "Back to Home",
    },
    footer: {
      credit: "Team Bomnae · Station C Solverthon",
      legal: "Prototype for demonstration — schedules, prices and stops are draft values.",
    },
    currency: "₩",
    units: {
      h: "h",
      m: "m",
    },
  },
};

export default en;
