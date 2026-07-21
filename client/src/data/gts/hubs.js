// ============================================================
// hubs.js · GTS 허브 경로 엔진 데이터 (PATTERNS §29)
// 원칙: 경로는 코드가 계산하지 않는다. 이 큐레이션 템플릿에서 조회만 한다.
// 값은 전부 초안. 시각표·요금·편명·배차 숫자 생성 금지 계약 준수:
//   durMin은 대략값 + 전 항목 // PLACEHOLDER — verify
//   배차는 사전 키 참조 문자열만(headwayNote, 존 A4 gts 네임스페이스에서 정의)
// name.th는 창작 방지를 위해 넣지 않는다 — 표시 언어는 i18n(존 B4)이 소유.
// coord는 [lng, lat] (tokens.map 관례 동일).
// ============================================================

export const hubs = [
  { id: 'icn', name: { en: 'Incheon Airport', ko: '인천공항' }, coord: [126.4505, 37.4602], kind: 'airport' }, // PLACEHOLDER — verify
  { id: 'gmp', name: { en: 'Gimpo Airport', ko: '김포공항' }, coord: [126.7911, 37.5586], kind: 'airport' }, // PLACEHOLDER — verify
  { id: 'yongsan', name: { en: 'Yongsan Station', ko: '용산역' }, coord: [126.9648, 37.5298], kind: 'rail' }, // PLACEHOLDER — verify
  { id: 'sangbong', name: { en: 'Sangbong Station', ko: '상봉역' }, coord: [127.0857, 37.5967], kind: 'rail' }, // PLACEHOLDER — verify
  { id: 'dongseoul', name: { en: 'Dong Seoul Terminal', ko: '동서울터미널' }, coord: [127.0947, 37.535], kind: 'bus' }, // PLACEHOLDER — verify
  { id: 'busan', name: { en: 'Busan Station', ko: '부산역' }, coord: [129.0416, 35.1151], kind: 'rail' }, // PLACEHOLDER — verify
];

// 춘천 도착점 2개 고정 (IA §9.2 도착지 2택)
export const chuncheonPoints = [
  { id: 'chuncheon-station', name: { en: 'Chuncheon Station', ko: '춘천역' }, coord: [127.7166, 37.885], kind: 'rail' }, // PLACEHOLDER — verify
  { id: 'chuncheon-terminal', name: { en: 'Chuncheon Intercity Bus Terminal', ko: '춘천시외버스터미널' }, coord: [127.7248, 37.8623], kind: 'bus' }, // PLACEHOLDER — verify
];

// 허브 → 춘천역/터미널 큐레이션 템플릿.
// legs[].mode ∈ 'rail' | 'intercityBus' | 'subway' | 'taxi' | 'walk'
// From Chuncheon 은 동일 템플릿 역방향 조회(legs reverse) — §29.
// 확신 없는 허브·조합은 추가하지 않았다(계약 3).
export const routeTemplates = [
  {
    from: 'icn',
    to: 'chuncheon-station',
    legs: [
      { mode: 'subway', label: 'AREX + Metro to Yongsan', durMin: 90 }, // PLACEHOLDER — verify
      { mode: 'rail', label: 'ITX-Cheongchun', durMin: 75 }, // PLACEHOLDER — verify
    ],
    headwayNote: 'gts.freq.rail',
  },
  {
    from: 'icn',
    to: 'chuncheon-terminal',
    legs: [
      { mode: 'intercityBus', label: 'Intercity bus', durMin: 150 }, // PLACEHOLDER — verify
    ],
    headwayNote: 'gts.freq.bus',
  },
  {
    from: 'gmp',
    to: 'chuncheon-station',
    legs: [
      { mode: 'subway', label: 'Metro to Yongsan', durMin: 40 }, // PLACEHOLDER — verify
      { mode: 'rail', label: 'ITX-Cheongchun', durMin: 75 }, // PLACEHOLDER — verify
    ],
    headwayNote: 'gts.freq.rail',
  },
  {
    from: 'yongsan',
    to: 'chuncheon-station',
    legs: [
      { mode: 'rail', label: 'ITX-Cheongchun', durMin: 75 }, // PLACEHOLDER — verify
    ],
    headwayNote: 'gts.freq.rail',
  },
  {
    from: 'sangbong',
    to: 'chuncheon-station',
    legs: [
      { mode: 'rail', label: 'Gyeongchun Line', durMin: 90 }, // PLACEHOLDER — verify
    ],
    headwayNote: 'gts.freq.metro',
  },
  {
    from: 'dongseoul',
    to: 'chuncheon-terminal',
    legs: [
      { mode: 'intercityBus', label: 'Intercity bus', durMin: 80 }, // PLACEHOLDER — verify
    ],
    headwayNote: 'gts.freq.bus',
  },
  {
    from: 'busan',
    to: 'chuncheon-station',
    legs: [
      { mode: 'rail', label: 'KTX to Seoul', durMin: 150 }, // PLACEHOLDER — verify
      { mode: 'rail', label: 'ITX-Cheongchun', durMin: 75 }, // PLACEHOLDER — verify
    ],
    headwayNote: 'gts.freq.rail',
  },
];
