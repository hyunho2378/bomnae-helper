// Gate 경로 목데이터 — 룰 기반 정적 시간표(MVP는 실시간 API 없음, IA §2.2).
// 시간표·요금·소요 전부 DRAFT — PLACEHOLDER — verify on site.
// terminal 키: 't1'(ICN T1) | 't2'(ICN T2) | 'gmp'(GMP) — GateForm select value와 동일해야 한다.
const BUFFER_MIN = 60; // 입국수속 버퍼 — 도착시각 + 60분 후 첫 탑승 편 계산 (IA §2.2)

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHHMM = (min) =>
  `${String(Math.floor((min % 1440) / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

const OPTIONS = [
  {
    id: 'rail',
    name_en: 'Rail — AREX + ITX-Cheongchun',
    name_ko: '철도 — 공항철도 + ITX-청춘',
    transfers: 2,
    fare: 11800, // DRAFT — PLACEHOLDER — verify on site
    duration_by_terminal: { t1: 195, t2: 205, gmp: 165 }, // DRAFT 분 단위
    schedule: { first: '05:30', last: '21:30', headway_min: 30 }, // DRAFT — ITX 기준
    legs: [
      {
        id: 'arex',
        photo: '/images/stops/gate-arex.jpg', // PLACEHOLDER — 현장 촬영 교체
        dir_en: 'Take AREX from your terminal to Seoul Station.',
        dir_ko: '터미널에서 공항철도(AREX)를 타고 서울역까지 이동합니다.',
        duration_min: 60, // DRAFT
      },
      {
        id: 'transfer',
        photo: '/images/stops/gate-yongsan.jpg', // PLACEHOLDER — 현장 촬영 교체
        dir_en: 'Move one stop to Yongsan and board ITX-Cheongchun.',
        dir_ko: '용산역으로 한 정거장 이동해 ITX-청춘에 탑승합니다.',
        duration_min: 25, // DRAFT
      },
      {
        id: 'itx',
        photo: '/images/stops/gate-itx.jpg', // PLACEHOLDER — 현장 촬영 교체
        dir_en: 'Ride ITX-Cheongchun to Namchuncheon Station.',
        dir_ko: 'ITX-청춘을 타고 남춘천역까지 이동합니다.',
        duration_min: 75, // DRAFT
      },
    ],
  },
  {
    id: 'bus',
    name_en: 'Direct bus — Airport to Chuncheon',
    name_ko: '직행버스 — 공항에서 춘천까지',
    transfers: 0,
    fare: 23000, // DRAFT — PLACEHOLDER — verify on site
    duration_by_terminal: { t1: 160, t2: 170, gmp: 140 }, // DRAFT 분 단위
    schedule: { first: '06:00', last: '22:00', headway_min: 60 }, // DRAFT
    legs: [
      {
        id: 'bus-stop',
        photo: '/images/stops/gate-bus-stop.jpg', // PLACEHOLDER — 현장 촬영 교체
        dir_en: 'Find the intercity bus stop outside the arrivals hall.',
        dir_ko: '입국장 밖 시외버스 승차장으로 이동합니다.',
        duration_min: 15, // DRAFT
      },
      {
        id: 'bus-ride',
        photo: '/images/stops/gate-bus.jpg', // PLACEHOLDER — 현장 촬영 교체
        dir_en: 'Ride the direct bus to Chuncheon Intercity Bus Terminal.',
        dir_ko: '직행버스를 타고 춘천시외버스터미널까지 이동합니다.',
        duration_min: 145, // DRAFT
      },
    ],
  },
];

// planGate({terminal, date, time}) — 옵션 배열 반환. 첫 탑승 편 = 도착시각 + 60분 버퍼
// 이후 시간표(first/headway)상 가장 이른 출발. 막차 이후면 다음 날 첫차(next_day: true).
export function planGate({ terminal = 't1', date, time }) {
  const ready = toMin(time) + BUFFER_MIN;
  return OPTIONS.map((option) => {
    const { first, last, headway_min } = option.schedule;
    let dep;
    let nextDay = false;
    if (ready <= toMin(first)) {
      dep = toMin(first);
    } else {
      dep = toMin(first) + Math.ceil((ready - toMin(first)) / headway_min) * headway_min;
    }
    if (dep > toMin(last)) {
      dep = toMin(first);
      nextDay = true;
    }
    return {
      ...option,
      date,
      first_available: toHHMM(dep),
      next_day: nextDay,
      total_duration_min:
        option.duration_by_terminal[terminal] ?? option.duration_by_terminal.t1,
    };
  });
}
