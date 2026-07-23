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
    coord: [127.7313722, 37.9022634], // 네이버 실측 · 춘천백일칼국수 우두점(id 1127380163)
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
    coord: [127.7393575, 37.9086236], // 네이버 실측 · 2025년 우두동 이전(충열로 175, id 13414103)
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

  // ---------- meal (실명 13 신규 · [V13] 사용자 제공 목록) ----------
  //   할루시네이션 방지: 이름·소개·링크는 제공값 · 좌표는 실좌표 미조회라 mockCoords DEMO 결정 배치(coord:null)
  //   · story는 제공 소개 기반 2문장(과장 금지) · th는 en 폴백(기존 실명 venue 패턴 동일).
  {
    id: 'sandak',
    name: { en: 'Sandak', ko: '산닭', th: 'Sandak' },
    category: 'meal',
    oneLine: {
      en: 'Mountain-side dakgalbi with potato pancake and buckwheat noodles',
      ko: '감자전과 막국수를 곁들이는 춘천 산속 닭갈비',
      th: 'Mountain-side dakgalbi with potato pancake and buckwheat noodles',
    },
    stayMin: 120,
    coord: null, // DEMO — 실좌표 조회 시 교체(mockCoords 결정 배치)
    mock: false,
    link: 'https://instagram.com/sandak__official',
    image: '/images/venues/sandak.jpg',
    story: {
      en: 'Sandak grills Chuncheon-style dakgalbi in a mountain setting, served with its own potato pancake and buckwheat noodles. Regulars come for that classic local combination in a calm, out-of-town spot.',
      ko: '산속에서 춘천식 닭갈비를 굽고 감자전과 막국수를 함께 낸다. 한적한 분위기에서 이 조합을 즐기려는 단골이 많다.',
      th: 'Sandak grills Chuncheon-style dakgalbi in a mountain setting, served with its own potato pancake and buckwheat noodles. Regulars come for that classic local combination in a calm, out-of-town spot.',
    },
  },
  {
    id: 'san-squid',
    name: { en: 'San-Squid Sliced Fish', ko: 'San-Squid Sliced Fish', th: 'San-Squid Sliced Fish' },
    category: 'meal',
    oneLine: {
      en: 'Live shellfish and clams grilled at the table',
      ko: '테이블에서 굽는 활어조개구이',
      th: 'Live shellfish and clams grilled at the table',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    link: 'https://naver.me/FpwW3oYv',
    image: '/images/venues/san-squid.jpg',
    story: {
      en: 'San-Squid serves live shellfish and clams grilled right at your table. It is a hands-on seafood meal that rewards a slower, shared pace.',
      ko: '활어조개를 테이블에서 직접 구워 먹는 곳이다. 여럿이 천천히 나눠 먹기 좋은 해산물 상차림이다.',
      th: 'San-Squid serves live shellfish and clams grilled right at your table. It is a hands-on seafood meal that rewards a slower, shared pace.',
    },
  },
  {
    id: 'modern-buckwheat',
    name: { en: 'Modern Buckwheat', ko: '모던메밀', th: 'Modern Buckwheat' },
    category: 'meal',
    oneLine: {
      en: 'A locally certified take on Chuncheon buckwheat',
      ko: '로컬이 인정한 모던 메밀 맛집',
      th: 'A locally certified take on Chuncheon buckwheat',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    link: 'https://instagram.com/modern_maemeal',
    image: '/images/venues/modern-buckwheat.jpg',
    story: {
      en: "Modern Buckwheat reworks Chuncheon's buckwheat tradition into a cleaner, contemporary plate. It has earned a local following as a certified neighborhood favorite.",
      ko: '춘천 메밀을 현대적으로 재해석한 집이다. 로컬 사이에서 인증된 맛집으로 통한다.',
      th: "Modern Buckwheat reworks Chuncheon's buckwheat tradition into a cleaner, contemporary plate. It has earned a local following as a certified neighborhood favorite.",
    },
  },
  {
    id: 'haneoul',
    name: { en: 'Haneoul', ko: 'Haneoul', th: 'Haneoul' },
    category: 'meal',
    oneLine: {
      en: 'Mori soba and an assorted cutlet platter',
      ko: '모리소바와 모둠카츠',
      th: 'Mori soba and an assorted cutlet platter',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    link: 'https://naver.me/5MV7UDaf',
    image: '/images/venues/haneoul.jpg',
    story: {
      en: 'Haneoul pairs chilled mori soba with an assorted cutlet platter for a light, varied lunch. The set makes it easy for a group to share a bit of everything.',
      ko: '시원한 모리소바와 모둠카츠를 함께 낸다. 여럿이 조금씩 나눠 먹기 좋은 구성이다.',
      th: 'Haneoul pairs chilled mori soba with an assorted cutlet platter for a light, varied lunch. The set makes it easy for a group to share a bit of everything.',
    },
  },
  {
    id: 'hwadon-garden',
    name: { en: 'Hwadon Garden', ko: 'Hwadon Garden', th: 'Hwadon Garden' },
    category: 'meal',
    oneLine: {
      en: 'Private-room dinners in a garden setting',
      ko: '정원 분위기의 프라이빗룸 디너',
      th: 'Private-room dinners in a garden setting',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    link: 'https://naver.me/Grma4r8Q',
    image: '/images/venues/hwadon-garden.jpg',
    story: {
      en: 'Hwadon Garden serves dinner in private rooms with a quiet garden feel. It suits groups who want a calmer, more private table.',
      ko: '정원 분위기 속 프라이빗룸에서 저녁을 낸다. 조용하고 프라이빗한 자리를 원하는 일행에게 어울린다.',
      th: 'Hwadon Garden serves dinner in private rooms with a quiet garden feel. It suits groups who want a calmer, more private table.',
    },
  },
  {
    id: 'himalayan-indian',
    name: { en: 'Himalayan Indian Cuisine', ko: 'Himalayan Indian Cuisine', th: 'Himalayan Indian Cuisine' },
    category: 'meal',
    oneLine: {
      en: 'Traditional Indian curries in Chuncheon',
      ko: '춘천의 전통 인도 커리',
      th: 'Traditional Indian curries in Chuncheon',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    link: 'https://naver.me/GbDRmj5m',
    image: '/images/venues/himalayan-indian.jpg',
    story: {
      en: 'Himalayan Indian Cuisine cooks traditional curries for a change of pace from the local grills. It is a reliable stop for travelers who want something different midway through the day.',
      ko: '로컬 구이와는 다른 전통 인도 커리를 낸다. 하루 중간에 색다른 한 끼를 원할 때 좋은 선택이다.',
      th: 'Himalayan Indian Cuisine cooks traditional curries for a change of pace from the local grills. It is a reliable stop for travelers who want something different midway through the day.',
    },
  },
  {
    id: 'umi-dakgalbi',
    name: { en: 'Umi Dakgalbi', ko: '우미 닭갈비', th: 'Umi Dakgalbi' },
    category: 'meal',
    oneLine: {
      en: 'Blue Ribbon certified Chuncheon dakgalbi',
      ko: '블루리본 인증 춘천 닭갈비',
      th: 'Blue Ribbon certified Chuncheon dakgalbi',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    link: 'https://naver.me/Gf0jYQgG',
    image: '/images/venues/umi-dakgalbi.jpg',
    story: {
      en: "Umi Dakgalbi is a Blue Ribbon certified take on the city's signature dish. The recognition draws a steady line, so an off-peak slot helps.",
      ko: '춘천 대표 음식을 블루리본 인증으로 인정받은 집이다. 줄이 꾸준한 편이라 붐비는 시간대는 피하는 게 좋다.',
      th: "Umi Dakgalbi is a Blue Ribbon certified take on the city's signature dish. The recognition draws a steady line, so an off-peak slot helps.",
    },
  },
  {
    id: 'hakgok-makguksu',
    name: { en: 'Hakgok Makguksu & Dakgalbi', ko: '학곡막국수닭갈비', th: 'Hakgok Makguksu & Dakgalbi' },
    category: 'meal',
    oneLine: {
      en: 'Makguksu and dakgalbi under one roof',
      ko: '막국수와 닭갈비를 한자리에서',
      th: 'Makguksu and dakgalbi under one roof',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    link: 'https://smartstore.naver.com/hakgokri',
    image: '/images/venues/hakgok.jpg',
    story: {
      en: "Hakgok serves both makguksu and dakgalbi, so a group can cover Chuncheon's two staples in one sitting. It is a practical single stop for first-time visitors.",
      ko: '막국수와 닭갈비를 한곳에서 낸다. 춘천의 두 대표 메뉴를 한 번에 맛보기 좋은 실용적인 한 곳이다.',
      th: "Hakgok serves both makguksu and dakgalbi, so a group can cover Chuncheon's two staples in one sitting. It is a practical single stop for first-time visitors.",
    },
  },
  {
    id: 'saembat-makguksu',
    name: { en: 'Saembat Makguksu', ko: '샘밭막국수', th: 'Saembat Makguksu' },
    category: 'meal',
    oneLine: {
      en: 'Pure buckwheat makguksu with pressed pork',
      ko: '순메밀 막국수와 편육',
      th: 'Pure buckwheat makguksu with pressed pork',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    image: '/images/venues/saembat.jpg',
    story: {
      en: 'Saembat Makguksu plates pure buckwheat noodles alongside pressed pork. The pairing is a Chuncheon classic done simply and well.',
      ko: '순메밀 막국수에 편육을 곁들여 낸다. 단정하게 잘 차려낸 춘천의 정석 조합이다.',
      th: 'Saembat Makguksu plates pure buckwheat noodles alongside pressed pork. The pairing is a Chuncheon classic done simply and well.',
    },
  },
  {
    id: 'keunjip-hanwoo',
    name: { en: 'Keunjip Hanwoo', ko: '큰집한우', th: 'Keunjip Hanwoo' },
    category: 'meal',
    oneLine: {
      en: 'Dry-aged Korean beef',
      ko: '드라이에이징 한우',
      th: 'Dry-aged Korean beef',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    image: '/images/venues/keunjip-hanwoo.jpg',
    story: {
      en: 'Keunjip Hanwoo focuses on dry-aged Korean beef for a richer, more concentrated flavor. It is the splurge option among the day’s meals.',
      ko: '드라이에이징 한우로 진한 풍미를 낸다. 하루 식사 중 특별한 한 끼를 원할 때의 선택이다.',
      th: 'Keunjip Hanwoo focuses on dry-aged Korean beef for a richer, more concentrated flavor. It is the splurge option among the day’s meals.',
    },
  },
  {
    id: 'silbi-makguksu',
    name: { en: 'Chuncheon Silbi Makguksu', ko: '춘천실비막국수', th: 'Chuncheon Silbi Makguksu' },
    category: 'meal',
    oneLine: {
      en: 'Makguksu with pressed pork and mustard sauce',
      ko: '편육과 겨자소스 막국수',
      th: 'Makguksu with pressed pork and mustard sauce',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    image: '/images/venues/silbi.jpg',
    story: {
      en: 'Chuncheon Silbi Makguksu serves its buckwheat noodles with pressed pork and a sharp mustard sauce. The mustard kick is what regulars come back for.',
      ko: '막국수에 편육과 알싸한 겨자소스를 곁들인다. 이 겨자 맛에 다시 찾는 단골이 많다.',
      th: 'Chuncheon Silbi Makguksu serves its buckwheat noodles with pressed pork and a sharp mustard sauce. The mustard kick is what regulars come back for.',
    },
  },
  {
    id: 'nambu-makguksu',
    name: { en: 'Nambu Makguksu', ko: '남부막국수', th: 'Nambu Makguksu' },
    category: 'meal',
    oneLine: {
      en: 'Traditional makguksu with potato pancake',
      ko: '전통 막국수와 감자전',
      th: 'Traditional makguksu with potato pancake',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    image: '/images/venues/nambu.jpg',
    story: {
      en: 'Nambu Makguksu keeps to a traditional buckwheat plate with a side of potato pancake. It is a straightforward, dependable local lunch.',
      ko: '전통 막국수에 감자전을 곁들이는 집이다. 군더더기 없이 믿음직한 로컬 점심이다.',
      th: 'Nambu Makguksu keeps to a traditional buckwheat plate with a side of potato pancake. It is a straightforward, dependable local lunch.',
    },
  },
  {
    id: 'pyeongyang-naengmyeon',
    name: { en: 'Pyeongyang Naengmyeon', ko: '평양냉면', th: 'Pyeongyang Naengmyeon' },
    category: 'meal',
    oneLine: {
      en: 'Pyongyang-style cold noodles with boiled pork',
      ko: '평양냉면과 수육',
      th: 'Pyongyang-style cold noodles with boiled pork',
    },
    stayMin: 120,
    coord: null, // DEMO
    mock: false,
    image: '/images/venues/pyeongyang.jpg',
    story: {
      en: 'This spot serves Pyongyang-style cold buckwheat noodles with a plate of boiled pork. The clean, cool broth suits a warm afternoon in the itinerary.',
      ko: '평양식 냉면에 수육을 함께 낸다. 맑고 시원한 육수가 따뜻한 오후 일정에 잘 맞는다.',
      th: 'This spot serves Pyongyang-style cold buckwheat noodles with a plate of boiled pork. The clean, cool broth suits a warm afternoon in the itinerary.',
    },
  },
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
    coord: [127.7676653, 37.9244011], // 네이버 실측 · 소울로스터리(소양강로 538, id 1164959443)
    mock: false,
  },
  {
    id: 'hwadong-2571',
    name: { en: 'Hwadong 2571', ko: '화동2571', th: 'ฮวาดง 2571' },
    category: 'foodspace',
    oneLine: {
      en: 'A K-food culture complex of cafes and kitchens',
      ko: '카페와 청년 주방이 모인 먹거리 복합문화공간',
      th: 'ศูนย์วัฒนธรรมอาหารรวมคาเฟ่และครัว',
    },
    stayMin: 120,
    coord: [127.716055, 37.8872075], // 네이버 실측 · 화동2571 복합문화공간(영서로 2571, id 1018763789)
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

  // ---------- activity (실명 11 = 6 + [V5] 5 · 목업 0) ----------
  // 구 'makguksu-museum'은 chuncheon-makguksu-museum(신북로 264 실주소)과 동일 장소라 제거([V5] 중복 정리).
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
    coord: [127.813266, 37.947555], // 네이버 실측 · 소양강댐 정상(준공기념탑 일대, id 15637604)
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
      en: 'A circular public-art sky-deck over the old town',
      ko: '구도심 위를 도는 공공예술 공중 데크',
      th: 'เดคลอยฟ้าวงกลมศิลปะสาธารณะเหนือเมืองเก่า',
    },
    stayMin: 120,
    coord: [127.7269438, 37.8936299], // 네이버 실측 · 소양아트서클(소양2교 앞, id 4090051998)
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
  // 막국수 중복 정리 완료: 구 'makguksu-museum'을 제거하고 이 항목(실주소 신북읍 신북로 264)만 유지.
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
