// DEMO 연출값 · About 크라우드펀딩 캠페인 수치의 단일 출처(v4.4 지시).
// progress 등 파생값은 여기서 계산해 소비한다 — 컴포넌트 내 하드코딩 금지.
export const campaign = {
  raised: 3100000,
  goal: 5000000,
  backers: 127,
  daysLeft: 9,
};

// 파생: 진행률(0~1) · 도넛·진행바 공용
export const progress = campaign.raised / campaign.goal;

// DEMO 연출값 · §13 자금 사용처 범례(합 100) — 레퍼런스 부분 가독 기반 초안(보고 참조)
export const fundSplit = [
  { key: 'ops', pct: 40 },
  { key: 'local', pct: 25 },
  { key: 'platform', pct: 20 },
  { key: 'reserve', pct: 15 },
];

// DEMO 연출값 · §5 숫자 증명(실운행 파일럿 지표 — 기존 proof 연출 계승)
export const proofStats = [
  { key: 'courses', value: 3 },
  { key: 'riders', value: 14 },
  { key: 'intl', value: 5 },
];

// DEMO 연출값 · §14 로드맵(연도 배지 — 레퍼런스 가독 기반 초안)
export const roadmap = [
  { key: 's1', year: '2026' },
  { key: 's2', year: '2027' },
  { key: 's3', year: '2027' },
  { key: 's4', year: '2028' },
];
