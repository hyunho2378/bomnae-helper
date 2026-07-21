// loop 네임스페이스(EN) · 존 C(LOOP) 소유. loop/booking/ticket.
// ko·th와 키 완전 동형. 줄표 금지. v3.1: 3스텝 키 제거, preview(오버레이)·edit(단일 확인 페이지) 추가.
// v3.2(존 C2): chips(라인 칩 §24)·poi(POI 앵커 §16.9)·transition(§22)·detail 캘린더 키 추가.
export default {
  loop: {
    title: "Live line map",
    panel: {
      viewLine: "View line",
      hint: "Pick a stop to fly the map there.",
    },
    chips: {
      label: "Lines",
      hint: "Pick a line to light it up on the map.",
    },
    poi: {
      soyangDam: "Soyang Dam",
      myeongdong: "Myeongdong",
      namchuncheon: "Namchuncheon Station",
    },
    transition: {
      // 연출 상태 라벨 · §16.7 연출 카피 예외(3언어 동일 표기)
      label: "LINES ACTIVE",
      aria: "Arrival transition",
    },
    map: {
      label: "Chuncheon live line map",
      loading: "Loading the map",
    },
    preview: {
      label: "Line preview",
      preorderLine: "Every stop is pre-ordered ahead. It's ready when you step off.",
      cta: "Book and see details",
    },
    detail: {
      routeEyebrow: "The route",
      routeTitle: "Stops on this line",
      storiesEyebrow: "On board",
      storiesTitle: "Stories you will watch",
      calendarEyebrow: "Departures",
      calendarTitle: "Pick your departure",
      durationLabel: "Duration",
      stopsLabel: "Stops",
      priceLabel: "From",
      priceUnit: "/ adult",
      hoursUnit: "h",
      minutesUnit: "m",
      stayUnit: "min stay",
      preorderTag: "Pre-ordered ahead",
      clipCaption: "Owner story clip. Subtitles always on.",
      seatsLeft: "seats left",
      selectedTitle: "Your departure",
      pickTime: "Pick a departure time below.",
      legendLabel: "Status legend",
      ridersPre: "You'll ride with",
      ridersPost: "other travelers on this departure.",
      hostLabel: "Your host",
      hostIntro: "Your Chuncheon buddy on this line.",
    },
  },
  booking: {
    title: "Reserve seats",
    adults: "Adults",
    children: "Children",
    total: "Total",
    edit: "Edit",
    confirmCta: "Confirm reservation",
    summary: {
      line: "Line",
      departure: "Departure",
      meeting: "Meeting point",
      party: "Travelers",
      riders: "Fellow riders",
      host: "Host",
      preorder: "Pre-order",
      preorderNote: "Every stop is pre-ordered ahead. It's ready when you step off.",
    },
    success: {
      title: "Your seats are reserved.",
      sub: "Pre-orders will be placed before you arrive.",
      viewTicket: "View my ticket",
    },
  },
  ticket: {
    title: "Your ticket",
    codeLabel: "Reservation code",
    watch: "What you'll watch on board",
    linesLeft: "2 lines left to complete Chuncheon.",
    linesLeftCta: "See the other lines",
    shareCta: "Share ticket",
    viewMap: "View on map",
    notFound: {
      title: "Booking not found",
      body: "No reservation lives under this code. It may have ended with the session.",
      cta: "Browse the lines",
    },
  },
};
