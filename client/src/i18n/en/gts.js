// gts 네임스페이스(EN) 뼈대 · 존 A4 소유 골격 — 서브에이전트는 키를 추가(확장)만 한다(교체·이동 금지).
// freq.*는 data/gts/hubs.js headwayNote가 참조하는 배차 카피(구체 시각·횟수 금지 계약).
// ko·th와 키 완전 동형 유지.
// v4 존 C4 확장: draft·vehicle·fare 공용 + setup/build/route/checkout/ticket 키 추가(IA §9.3~§9.6).
export default {
  gts: {
    freq: {
      rail: "Trains run frequently through the day", // PLACEHOLDER — verify 배차 수준 문구
      bus: "Buses run frequently through the day", // PLACEHOLDER — verify
      metro: "Metro-style service through the day", // PLACEHOLDER — verify
    },
    vehicle: {
      taxi: "Taxi",
      van: "Van",
    },
    fare: {
      base: "Base fare",
      luggage: "Luggage storage",
      perPerson: "Per person",
      total: "Total",
    },
    setup: {
      title: "Make your GTS day",
      sub: "Tell us who is coming and we will match your ride.",
      dateLabel: "Travel date",
      datePlaceholder: "Select a date",
      partyLabel: "Travelers",
      luggageTitle: "Need luggage storage?",
      luggageBody: "Optional. Skip this if you travel without a carrier or left your bags at your stay.",
      luggageToggle: "Luggage storage",
      matchTitle: "Your ride",
      cta: "Build my day",
    },
    build: {
      title: "Build your day",
      stepLabel: "Step",
      // §41 StepStage 상단 라벨("1 / 3 · …")용 짧은 스텝명 + 나가기 확인 Dialog(존 C5)
      step: {
        plan: "Meal plan",
        meals: "Meal spots",
        picks: "Day picks",
      },
      exitTitle: "Leave the builder?",
      exitBody: "You will go back to the setup step. Your picks are kept while you stay in the tour builder.",
      exitStay: "Keep building",
      exitLeave: "Leave",
      // §10.4 페이지네이션 페어(새로고침 폐지 · 경계 비활성)
      planTitle: "How about meals?",
      plan: {
        none: "No meals",
        noneSub: "I will eat on my own",
        lunch: "Lunch course",
        lunchSub: "One local lunch spot",
        lunchDinner: "Lunch and dinner course",
        lunchDinnerSub: "Two spots, your first pick is lunch",
      },
      mealsTitle: "Pick your meal spots",
      mealsOrderHint: "First pick is lunch, second is dinner.",
      lunchBadge: "Lunch",
      dinnerBadge: "Dinner",
      comingSoon: "Coming soon",
      cat: {
        meal: "Meal",
        foodspace: "Food space",
        activity: "Activity",
      },
      picksTitle: "Pick 2 places for your day",
      tabFoodspace: "Food spaces",
      tabActivity: "Activities",
      counterLabel: "selected",
      capFull: "Your picks are full. Unselect one first.",
      reason: {
        plan: "Choose a meal plan to continue",
        meals: "Finish your meal picks to continue",
        picks: "Pick exactly 2 places to continue",
      },
    },
    route: {
      title: "Your route",
      listTitle: "Visit order",
      mockNotice: "Exact locations will appear once these places are confirmed.",
      mapLabel: "Itinerary map",
      proceed: "Continue with this route",
      rebuild: "Rebuild my day",
    },
    checkout: {
      title: "Checkout",
      summaryTitle: "Your day",
      vehicleLabel: "Vehicle",
      partyLabel: "Travelers",
      luggageLabel: "Luggage storage",
      luggageYes: "Included",
      luggageNo: "Not needed",
      mealPlanLabel: "Meal plan",
      dateLabel: "Travel date",
      editCta: "Edit my day",
      orderTitle: "Visit order",
      dropoffLabel: "Final drop off point",
      dropoffPlaceholder: "e.g. Chuncheon Station, your stay address",
      dropoffRequired: "Enter your drop off point to continue",
      priceTitle: "Price breakdown",
      payCta: "Pay",
      // §42: 폼 하단 caption 1줄 프로토타입 고지(Terms §2 취지) — 확인 Dialog·성공 인터스티셜 폐지
      prototypeNotice: "Prototype: no real payment is processed.",
    },
    // §42 결제 수단 그리드 + 카드 폼(존 C5)
    pay: {
      title: "Payment method",
      cardNumber: "Card number",
      expiry: "Expiry",
      expiryPlaceholder: "MM/YY",
      cvc: "CVC",
      nameOnCard: "Name on card",
    },
    ticket: {
      orderTitle: "Day schedule",
      dropoffLabel: "Drop off",
      // §43 좌측 상세 패널(존 C5) · 환불 규정은 legal.terms.s3 재사용(신규 창작 금지)
      detailsTitle: "Booking details",
      payMethodLabel: "Payment method",
      guideTitle: "Good to know",
      guide1: "Show your ticket code to the driver when you board.",
      guide2: "Each stop runs as a 2 hour slot and your driver keeps the schedule.",
      guide3: "Need a change? Write to official@gts.ac.kr before your day starts.",
      saveCta: "Save image",
    },
  },
};
