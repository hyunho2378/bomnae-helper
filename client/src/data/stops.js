// 정류장 목데이터 — IA §4 shape. 라인별 3개 + 미팅포인트 2개(춘천역·남춘천역).
// 전 좌표 APPROX — 3~4일차 현장탐방에서 GPS 실좌표 수집 후 교체(RUNBOOK 과제).
// photo 전부 PLACEHOLDER — 현장 촬영분으로 교체.
const stops = [
  // Potato Line: 감자밭 → 소양강댐 → 소울로스터리
  {
    id: 'gamja-farm',
    line_id: 'potato',
    order: 1,
    name_en: 'Gamja Farm',
    name_ko: '감자밭',
    lng: 127.72, // PLACEHOLDER — verify on site
    lat: 37.941, // PLACEHOLDER — verify on site
    stay_min: 50,
    preorder_en: 'Your gamja-bbang is ready when you arrive.',
    preorder_ko: '도착하면 감자빵이 바로 나와 있습니다.',
    photo: '/images/stops/gamja-farm.jpg', // PLACEHOLDER — verify on site
    story_id: 'gamja',
  },
  {
    id: 'soyang-dam',
    line_id: 'potato',
    order: 2,
    name_en: 'Soyang Dam',
    name_ko: '소양강댐',
    lng: 127.796, // PLACEHOLDER — verify on site
    lat: 37.948, // PLACEHOLDER — verify on site
    stay_min: 40,
    preorder_en: 'Lookout coffee pre-ordered — pick it up and walk the crest.',
    preorder_ko: '전망대 커피를 미리 주문해 둡니다 — 받아서 바로 둑길을 걸으세요.',
    photo: '/images/stops/soyang-dam.jpg', // PLACEHOLDER — verify on site
    story_id: null,
  },
  {
    id: 'soul-roastery',
    line_id: 'potato',
    order: 3,
    name_en: 'Soul Roastery',
    name_ko: '소울로스터리',
    lng: 127.744, // PLACEHOLDER — verify on site
    lat: 37.902, // PLACEHOLDER — verify on site
    stay_min: 40,
    preorder_en: 'Your pour-over starts brewing 10 minutes before arrival.',
    preorder_ko: '도착 10분 전부터 핸드드립 추출을 시작합니다.',
    photo: '/images/stops/soul-roastery.jpg', // PLACEHOLDER — verify on site
    story_id: 'roastery',
  },

  // Dakgalbi Line: 통나무집 닭갈비 → 막국수체험박물관 → 구도심
  {
    id: 'log-house',
    line_id: 'dakgalbi',
    order: 1,
    name_en: 'Log House Dakgalbi',
    name_ko: '통나무집 닭갈비',
    lng: 127.706, // PLACEHOLDER — verify on site
    lat: 37.923, // PLACEHOLDER — verify on site
    stay_min: 70,
    preorder_en: 'Grill pre-heated 15 minutes before arrival.',
    preorder_ko: '도착 15분 전에 불판을 예열해 둡니다.',
    photo: '/images/stops/log-house.jpg', // PLACEHOLDER — verify on site
    story_id: 'dakgalbi',
  },
  {
    id: 'makguksu-museum',
    line_id: 'dakgalbi',
    order: 2,
    name_en: 'Makguksu Experience Museum',
    name_ko: '막국수체험박물관',
    lng: 127.789, // PLACEHOLDER — verify on site
    lat: 37.93, // PLACEHOLDER — verify on site
    stay_min: 50,
    preorder_en: 'Your noodle-making station is set up in advance.',
    preorder_ko: '막국수 만들기 체험대를 미리 준비해 둡니다.',
    photo: '/images/stops/makguksu-museum.jpg', // PLACEHOLDER — verify on site
    story_id: 'makguksu',
  },
  {
    id: 'old-town',
    line_id: 'dakgalbi',
    order: 3,
    name_en: 'Old Town',
    name_ko: '구도심',
    lng: 127.727, // PLACEHOLDER — verify on site
    lat: 37.879, // PLACEHOLDER — verify on site
    stay_min: 40,
    preorder_en: 'A dessert table is reserved at the alley cafe.',
    preorder_ko: '골목 카페에 디저트 자리를 예약해 둡니다.',
    photo: '/images/stops/old-town.jpg', // PLACEHOLDER — verify on site
    story_id: null,
  },

  // Lake/Culture Line: 소양강스카이워크 → 화동2571 → 공지천
  {
    id: 'skywalk',
    line_id: 'lake',
    order: 1,
    name_en: 'Soyang River Skywalk',
    name_ko: '소양강스카이워크',
    lng: 127.7, // PLACEHOLDER — verify on site
    lat: 37.905, // PLACEHOLDER — verify on site
    stay_min: 30,
    preorder_en: 'Entry passes ready — skip the ticket line.',
    preorder_ko: '입장권을 미리 끊어 둡니다 — 매표 줄 없이 입장하세요.',
    photo: '/images/stops/skywalk.jpg', // PLACEHOLDER — verify on site
    story_id: null,
  },
  {
    id: 'hwadong-2571',
    line_id: 'lake',
    order: 2,
    name_en: 'Hwadong 2571',
    name_ko: '화동2571',
    lng: 127.73, // PLACEHOLDER — verify on site
    lat: 37.883, // PLACEHOLDER — verify on site
    stay_min: 50,
    preorder_en: 'Your signature drink is on the table when you walk in.',
    preorder_ko: '들어서면 시그니처 음료가 테이블에 놓여 있습니다.',
    photo: '/images/stops/hwadong-2571.jpg', // PLACEHOLDER — verify on site
    story_id: 'hwadong',
  },
  {
    id: 'gongjicheon',
    line_id: 'lake',
    order: 3,
    name_en: 'Gongjicheon',
    name_ko: '공지천',
    lng: 127.716, // PLACEHOLDER — verify on site
    lat: 37.868, // PLACEHOLDER — verify on site
    stay_min: 40,
    preorder_en: 'A riverside picnic set is packed for pickup.',
    preorder_ko: '강변 피크닉 세트를 챙겨 둡니다 — 받기만 하세요.',
    photo: '/images/stops/gongjicheon.jpg', // PLACEHOLDER — verify on site
    story_id: null,
  },
];

// 미팅포인트 — 라인 소속이 아니므로 별도 export (IA §2.6 미팅포인트, COMPONENTS A2).
export const meetingPoints = [
  {
    id: 'meet-chuncheon',
    name_en: 'Chuncheon Station',
    name_ko: '춘천역',
    lng: 127.717, // PLACEHOLDER — verify on site
    lat: 37.885, // PLACEHOLDER — verify on site
  },
  {
    id: 'meet-namchuncheon',
    name_en: 'Namchuncheon Station',
    name_ko: '남춘천역',
    lng: 127.721, // PLACEHOLDER — verify on site
    lat: 37.864, // PLACEHOLDER — verify on site
  },
];

export default stops;
