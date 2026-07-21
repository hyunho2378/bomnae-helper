// gts 네임스페이스(TH) 뼈대 · 존 A4 소유 골격 — 서브에이전트는 키를 추가(확장)만 한다(교체·이동 금지).
// 기계 번역 초안(네이티브 검수 대기 — PROGRESS 준비물). en·ko와 키 완전 동형 유지.
// v4 존 C4 확장: draft·vehicle·fare 공용 + setup/build/route/checkout/ticket 키 추가(IA §9.3~§9.6).
export default {
  gts: {
    freq: {
      rail: "รถไฟให้บริการบ่อยตลอดทั้งวัน", // PLACEHOLDER — verify 배차 수준 문구
      bus: "รถบัสให้บริการบ่อยตลอดทั้งวัน", // PLACEHOLDER — verify
      metro: "รถไฟฟ้าให้บริการเป็นระยะตลอดวัน", // PLACEHOLDER — verify
    },
    draft: "DRAFT",
    draftNote: "ราคาฉบับร่าง ยอดสุดท้ายจะยืนยันภายหลัง",
    vehicle: {
      taxi: "แท็กซี่",
      van: "รถแวน",
    },
    fare: {
      base: "ค่าโดยสารพื้นฐาน",
      luggage: "ฝากกระเป๋า",
      perPerson: "ต่อคน",
      total: "รวม",
    },
    setup: {
      title: "สร้างวัน GTS ของคุณ",
      sub: "บอกจำนวนผู้เดินทาง แล้วเราจะจับคู่รถให้",
      partyLabel: "ผู้เดินทาง",
      luggageTitle: "ต้องการฝากกระเป๋าไหม",
      luggageBody: "ไม่บังคับ ข้ามได้ถ้าไม่มีกระเป๋าเดินทางหรือฝากไว้ที่ที่พักแล้ว",
      luggageToggle: "ฝากกระเป๋า",
      matchTitle: "รถของคุณ",
      cta: "ไปจัดวันของฉัน",
    },
    build: {
      title: "จัดวันของคุณ",
      stepLabel: "ขั้นตอน",
      planTitle: "มื้ออาหารเอาแบบไหนดี",
      plan: {
        none: "ไม่รวมมื้ออาหาร",
        noneSub: "จัดการมื้ออาหารเอง",
        lunch: "คอร์สมื้อกลางวัน",
        lunchSub: "ร้านท้องถิ่นหนึ่งแห่งสำหรับมื้อกลางวัน",
        lunchDinner: "คอร์สกลางวันและเย็น",
        lunchDinnerSub: "เลือกสองแห่ง แห่งแรกคือมื้อกลางวัน",
      },
      mealsTitle: "เลือกร้านอาหาร",
      mealsOrderHint: "ที่เลือกก่อนคือมื้อกลางวัน ถัดไปคือมื้อเย็น",
      lunchBadge: "กลางวัน",
      dinnerBadge: "เย็น",
      refresh: "ดูที่อื่น",
      comingSoon: "เร็ว ๆ นี้",
      cat: {
        meal: "มื้ออาหาร",
        foodspace: "คาเฟ่และของหวาน",
        activity: "กิจกรรม",
      },
      picksTitle: "เลือก 2 แห่งสำหรับวันของคุณ",
      tabFoodspace: "คาเฟ่และของหวาน",
      tabActivity: "กิจกรรม",
      counterLabel: "เลือกแล้ว",
      capFull: "เลือกครบแล้ว กรุณายกเลิกที่เลือกไว้ก่อน",
      reason: {
        plan: "เลือกแผนมื้ออาหารเพื่อไปต่อ",
        meals: "เลือกร้านอาหารให้ครบเพื่อไปต่อ",
        picks: "เลือกให้ครบ 2 แห่งเพื่อไปต่อ",
      },
    },
    route: {
      title: "เส้นทางของคุณ",
      draftSchedule: "เวลาฉบับร่างเริ่มเที่ยงวัน แห่งละประมาณ 2 ชั่วโมง ไม่ใช่ตารางเวลาจริง",
      listTitle: "ลำดับการเยี่ยมชม",
      mockNotice: "ตำแหน่งที่แน่นอนจะแสดงเมื่อยืนยันสถานที่แล้ว",
      mapLabel: "แผนที่เส้นทาง",
      proceed: "ไปต่อด้วยเส้นทางนี้",
      rebuild: "จัดใหม่",
    },
    checkout: {
      title: "ชำระเงิน",
      summaryTitle: "วันของคุณ",
      vehicleLabel: "รถ",
      partyLabel: "ผู้เดินทาง",
      luggageLabel: "ฝากกระเป๋า",
      luggageYes: "รวมแล้ว",
      luggageNo: "ไม่ต้องการ",
      mealPlanLabel: "แผนมื้ออาหาร",
      orderTitle: "ลำดับการเยี่ยมชม",
      dropoffLabel: "จุดลงรถสุดท้าย",
      dropoffPlaceholder: "เช่น สถานีชุนชอน หรือที่พักของคุณ",
      dropoffRequired: "กรอกจุดลงรถเพื่อดำเนินการต่อ",
      priceTitle: "รายละเอียดราคา",
      payCta: "ชำระเงิน",
      confirmTitle: "การชำระเงินต้นแบบ",
      prototypeNotice: "ต้นแบบ: ไม่มีการชำระเงินจริง",
      confirmCta: "ยืนยันการจอง",
      success: {
        title: "วัน GTS ของคุณพร้อมแล้ว",
        sub: "ดูแผนทั้งหมดได้ในตั๋วของคุณ",
        viewTicket: "ดูตั๋ว",
      },
    },
    ticket: {
      orderTitle: "กำหนดการของวัน",
      dropoffLabel: "จุดลงรถ",
    },
  },
};
