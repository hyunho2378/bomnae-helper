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
    // [V8] 여정 단계 인디케이터 · 라벨 = 지금 하는 단계 그대로(추상 표현 금지)
    steps: {
      label: "예약 단계",
      s1: "인원과 차량",
      s2: "코스 선택",
      s3: "동선 확인",
      s4: "결제와 확정",
    },
    // [V7] 시간제 이용권 · 새 요금 체계(카드 4종 + 포함/초과 안내)
    pass: {
      title: "시간제 이용권",
      names: {
        "1h": "1시간 이용권",
        "2h": "2시간 이용권",
        "4h": "4시간 이용권",
        day: "종일권",
      },
      included: "택시 이용료, 예약금, 코스 이용료가 모두 포함된 금액입니다.",
      overtime: "기본 이용 시간 초과 시 시간당 10,000원이 추가됩니다.",
    },
    setup: {
      title: "나만의 GTS 하루 만들기",
      sub: "함께 가는 인원을 알려 주세요. 차량은 저희가 맞춰 드립니다.",
      dateLabel: "여행 날짜",
      datePlaceholder: "날짜를 선택하세요",
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
      // §41 StepStage 상단 라벨("1 / 3 · …")용 짧은 스텝명 + 나가기 확인 Dialog(존 C5)
      step: {
        plan: "식사 플랜",
        meals: "식사 장소",
        picks: "하루 픽",
      },
      exitTitle: "조립을 나갈까요?",
      exitBody: "설정 단계로 돌아갑니다. 코스 만들기 안에 있는 동안에는 선택이 유지돼요.",
      exitStay: "계속 조립하기",
      exitLeave: "나가기",
      // §10.4 페이지네이션 페어(새로고침 폐지 · 경계 비활성)
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
      dateLabel: "여행 날짜",
      editCta: "코스 수정하기",
      orderTitle: "방문 순서",
      dropoffLabel: "최종 하차 지점",
      dropoffPlaceholder: "예: 춘천역, 숙소 주소",
      dropoffOptional: "선택 입력입니다. 정하지 않았다면 비워 두세요.",
      dropoffRequired: "하차 지점을 입력하면 결제할 수 있어요",
      priceTitle: "금액 내역",
      payCta: "결제하기",
      // [V7] 이용권 선택·전액 포함 밴드·환불 동의
      passTitle: "시간제 이용권 선택",
      passPick: "위에서 이용권을 선택하면 최종 금액이 표시됩니다.",
      allIncluded: "표시된 최종 금액 외 추가 비용이 없습니다.",
      refundTitle: "취소·환불 규정",
      refundBody:
        "이용 시작 48시간 이전 취소 시 예약금이 전액 환불됩니다. 이용 시작 48시간 전부터는 예약금이 환불되지 않습니다.",
      consentLabel: "위 취소·환불 규정에 동의합니다.",
      // §42: 폼 하단 caption 1줄 프로토타입 고지(Terms §2 취지) — 확인 Dialog·성공 인터스티셜 폐지
      prototypeNotice: "프로토타입: 실제 결제가 이루어지지 않습니다.",
    },
    // §42 결제 수단 그리드 + 카드 폼(존 C5)
    pay: {
      title: "결제 수단",
      cardNumber: "카드 번호",
      expiry: "유효기간",
      expiryPlaceholder: "MM/YY",
      cvc: "CVC",
      nameOnCard: "카드 소유자 이름",
    },
    ticket: {
      orderTitle: "하루 일정",
      dropoffLabel: "하차 지점",
      // §43 좌측 상세 패널(존 C5) · 환불 규정은 legal.terms.s3 재사용(신규 창작 금지)
      detailsTitle: "예약 상세",
      payMethodLabel: "결제 수단",
      dropoffNone: "지정 안 함",
      payNone: "선택 안 함",
      // [V7] 티켓 분리 내역 · 구 예약(pass_type null)은 "지정 안 함"
      passLabel: "시간제 이용권",
      passNone: "지정 안 함",
      guideTitle: "이용 안내",
      guide1: "탑승할 때 기사님께 티켓 코드를 보여 주세요.",
      guide2: "각 장소는 2시간 슬롯으로 진행되며 기사님이 일정을 지켜 드립니다.",
      guide3: "변경이 필요하면 하루 시작 전에 official@gts.ac.kr 로 알려 주세요.",
      saveCta: "이미지 저장",
    },
  },
};
