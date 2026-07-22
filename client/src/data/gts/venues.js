// ============================================================
// venues.js · GTS 조립 카드 풀 (IA §9.4 · PATTERNS §30)
// 할루시네이션 방지 계약:
//   실명은 CC_PROMPT_9 허용 11곳 + [V5] 사용자 제공 mockup1.md 20곳(Restaurant 1~6·Food 12~20·Activity 21~25).
//   [V5] 좌표는 지어내지 않고 네이버 place redirect / 구글맵 !3d!4d 실측값 사용(주석에 출처 표기).
//   나머지 목업 슬롯(meal 7~11)만 name "Mockup N" + mock:true + coord null 유지.
//   구 실명 좌표(tongnamujip 등)는 대략값 + // PLACEHOLDER — verify (현장 핀 교체 대상).
// oneLine 카피는 초안(확정 카피 교체 대상). th 표기는 기계 번역 초안 — 네이티브 검수 대기.
// category: 'meal'(식사) | 'foodspace'(카페·베이커리·디저트) | 'activity'(액티비티)
// 카테고리당 12개(새로고침 로테이션 검증용, §30 pageSize 8 × 2페이지 여유).
// stayMin 120 고정(픽 1개 = 2시간 슬롯, IA §9.4). coord는 [lng, lat].
// ============================================================

