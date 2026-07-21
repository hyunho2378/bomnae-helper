// loop 네임스페이스(KR) · 존 C(LOOP) 소유. en·th와 키 완전 동형. 줄표 금지.
// v3.1: 3스텝 키 제거, preview(오버레이)·edit(단일 확인 페이지) 추가.
// v3.2(존 C2): chips(라인 칩 §24)·poi(POI 앵커 §16.9)·transition(§22)·detail 캘린더 키 추가.
export default {
  loop: {
    title: "라이브 라인 맵",
    panel: {
      viewLine: "라인 보기",
      hint: "정류장을 고르면 지도가 그곳으로 날아갑니다.",
    },
    chips: {
      label: "라인",
      hint: "라인을 고르면 지도에 나타납니다.",
    },
    poi: {
      soyangDam: "소양강댐",
      myeongdong: "명동",
      namchuncheon: "남춘천역",
    },
    transition: {
      // 연출 상태 라벨 · §16.7 연출 카피 예외(3언어 동일 표기)
      label: "LINES ACTIVE",
      aria: "도착 전환 연출",
    },
    map: {
      label: "춘천 라이브 라인 맵",
      loading: "지도를 불러오는 중",
    },
    preview: {
      label: "라인 미리보기",
      preorderLine: "모든 정류장에 선주문을 넣어 둡니다. 내리면 바로 준비되어 있어요.",
      cta: "예약하고 자세히 보기",
    },
    detail: {
      routeEyebrow: "노선",
      routeTitle: "이 라인의 정류장",
      storiesEyebrow: "차내에서",
      storiesTitle: "이동 중 보게 될 이야기",
      calendarEyebrow: "출발 회차",
      calendarTitle: "출발일을 고르세요",
      durationLabel: "소요",
      stopsLabel: "정류장",
      priceLabel: "가격",
      priceUnit: "/ 성인",
      hoursUnit: "시간",
      minutesUnit: "분",
      stayUnit: "분 체류",
      preorderTag: "선주문 대행",
      clipCaption: "사장님 스토리 클립. 자막은 항상 켜져 있습니다.",
      seatsLeft: "석 남음",
      selectedTitle: "선택 중인 출발",
      pickTime: "아래에서 회차를 골라 주세요.",
      legendLabel: "상태 범례",
      ridersPre: "이 회차에는 나 외",
      ridersPost: "명의 여행자가 함께 탑니다.",
      hostLabel: "호스트",
      hostIntro: "이 라인을 함께 도는 춘천 버디입니다.",
    },
  },
  booking: {
    title: "좌석 예약",
    adults: "성인",
    children: "어린이",
    total: "합계",
    edit: "수정",
    confirmCta: "예약 확정하기",
    summary: {
      line: "라인",
      departure: "출발 회차",
      meeting: "미팅포인트",
      party: "인원",
      riders: "동승",
      host: "호스트",
      preorder: "선주문",
      preorderNote: "모든 정류장에 선주문을 넣어 둡니다. 내리면 바로 준비되어 있어요.",
    },
    success: {
      title: "좌석이 예약되었습니다.",
      sub: "도착 전에 선주문을 넣어 둘게요.",
      viewTicket: "티켓 보기",
    },
  },
  ticket: {
    title: "나의 티켓",
    codeLabel: "예약 코드",
    watch: "차내에서 보게 될 이야기",
    linesLeft: "춘천 완주까지 2개 라인이 남았습니다.",
    linesLeftCta: "다른 라인 보기",
    shareCta: "티켓 공유",
    viewMap: "지도에서 보기",
    notFound: {
      title: "예약을 찾을 수 없습니다",
      body: "이 코드로 저장된 예약이 없습니다. 세션이 끝나며 사라졌을 수 있어요.",
      cta: "라인 둘러보기",
    },
  },
};
