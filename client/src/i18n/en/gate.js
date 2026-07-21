// gate 네임스페이스(EN) · 존 B(GATE) 소유. home/gate/handsfree.
// ko·th와 키 완전 동형. 줄표 금지. 존 A가 기존 키를 이관한 베이스라인이며 B가 확장한다.
// v3.1: 히어로 캐러셀 슬라이드/도트, proof 스트립, FieldSelect 플레이스홀더,
// 시간 라벨(gate.time.* · 30분 간격 24h, OS 오전/오후 누수 차단), 날짜 포맷 파트(gate.dates.*),
// HandsFree 독립 페이지(단계·설명·FAQ) 키 추가.
export default {
  home: {
    hero: {
      title: "You can't visit what you can't reach.",
      sub: "Airport to Chuncheon, and everywhere inside it.",
      ctaGate: "Find my route",
      ctaLoop: "See the lines",
      slides: {
        alt1: "A calm blue lake winding between forested mountains",
        alt2: "Morning mist over green ridges and a winding road",
        alt3: "A waterfall pouring into a deep green forest valley",
      },
      dots: {
        d1: "Show photo 1",
        d2: "Show photo 2",
        d3: "Show photo 3",
      },
    },
    problem: {
      stat: "4 / 5",
      text: "4 of 5 researchers, independently, reached the same conclusion: the problem isn't content, it's reach.",
    },
    gateEntry: {
      title: "Plan your arrival",
      sub: "Tell us where you land and when, and we hand you the fastest way into Chuncheon.",
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
        body: "Pick a line and a departure. Twelve seats per van, and your seat is the match.",
      },
      step2: {
        title: "We pre-order ahead",
        body: "This is the difference: while you ride, we call ahead. Food starts cooking and passes get issued before the van arrives.",
      },
      step3: {
        title: "Arrive, it's ready",
        body: "No waiting line, no ordering hurdle. Walk in and it is already on the table.",
      },
    },
    proof: {
      eyebrow: "Pilot proof",
      title: "We already ran it.",
      body: "A real van, real riders, a real line. Filmed on the road, not mocked up.",
      cta: "See the proof",
    },
  },
  gate: {
    title: "Airport to Chuncheon",
    intro: "Land at Incheon or Gimpo, clear immigration, and compare the two ways into Chuncheon: rail or direct bus.",
    form: {
      terminal: "Arrival terminal",
      // v3.2 §8.2.1: 출발지 필드(현재 위치 1옵션 + 공항 3개 병존) · Gate 플래너 전용 라벨
      from: "From",
      currentLocation: "Use my current location",
      date: "Arrival date",
      time: "Arrival time",
      submit: "Find my route",
      placeholders: {
        terminal: "Airport",
        date: "Date",
        time: "Time",
      },
      terminals: {
        t1: "Incheon T1",
        t2: "Incheon T2",
        gmp: "Gimpo",
      },
      terminalCodes: {
        t1: "ICN",
        t2: "ICN",
        gmp: "GMP",
      },
      errors: {
        time: "Enter your arrival time. We need it to find the first departure you can catch.",
      },
    },
    // 날짜 라벨 조립 파트 · 오늘부터 7일 옵션(FieldSelect) · 언어별 겹침 렌더로 시프트 0
    dates: {
      format: "{wd}, {mon} {day}",
      weekdays: { d0: "Sun", d1: "Mon", d2: "Tue", d3: "Wed", d4: "Thu", d5: "Fri", d6: "Sat" },
      months: {
        m1: "Jan", m2: "Feb", m3: "Mar", m4: "Apr", m5: "May", m6: "Jun",
        m7: "Jul", m8: "Aug", m9: "Sep", m10: "Oct", m11: "Nov", m12: "Dec",
      },
    },
    // 시간 라벨 · 30분 간격 48개 · 24h 표기(PATTERNS §11: 네이티브 time input의 OS 오전/오후 누수 차단)
    time: {
      '0000': "00:00", '0030': "00:30", '0100': "01:00", '0130': "01:30",
      '0200': "02:00", '0230': "02:30", '0300': "03:00", '0330': "03:30",
      '0400': "04:00", '0430': "04:30", '0500': "05:00", '0530': "05:30",
      '0600': "06:00", '0630': "06:30", '0700': "07:00", '0730': "07:30",
      '0800': "08:00", '0830': "08:30", '0900': "09:00", '0930': "09:30",
      '1000': "10:00", '1030': "10:30", '1100': "11:00", '1130': "11:30",
      '1200': "12:00", '1230': "12:30", '1300': "13:00", '1330': "13:30",
      '1400': "14:00", '1430': "14:30", '1500': "15:00", '1530': "15:30",
      '1600': "16:00", '1630': "16:30", '1700': "17:00", '1730': "17:30",
      '1800': "18:00", '1830': "18:30", '1900': "19:00", '1930': "19:30",
      '2000': "20:00", '2030': "20:30", '2100': "21:00", '2130': "21:30",
      '2200': "22:00", '2230': "22:30", '2300': "23:00", '2330': "23:30",
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
    // v3.2 §8.5 도착 감지(ArrivalWatcher) · 문안은 IA §8.5 고정 카피의 EN 이식(줄표 금지)
    arrival: {
      card: {
        offTitle: "Continue your journey after you arrive in Chuncheon?",
        offDesc: "Once you arrive in Chuncheon, we check your location and let you know it is time to start the city leg.",
        enable: "Turn on arrival check",
        guide: "How location is used",
        footnote: "We check only while this screen stays open",
        waitingTitle: "Waiting for your arrival in Chuncheon",
        disable: "Turn off arrival check",
        outsideTitle: "You are still outside Chuncheon",
        deniedTitle: "You can confirm arrival yourself, no location permission needed",
        manual: "I have arrived in Chuncheon",
        settings: "See location guidance again",
        errorTitle: "We couldn't read your current location",
        retry: "Check again",
        arrivedTitle: "You have arrived in Chuncheon.",
      },
      explain: {
        title: "We'll check your arrival",
        body: "To let you know when it is time to start the city leg, we use your current location once you reach Chuncheon. Location is used only to confirm arrival.",
        allow: "Allow location use",
        later: "Maybe next time",
        footnote: "You can turn off arrival check anytime in settings.",
      },
      modal: {
        label: "CHUNCHEON ARRIVAL",
        title: "You have arrived in Chuncheon.",
        // IA §8.5.4는 "본문 2문장"만 지정(문장 미확정) · 최소 창작, 오케스트레이터 확인 대상
        body: "The ride from the airport was the first leg. Now the city lines carry your journey inside Chuncheon.",
        continue: "Continue the journey",
        later: "Not right now",
        footnote: "We use your current location to help you move and explore in the city.",
      },
    },
    // v4 존 B4(IA §9.2) 양방향 플래너 · ko·th와 키 완전 동형 · 줄표 금지
    planner: {
      title: "Getting to and from Chuncheon",
      intro: "Pick where you start and where you arrive, and we show curated ways between your city and Chuncheon. Flip the direction for the way back.",
      dir: {
        label: "Direction",
        to: "To Chuncheon",
        from: "From Chuncheon",
      },
      form: {
        to: "To",
        date: "Travel date",
        time: "Departure time",
        fromPh: "Origin",
        toPh: "Destination",
      },
      // 위치 사용 사전 설명 모달 · §21 동의 패턴의 플래너 목적 카피
      locate: {
        title: "Use your location to plan this route",
        body: "We read your current location once to match the nearest station, terminal, or airport in our list. Location is used only to plan this route.",
        allow: "Allow location use",
        later: "Maybe next time",
        footnote: "Your location is not stored. You can pick a hub from the list anytime.",
      },
      results: {
        // §9.2.4 PLACEHOLDER 마킹 · 초안 추정값 고지
        totalApprox: "About {min} min",
        legMin: "About {min} min",
        varies: "Travel time varies",
        toPlace: "To {place}",
      },
      routeKind: {
        rail: "Rail",
        bus: "Bus",
        mixed: "Rail + Bus",
      },
      empty: {
        title: "No curated route for this pair yet",
        body: "We have not verified this combination yet. Try the other Chuncheon stop or another hub while we expand the list.",
      },
    },
  },
  handsfree: {
    title: "Send your bags ahead",
    intro: "Check your bags at the airport counter and they reach your Chuncheon accommodation first. An established luggage-delivery partner carries them. We run the Chuncheon booking layer.",
    // v3.2 §8.4: Optional 배지(StatusBadge 문법) + 선택 사항 카피
    optional: {
      badge: "Optional",
      note: "Every line can be ridden with or without your bags. This service is optional.",
    },
    steps: {
      drop: {
        label: "Drop at airport",
        body: "Check your bags at the partner counter in the arrivals hall, show your drop-off code, and walk out light.",
      },
      carry: {
        label: "We carry to Chuncheon",
        // v3.2 §16.7: 공급자 용어(Loop) 노출 폐지 · 사용자 언어(city line)로 교체
        body: "The delivery partner drives your bags to Chuncheon while you ride in by rail, bus, or a city line.",
      },
      meet: {
        label: "Meet it at your stay",
        body: "Your bags wait at the front desk of your stay. Check in, and they are already there.",
      },
    },
    detail: {
      title: "What happens to your bags",
      body: "You check your bags once at the airport luggage counter. An established delivery partner carries them to Chuncheon, we run the booking layer for the Chuncheon leg, and one drop-off code covers the whole handoff.",
    },
    faq: {
      title: "Before you send",
      q1: "When do my bags arrive?",
      a1: "Bags checked in the morning usually reach your stay by evening. The counter confirms the exact window when you drop off.",
      q2: "Who actually carries my bags?",
      a2: "An established luggage-delivery partner runs the transport. Global Tourism System handles the booking and the Chuncheon side, and your drop-off code works across both.",
      q3: "Can my bags go somewhere outside Chuncheon?",
      a3: "Not yet. The service covers accommodation addresses inside Chuncheon, and that focus is what keeps it reliable.",
    },
    form: {
      bags: "Bags",
      address: "Chuncheon accommodation address",
      email: "Contact email",
      perBag: "per bag",
      total: "Total",
      submit: "Send my bags",
      errors: {
        date: "Pick your arrival date so the counter expects your bags.",
        address: "Enter the Chuncheon address your bags should reach: the name of the stay plus its street address.",
        email: "Enter an email like name@example.com. Your drop-off code goes there.",
      },
    },
    success: {
      title: "Your bags are booked.",
      codeLabel: "Drop-off code",
      body: "Show this code at the airport luggage counter on arrival day.",
      home: "Back to Home",
    },
  },
};
