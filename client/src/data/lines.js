// 라인 목데이터 · IA §4 shape. PHASE 3에서 서버 이관(스키마 동일).
// 가격 전부 DRAFT · 5일차 BM 검토에서 확정 (IA §4: 택시 대비 반값이 세일즈 포인트).
// duration_min DRAFT, host_name PLACEHOLDER · 호스트 확정 전.
// character_img · PLACEHOLDER: 봄내크루 배경 제거본 에셋 대기(PROGRESS 준비물).
const lines = [
  {
    id: 'potato',
    name_en: 'Potato Line',
    name_ko: '감자 라인',
    color_token: 'potato', // tokens.lineColors 키
    duration_min: 240, // DRAFT
    price_adult: 18000, // DRAFT
    price_child: 12000, // DRAFT
    price_weekend_delta: 3000, // DRAFT
    host_name: 'Bomi', // PLACEHOLDER · 호스트 이름 확정 전
    character_img: '/images/crew/potato.png', // PLACEHOLDER · 에셋 대기
  },
  {
    id: 'dakgalbi',
    name_en: 'Dakgalbi Line',
    name_ko: '닭갈비 라인',
    color_token: 'dakgalbi',
    duration_min: 220, // DRAFT
    price_adult: 18000, // DRAFT
    price_child: 12000, // DRAFT
    price_weekend_delta: 3000, // DRAFT
    host_name: 'Naeri', // PLACEHOLDER · 호스트 이름 확정 전
    character_img: '/images/crew/dakgalbi.png', // PLACEHOLDER · 에셋 대기
  },
  {
    id: 'lake',
    name_en: 'Lake/Culture Line',
    name_ko: '호수·문화 라인',
    color_token: 'lake',
    duration_min: 200, // DRAFT
    price_adult: 18000, // DRAFT
    price_child: 12000, // DRAFT
    price_weekend_delta: 3000, // DRAFT
    host_name: 'Haneul', // PLACEHOLDER · 호스트 이름 확정 전
    character_img: '/images/crew/lake.png', // PLACEHOLDER · 에셋 대기
  },
];

export default lines;
