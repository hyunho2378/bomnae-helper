// gts 네임스페이스(KO) 뼈대 · 존 A4 소유 골격 — 서브에이전트는 키를 추가(확장)만 한다(교체·이동 금지).
// freq.*는 data/gts/hubs.js headwayNote가 참조하는 배차 카피(구체 시각·횟수 금지 계약).
// en·th와 키 완전 동형 유지.
// v4 존 C4 확장: draft·vehicle·fare 공용 + setup/build/route/checkout/ticket 키 추가(IA §9.3~§9.6).
export default {
  gts: {
    freq: {
      rail: "열차가 하루 종일 자주 다닙니다", // PLACEHOLDER — verify 배차 수준 문구
      bus: "버스가 하루 종일 자주 다닙니다", // PLACEHOLDER — verify
      metro: "전철이 수시로 다닙니다", // PLACEHOLDER — verify
    },
    draft: "DRAFT",
    draftNote: "초안 가격입니다. 최종 금액은 확정 후 안내됩니다.",
    vehicle: {
      taxi: "택시형",
      van: "밴형",
    },
    fare: {
      base: "기본요금",
      luggage: "짐 보관",
      perPerson: "인당 요금",
      total: "합계",
    },
    setup: {
      title: "나만의 GTS 하루 만들기",
      sub: "함께 가는 인원을 알려 주세요. 차량은 저희가 맞춰 드립니다.",
      partyLabel: "인원",
      luggageTitle: "짐 보관이 필요한가요?",
      luggageBody: "선택 사항입니다. 캐리어가 없거나 숙소에 두고 왔다면 꺼 두세요.",
      luggageToggle: "짐 보관",
      matchTitle: "매칭된 차량",
      cta: "하루 조립하러 가기",
    },
    build: {
      title: "하루 조립",
      stepLabel: "단계",
      planTitle: "식사는 어떻게 할까요?",
      plan: {
        none: "식사 안 함",
        noneSub: "식사는 따로 해결할게요",
        lunch: "점심 코스",
        lunchSub: "로컬 점심 한 곳",
        lunchDinner: "점심과 저녁 코스",
        lunchDinnerSub: "두 곳 선택, 먼저 고른 곳이 점심",
      },
      mealsTitle: "식사 장소 고르기",
      mealsOrderHint: "먼저 고른 곳이 점심, 다음이 저녁입니다.",
      lunchBadge: "점심",
      dinnerBadge: "저녁",
      refresh: "다른 곳 보기",
      comingSoon: "공개 예정",
      cat: {
        meal: "식사",
        foodspace: "음식 공간",
        activity: "액티비티",
      },
      picksTitle: "하루를 채울 2곳 고르기",
      tabFoodspace: "음식 공간",
      tabActivity: "액티비티",
      counterLabel: "선택됨",
      capFull: "정원이 찼습니다. 먼저 고른 곳을 해제해 주세요.",
      reason: {
        plan: "식사 플랜을 선택하면 넘어갈 수 있어요",
        meals: "식사 장소 선택을 마치면 넘어갈 수 있어요",
        picks: "정확히 2곳을 고르면 넘어갈 수 있어요",
      },
    },
    route: {
      title: "나의 동선",
      draftSchedule: "정오부터 한 곳당 약 2시간으로 잡은 초안 시간입니다. 시간표가 아닙니다.",
      listTitle: "방문 순서",
      mockNotice: "정확한 위치는 장소 확정 후 표시됩니다.",
      mapLabel: "동선 지도",
      proceed: "이 동선으로 진행",
      rebuild: "다시 조립",
    },
    checkout: {
      title: "확인 및 결제",
      summaryTitle: "나의 하루",
      vehicleLabel: "차량",
      partyLabel: "인원",
      luggageLabel: "짐 보관",
      luggageYes: "포함",
      luggageNo: "필요 없음",
      mealPlanLabel: "식사 플랜",
      orderTitle: "방문 순서",
      dropoffLabel: "최종 하차 지점",
      dropoffPlaceholder: "예: 춘천역, 숙소 주소",
      dropoffRequired: "하차 지점을 입력하면 결제할 수 있어요",
      priceTitle: "금액 내역",
      payCta: "결제하기",
      confirmTitle: "프로토타입 결제",
      prototypeNotice: "프로토타입: 실제 결제가 이루어지지 않습니다.",
      confirmCta: "예약 확정",
      success: {
        title: "GTS 하루가 완성됐어요",
        sub: "전체 일정은 티켓에서 확인하세요",
        viewTicket: "티켓 보기",
      },
    },
    ticket: {
      orderTitle: "하루 일정",
      dropoffLabel: "하차 지점",
    },
  },
};
