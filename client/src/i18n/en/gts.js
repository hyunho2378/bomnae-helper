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
    draft: "DRAFT",
    draftNote: "Draft prices. Final amounts will be confirmed later.",
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
      refresh: "See other places",
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
      draftSchedule: "Draft times from noon, about 2 hours per stop. This is not a timetable.",
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
      orderTitle: "Visit order",
      dropoffLabel: "Final drop off point",
      dropoffPlaceholder: "e.g. Chuncheon Station, your stay address",
      dropoffRequired: "Enter your drop off point to continue",
      priceTitle: "Price breakdown",
      payCta: "Pay",
      confirmTitle: "Prototype checkout",
      prototypeNotice: "Prototype: no real payment is processed.",
      confirmCta: "Confirm booking",
      success: {
        title: "Your GTS day is set",
        sub: "Your ticket keeps the full plan",
        viewTicket: "View ticket",
      },
    },
    ticket: {
      orderTitle: "Day schedule",
      dropoffLabel: "Drop off",
    },
  },
};
