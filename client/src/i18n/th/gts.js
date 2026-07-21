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
      // §41 StepStage 상단 라벨("1 / 3 · …")용 짧은 스텝명 + 나가기 확인 Dialog(존 C5)
      step: {
        plan: "แผนมื้ออาหาร",
        meals: "ร้านอาหาร",
        picks: "ที่เที่ยวของวัน",
      },
      exitTitle: "ออกจากการจัดวันไหม",
      exitBody: "จะกลับไปที่ขั้นตอนตั้งค่า ตัวเลือกของคุณยังอยู่ตราบที่ยังอยู่ในเครื่องมือจัดทัวร์",
      exitStay: "จัดต่อ",
      exitLeave: "ออก",
      // §10.4 페이지네이션 페어(새로고침 폐지 · 경계 비활성)
      prevPage: "หน้าก่อนหน้า",
      nextPage: "หน้าถัดไป",
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
      // §42: 폼 하단 caption 1줄 프로토타입 고지(Terms §2 취지) — 확인 Dialog·성공 인터스티셜 폐지
      prototypeNotice: "ต้นแบบ: ไม่มีการชำระเงินจริง",
    },
    // §42 결제 수단 그리드 + 카드 폼(존 C5)
    pay: {
      title: "วิธีการชำระเงิน",
      walletNote: "ต้นแบบนี้จำลองการชำระเงินผ่านวอลเล็ต จะไม่มีแอปเปิดขึ้น",
      cardNumber: "หมายเลขบัตร",
      expiry: "วันหมดอายุ",
      expiryPlaceholder: "MM/YY",
      cvc: "CVC",
      nameOnCard: "ชื่อบนบัตร",
    },
    ticket: {
      orderTitle: "กำหนดการของวัน",
      dropoffLabel: "จุดลงรถ",
      // §43 좌측 상세 패널(존 C5) · 환불 규정은 legal.terms.s3 재사용(신규 창작 금지)
      detailsTitle: "รายละเอียดการจอง",
      payMethodLabel: "วิธีการชำระเงิน",
      guideTitle: "ข้อควรรู้",
      guide1: "แสดงรหัสตั๋วให้คนขับเมื่อขึ้นรถ",
      guide2: "แต่ละที่ใช้เวลาช่วงละ 2 ชั่วโมง และคนขับจะช่วยรักษาตารางเวลา",
      guide3: "หากต้องการเปลี่ยนแปลง แจ้งที่ official@gts.ac.kr ก่อนเริ่มวันของคุณ",
      saveCta: "บันทึกรูปภาพ",
    },
  },
};
