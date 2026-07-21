// ============================================================
// venues.js · GTS 조립 카드 풀 (IA §9.4 · PATTERNS §30)
// 할루시네이션 방지 계약:
//   실명은 CC_PROMPT_9 허용 목록 11곳만. 그 외 슬롯은 전부 name "Mockup N" + mock:true.
//   목업 coord는 null(지어낸 좌표 금지 — §32: 좌표 없는 픽은 지도 대신 순서 리스트).
//   실명 좌표는 대략값 + // PLACEHOLDER — verify (현장 핀 찍기로 교체, PROGRESS 준비물).
// oneLine 카피는 초안(확정 카피 교체 대상). th 표기는 기계 번역 초안 — 네이티브 검수 대기.
// category: 'meal'(식사) | 'foodspace'(카페·베이커리·디저트) | 'activity'(액티비티)
// 카테고리당 12개(새로고침 로테이션 검증용, §30 pageSize 8 × 2페이지 여유).
// stayMin 120 고정(픽 1개 = 2시간 슬롯, IA §9.4). coord는 [lng, lat].
// ============================================================

export const venues = [
  // ---------- meal (12 = 실명 1 + 목업 11) ----------
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
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => mockVenue(n, 'meal')),

  // ---------- foodspace (12 = 실명 3 + 목업 9) ----------
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
  ...[12, 13, 14, 15, 16, 17, 18, 19, 20].map((n) => mockVenue(n, 'foodspace')),

  // ---------- activity (12 = 실명 7 + 목업 5) ----------
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
  ...[21, 22, 23, 24, 25].map((n) => mockVenue(n, 'activity')),
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