export const venues = [
  // ---------- meal (실명 7 = tongnamujip + [V5] 6 · 목업 5) ----------
  {
    id: 'tongnamujip',
    name: { en: 'Tongnamujip Dakgalbi', ko: '통나무집 닭갈비', th: 'ทงนามูจิบ ทัคคาลบี' },
    category: 'meal',
    oneLine: {
      en: 'Charcoal dakgalbi at a log house table',
      ko: '숯불 닭갈비를 내는 통나무집 식탁',
      th: 'ทัคคาลบีย่างถ่านในบ้านไม้ซุง',
    },
    stayMin: 120,
    coord: [127.746, 37.95], // PLACEHOLDER — verify
    mock: false,
  },
  // [V5] mockup1.md Restaurant 1~6 실명 반영 · 좌표 = 구글맵/네이버 실측(!3d!4d·place redirect).
  //   th는 en 폴백(네이티브 검수 대기 · 파일 상단 th-초안 정책). coord [lng, lat].
  {
    id: 'baekil-kalguksu',
    name: { en: 'Baekil Kalguksu', ko: '춘천백일칼국수', th: 'Baekil Kalguksu' },
    category: 'meal',
    oneLine: {
      en: 'crispy fried dumplings and rich mushroom hot pot kalguksu',
      ko: '바삭한 튀김만두와 진한 버섯전골 칼국수',
      th: 'crispy fried dumplings and rich mushroom hot pot kalguksu',
    },
    stayMin: 120,
    coord: [127.7362176, 37.8928954], // 구글 검색 중심 · verify
    mock: false,
  },
  {
    id: 'hoeyeongru',
    name: { en: 'Hoeyeongru', ko: '회영루', th: 'Hoeyeongru' },
    category: 'meal',
    oneLine: {
      en: 'a Chinese-style old restaurant with a long history',
      ko: '오랜 역사의 중식당',
      th: 'a Chinese-style old restaurant with a long history',
    },
    stayMin: 120,
    coord: [127.7263302, 37.8808601], // 구글맵 실측
    mock: false,
  },
  {
    id: 'saemto-dakgalbi',
    name: { en: 'Saemto Myeongmul Dakgalbi', ko: '샘토명물닭갈비', th: 'Saemto Myeongmul Dakgalbi' },
    category: 'meal',
    oneLine: {
      en: 'Grilled iron plates and charcoal near Soyanggang Dam',
      ko: '소양강댐 인근 철판·숯불 닭갈비',
      th: 'Grilled iron plates and charcoal near Soyanggang Dam',
    },
    stayMin: 120,
    coord: [127.790303, 37.9313189], // 구글맵 실측
    mock: false,
  },
  {
    id: 'wonjo-charcoal-dak',
    name: { en: 'Wonjo Charcoal Dak Bulgogi', ko: '원조숯불닭불고기', th: 'Wonjo Charcoal Dak Bulgogi' },
    category: 'meal',
    oneLine: {
      en: 'A method of grilling with charcoal scent over an open fire',
      ko: '숯불 향을 입힌 직화 구이',
      th: 'A method of grilling with charcoal scent over an open fire',
    },
    stayMin: 120,
    coord: [127.7253325, 37.8787637], // 구글맵 실측
    mock: false,
  },
  {
    id: 'onefive-dakgalbi',
    name: { en: '1.5 Dakgalbi (Main)', ko: '1.5 닭갈비 본점', th: '1.5 Dakgalbi (Main)' },
    category: 'meal',
    oneLine: {
      en: 'A special sauce with a slight curry scent and a generous portion',
      ko: '은은한 커리 향의 특제 소스와 푸짐한 양',
      th: 'A special sauce with a slight curry scent and a generous portion',
    },
    stayMin: 120,
    coord: [127.7530769, 37.8763358], // 구글맵 실측
    mock: false,
  },
  {
    id: 'todam-galbi',
    name: { en: 'Todam Charcoal Galbi', ko: '토담 숯불갈비', th: 'Todam Charcoal Galbi' },
    category: 'meal',
    oneLine: {
      en: 'Local Charcoal Dakgalbi Restaurant in the form of a large outdoor garden',
      ko: '넓은 야외 정원 형태의 로컬 숯불 닭갈비',
      th: 'Local Charcoal Dakgalbi Restaurant in the form of a large outdoor garden',
    },
    stayMin: 120,
    coord: [127.7830248, 37.9294243], // 구글맵 실측
    mock: false,
  },
  ...[7, 8, 9, 10, 11].map((n) => mockVenue(n, 'meal')),

  // ---------- foodspace (실명 12 = 3 + [V5] 9 · 목업 0) ----------
  {
    id: 'gamja-farm',
    name: { en: 'Gamja Farm', ko: '감자밭', th: 'คัมจาบัท' },
    category: 'foodspace',
    oneLine: {
      en: 'Bakery famous for its potato bread',
      ko: '감자빵으로 이름난 베이커리',
      th: 'เบเกอรีที่ขึ้นชื่อเรื่องขนมปังมันฝรั่ง',
    },
    stayMin: 120,
    coord: [127.744, 37.941], // PLACEHOLDER — verify
    mock: false,
  },
  {
    id: 'soul-roastery',
    name: { en: 'Soul Roastery', ko: '소울로스터리', th: 'โซลโรสเตอรี' },
    category: 'foodspace',
    oneLine: {
      en: 'Specialty coffee roastery',
      ko: '스페셜티 커피 로스터리',
      th: 'โรงคั่วกาแฟสเปเชียลตี',
    },
    stayMin: 120,
    coord: [127.718, 37.877], // PLACEHOLDER — verify
    mock: false,
  },
  {
    id: 'hwadong-2571',
    name: { en: 'Hwadong 2571', ko: '화동2571', th: 'ฮวาดง 2571' },
    category: 'foodspace',
    oneLine: {
      en: 'Neighborhood cafe in the old town',
      ko: '구도심의 동네 카페',
      th: 'คาเฟ่ย่านเมืองเก่า',
    },
    stayMin: 120,
    coord: [127.733, 37.882], // PLACEHOLDER — verify
    mock: false,
  },
  // [V5] mockup1.md Food Spaces 12~20 실명 반영 · 좌표 = 네이버 place redirect / 구글맵 !3d!4d 실측.
  {
    id: 'earth17-cafe',
    name: { en: 'Earth17 Cafe', ko: 'earth17', th: 'Earth17 Cafe' },
    category: 'foodspace',
    oneLine: {
      en: 'A scenic cafe which serves as a music room with a river view',
      ko: '강 전망의 음악감상실 겸 감성 카페',
      th: 'A scenic cafe which serves as a music room with a river view',
    },
    stayMin: 120,
    coord: [127.7939691, 37.9327656], // 네이버 실측
    mock: false,
  },
  {
    id: 'mom-in-garden',
    name: { en: 'Mom in the Garden', ko: 'Mom in the Garden', th: 'Mom in the Garden' },
    category: 'foodspace',
    oneLine: {
      en: 'Cozy garden cafe offering homemade brunch, coffee and desserts',
      ko: '홈메이드 브런치·커피·디저트의 아늑한 정원 카페',
      th: 'Cozy garden cafe offering homemade brunch, coffee and desserts',
    },
    stayMin: 120,
    coord: [127.7261897, 37.892909], // 네이버 실측
    mock: false,
  },
  {
    id: 'saempildeu-cafe',
    name: { en: 'Saempildeu', ko: '샘필드', th: 'Saempildeu' },
    category: 'foodspace',
    oneLine: {
      en: 'Cafe famous for buckwheat bread and buckwheat cream latte',
      ko: '메밀빵과 메밀크림라떼로 유명한 카페',
      th: 'Cafe famous for buckwheat bread and buckwheat cream latte',
    },
    stayMin: 120,
    coord: [127.7813995, 37.9295579], // 구글맵 실측
    mock: false,
  },
  {
    id: 'choilang',
    name: { en: 'Choilang', ko: '초이랑', th: 'Choilang' },
    category: 'foodspace',
    oneLine: {
      en: 'Cafe known for gelato and souffle',
      ko: '젤라또와 수플레로 알려진 카페',
      th: 'Cafe known for gelato and souffle',
    },
    stayMin: 120,
    coord: [127.781504, 37.9306996], // 구글맵 실측
    mock: false,
  },
  {
    id: 'character-indeo',
    name: { en: 'Character Indeo Coffee', ko: 'Character Indeo Coffee', th: 'Character Indeo Coffee' },
    category: 'foodspace',
    oneLine: {
      en: 'Kid-friendly cafe with fun character designs',
      ko: '재미있는 캐릭터 디자인의 키즈 프렌들리 카페',
      th: 'Kid-friendly cafe with fun character designs',
    },
    stayMin: 120,
    coord: [127.7138295, 37.8165401], // 네이버 실측
    mock: false,
  },
  {
    id: 'cafe-nas',
    name: { en: "Cafe Na's", ko: "Cafe Na's", th: "Cafe Na's" },
    category: 'foodspace',
    oneLine: {
      en: 'Cafe known for waffles with spectacular view of Soyang River',
      ko: '소양강 전망과 와플로 알려진 카페',
      th: 'Cafe known for waffles with spectacular view of Soyang River',
    },
    stayMin: 120,
    coord: [127.7874307, 37.9293629], // 구글맵 실측
    mock: false,
  },
  {
    id: 'tomntoms-soyang',
    name: { en: 'Tom N Toms Coffee', ko: '탐앤탐스', th: 'Tom N Toms Coffee' },
    category: 'foodspace',
    oneLine: {
      en: '24-hour cafe located below Soyang Dam',
      ko: '소양강댐 아래 위치한 24시간 카페',
      th: '24-hour cafe located below Soyang Dam',
    },
    stayMin: 120,
    coord: [127.7877602, 37.9260948], // 구글맵 실측
    mock: false,
  },
  {
    id: 'arcape-coffee',
    name: { en: 'Arcape Coffee', ko: 'ARCAPE COFFEE', th: 'Arcape Coffee' },
    category: 'foodspace',
    oneLine: {
      en: 'A comfortable coffee shop with an adjacent art gallery space',
      ko: '아트 갤러리를 갖춘 편안한 커피숍',
      th: 'A comfortable coffee shop with an adjacent art gallery space',
    },
    stayMin: 120,
    coord: [127.6924301, 37.8957058], // 네이버 실측
    mock: false,
  },
  {
    id: 'cafe-bomnal',
    name: { en: 'Cafe Bomnal', ko: '카페봄날', th: 'Cafe Bomnal' },
    category: 'foodspace',
    oneLine: {
      en: 'A great cafe for view of Chuncheon',
      ko: '춘천 전망 좋은 카페',
      th: 'A great cafe for view of Chuncheon',
    },
    stayMin: 120,
    coord: [127.7785008, 37.8880807], // 구글맵 실측
    mock: false,
  },

  // ---------- activity (실명 12 = 7 + [V5] 5 · 목업 0 · 23=makguksu 중복 주의) ----------
  {
    id: 'makguksu-museum',
    name: { en: 'Makguksu Experience Museum', ko: '막국수체험박물관', th: 'พิพิธภัณฑ์ประสบการณ์มักกุกซู' },
    category: 'activity',
    oneLine: {
      en: 'Make your own makguksu noodles',
      ko: '막국수를 직접 만들어 보는 체험',
      th: 'ลองทำเส้นมักกุกซูด้วยตัวเอง',
    },
    stayMin: 120,
    coord: [127.73, 37.944], // PLACEHOLDER — verify
    mock: false,
  },
  {
    id: 'skywalk',
    name: { en: 'Soyanggang Skywalk', ko: '소양강 스카이워크', th: 'โซยังกัง สกายวอล์ก' },
    category: 'activity',
    oneLine: {
      en: 'Glass walkway over the Soyang River',
      ko: '소양강 위를 걷는 유리 산책로',
      th: 'ทางเดินกระจกเหนือแม่น้ำโซยัง',
    },
    stayMin: 120,
    coord: [127.723, 37.921], // PLACEHOLDER — verify
    mock: false,
  },
  {
    id: 'soyang-dam',
    name: { en: 'Soyang River Dam', ko: '소양강댐', th: 'เขื่อนโซยังกัง' },
    category: 'activity',
    oneLine: {
      en: 'Dam top with a wide lake view',
      ko: '호수 전망이 트인 소양강댐',
      th: 'สันเขื่อนวิวทะเลสาบกว้าง',
    },
    stayMin: 120,
    coord: [127.779, 37.945], // PLACEHOLDER — verify
    mock: false,
  },
  {
    id: 'gongjicheon',
    name: { en: 'Gongjicheon', ko: '공지천', th: 'คงจีชอน' },
    category: 'activity',
    oneLine: {
      en: 'Riverside park for a slow walk',
      ko: '느리게 걷기 좋은 공지천 산책로',
      th: 'สวนริมน้ำเหมาะกับการเดินเล่น',
    },
    stayMin: 120,
    coord: [127.718, 37.868], // PLACEHOLDER — verify
    mock: false,
  },
  {
    id: 'soyang-maiden',
    name: { en: 'Soyanggang Maiden Statue', ko: '소양강처녀상', th: 'รูปปั้นสาวโซยังกัง' },
    category: 'activity',
    oneLine: {
      en: 'Riverside landmark statue',
      ko: '소양강의 랜드마크 동상',
      th: 'รูปปั้นแลนด์มาร์กริมแม่น้ำ',
    },
    stayMin: 120,
    coord: [127.725, 37.919], // PLACEHOLDER — verify
    mock: false,
  },
  {
    id: 'jungdo-mullegil',
    name: { en: 'Jungdo Mullegil Canoe', ko: '중도 물레길', th: 'จุงโด มุลเลกิล (แคนู)' },
    category: 'activity',
    oneLine: {
      en: 'Canoe paddling around Jungdo island',
      ko: '중도를 도는 카누 물레길',
      th: 'พายแคนูรอบเกาะจุงโด',
    },
    stayMin: 120,
    coord: [127.708, 37.893], // PLACEHOLDER — verify
    mock: false,
  },
  {
    id: 'art-circle',
    name: { en: 'Art Circle', ko: '아트서클', th: 'อาร์ตเซอร์เคิล' },
    category: 'activity',
    oneLine: {
      en: 'Local art space and workshops',
      ko: '로컬 아트 스페이스와 워크숍',
      th: 'อาร์ตสเปซท้องถิ่นและเวิร์กช็อป',
    },
    stayMin: 120,
    coord: [127.729, 37.88], // PLACEHOLDER — verify
    mock: false,
  },
  // [V5] mockup1.md Activities 21~25 실명 반영 · 좌표 = 네이버 place redirect 실측.
  {
    id: 'gangchon-railpark',
    name: { en: 'Gangchon Rail Park', ko: '강촌레일파크', th: 'Gangchon Rail Park' },
    category: 'activity',
    oneLine: {
      en: "Rail bike experience through Chuncheon's breathtaking landscape",
      ko: '춘천의 절경을 달리는 레일바이크 체험',
      th: "Rail bike experience through Chuncheon's breathtaking landscape",
    },
    stayMin: 120,
    coord: [127.7121307, 37.8156589], // 네이버 실측
    mock: false,
  },
  {
    id: 'chuncheon-national-museum',
    name: { en: 'Chuncheon National Museum', ko: '국립춘천박물관', th: 'Chuncheon National Museum' },
    category: 'activity',
    oneLine: {
      en: "Exhibit to discover Chuncheon's history and culture",
      ko: '춘천의 역사와 문화를 만나는 전시',
      th: "Exhibit to discover Chuncheon's history and culture",
    },
    stayMin: 120,
    coord: [127.7538801, 37.8639007], // 네이버 실측
    mock: false,
  },
  // [V5-주의] 아래는 기존 실명 venue 'makguksu-museum'(막국수체험박물관)과 동일 장소 — mockup1.md 23번 중복.
  //   사용자 확인 대기: 둘 중 하나만 남기는 게 맞음(현재는 지시 "전부 반영"대로 둘 다 유지 · 좌표는 실측값).
  {
    id: 'chuncheon-makguksu-museum',
    name: { en: 'Chuncheon Makguksu Museum', ko: '춘천막국수체험박물관', th: 'Chuncheon Makguksu Museum' },
    category: 'activity',
    oneLine: {
      en: 'Hands-on experience making and tasting makguksu, Chuncheon buckwheat noodles',
      ko: '춘천 메밀국수 막국수를 만들고 맛보는 체험',
      th: 'Hands-on experience making and tasting makguksu, Chuncheon buckwheat noodles',
    },
    stayMin: 120,
    coord: [127.7498365, 37.9488005], // 네이버 실측
    mock: false,
  },
  {
    id: 'legoland',
    name: { en: 'Legoland Korea Resort', ko: '레고랜드 코리아', th: 'Legoland Korea Resort' },
    category: 'activity',
    oneLine: {
      en: 'Lego-themed amusement park full of fun rides and attractions for families',
      ko: '가족을 위한 레고 테마 놀이공원',
      th: 'Lego-themed amusement park full of fun rides and attractions for families',
    },
    stayMin: 120,
    coord: [127.6993349, 37.8846516], // 네이버 실측
    mock: false,
  },
  {
    id: 'animation-museum',
    name: { en: 'Animation Museum', ko: '애니메이션박물관', th: 'Animation Museum' },
    category: 'activity',
    oneLine: {
      en: 'Interactive place to discover the evolution of K-animation and robots',
      ko: 'K-애니메이션과 로봇의 진화를 만나는 인터랙티브 공간',
      th: 'Interactive place to discover the evolution of K-animation and robots',
    },
    stayMin: 120,
    coord: [127.6918678, 37.8930335], // 네이버 실측
    mock: false,
  },
];

// 목업 카드 공장 · 이름은 3언어 모두 "Mockup N" 동일(창작 실명 0 계약).
// §30: 목업은 surface 면 + "Coming soon" Chip, 사진 영역 비렌더 — 렌더 규칙은 존 C4 소유.
function mockVenue(n, category) {
  return {
    id: `mock-${n}`,
    name: { en: `Mockup ${n}`, ko: `Mockup ${n}`, th: `Mockup ${n}` },
    category,
    oneLine: {
      en: 'Local partner slot, details coming soon',
      ko: '로컬 제휴 슬롯입니다. 확정 후 공개됩니다.',
      th: 'ร้านพันธมิตรท้องถิ่น จะประกาศเมื่อยืนยันแล้ว',
    },
    stayMin: 120,
    coord: null,
    mock: true,
  };
}

export default venues;
