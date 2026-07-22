// [V3] Travel Log 목업 시드 미러(오프라인 폴백 전용) — 원본: server/data/travelLogSeeds.js.
// 서버 부재 시에도 /travel-log 데모가 성립하도록 동일 6건 유지(동시 수정 계약 · 값 창작 금지).
// 장소는 전부 venues.js 실명 id 조합 · 날짜 고정 연출값 · 이니셜·국가는 목업 여행자.
export const TRAVEL_LOG_SEEDS = [
  {
    code: 'LOGSD1',
    mock: true,
    author: 'P.',
    country: { en: 'Thailand', ko: '태국', th: 'ไทย' },
    party: 2,
    mealPlan: 'lunch',
    itinerary: ['tongnamujip', 'skywalk', 'gamja-farm'],
    travelDate: '2026-07-18',
  },
  {
    code: 'LOGSD2',
    mock: true,
    author: 'D.',
    country: { en: 'Australia', ko: '호주', th: 'ออสเตรเลีย' },
    party: 2,
    mealPlan: 'none',
    itinerary: ['jungdo-mullegil', 'soul-roastery'],
    travelDate: '2026-07-16',
  },
  {
    code: 'LOGSD3',
    mock: true,
    author: 'J.',
    country: { en: 'Japan', ko: '일본', th: 'ญี่ปุ่น' },
    party: 4,
    mealPlan: 'lunch',
    itinerary: ['tongnamujip', 'makguksu-museum', 'gongjicheon'],
    travelDate: '2026-07-15',
  },
  {
    code: 'LOGSD4',
    mock: true,
    author: 'A.',
    country: { en: 'Singapore', ko: '싱가포르', th: 'สิงคโปร์' },
    party: 3,
    mealPlan: 'none',
    itinerary: ['gamja-farm', 'soyang-dam'],
    travelDate: '2026-07-13',
  },
  {
    code: 'LOGSD5',
    mock: true,
    author: 'L.',
    country: { en: 'Vietnam', ko: '베트남', th: 'เวียดนาม' },
    party: 2,
    mealPlan: 'lunch',
    itinerary: ['tongnamujip', 'soyang-maiden', 'hwadong-2571'],
    travelDate: '2026-07-11',
  },
  {
    code: 'LOGSD6',
    mock: true,
    author: 'F.',
    country: { en: 'France', ko: '프랑스', th: 'ฝรั่งเศส' },
    party: 5,
    mealPlan: 'none',
    itinerary: ['skywalk', 'gongjicheon'],
    travelDate: '2026-07-09',
  },
];

export default TRAVEL_LOG_SEEDS;
