// 회차 목데이터 · COMPONENTS A2 스펙.
// 회차 시각 DRAFT · 5일차 BM 검토에서 확정 (IA §4).
// booked_count는 고정 시드 의사난수: 같은 (lineId, date, time)이면 항상 같은 값.
// status 규칙: booked>=6 confirmed, >=3 likely, 만석 closed.
// 시드 범위를 3~12로 고정해 명세 미정의 구간(booked<3)을 만들지 않는다 · 폴백은 likely.
const TIMES = ['10:00', '13:00', '16:00']; // DRAFT
export const CAPACITY = 12;

const seededHash = (s) => {
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h;
};

export function getDepartures(lineId, date) {
  return TIMES.map((time) => {
    const booked = Math.min(3 + (seededHash(`${lineId}|${date}|${time}`) % 10), CAPACITY);
    const status = booked >= CAPACITY ? 'closed' : booked >= 6 ? 'confirmed' : 'likely';
    return {
      id: `${lineId}-${date}-${time}`,
      line_id: lineId,
      date,
      time,
      capacity: CAPACITY,
      booked_count: booked,
      status,
    };
  });
}
