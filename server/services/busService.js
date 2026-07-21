// 시외버스 서비스 · 근거: docs/tago/오픈API활용가이드_국토교통부(TAGO)_시외버스정보v1.1.docx
//   나. 상세기능 목록: GetCtyCodeList / GetSuberbsBusTrminlList / GetStrtpntAlocFndSuberbsBusInfo / GetSuberbsBusGradList
//   Base: http://apis.data.go.kr/1613000/SuburbsBusInfo (문서 "가. API 서비스 개요")
// ID 계약(지시 2): 터미널 ID를 코드에 지어 넣지 않는다 — 기동 시 목록 조회 오퍼레이션으로
//   이름 매칭해 캐시(메모리 + server/cache/tago-ids.json), 매칭 로그 출력(사용자 검증용).
// 당일 계약(지시 4): 문서상 당일 배차만 제공 — 선택 날짜가 오늘(KST)이 아니면 호출 없이 fallback.
const fs = require('fs');
const path = require('path');
const { tagoGet, asItems } = require('../lib/tago');

const BASE = 'http://apis.data.go.kr/1613000/SuburbsBusInfo';
const CACHE_FILE = path.join(__dirname, '..', 'cache', 'tago-ids.json');

// 매칭 대상: hubs.js(클라 §29)의 버스 허브 2점만 — dongseoul ↔ chuncheon-terminal
// terminalNm 검색어는 공식 명칭의 안정 부분 문자열(문서 예: terminalNm=서울남부 · 부분 검색 허용 확인)
const HUB_QUERIES = {
  dongseoul: { query: '동서울', pick: (nm) => nm === '동서울' || nm.includes('동서울') },
  // 실조회 후보 7건 중 본터미널은 정확명 "춘천"(NAI2443501) — 정류소("상호아파트(춘천)" 등) 오매칭 방지,
  // 정확 일치 우선 → 폴백 '춘천시외' 포함(검증 로그 2026-07-21)
  'chuncheon-terminal': { query: '춘천', pick: (nm) => nm === '춘천' || nm.includes('춘천시외') },
};

let idCache = null; // { dongseoul: {terminalId, terminalNm}, 'chuncheon-terminal': {...} }

function kstToday() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
  return p.replaceAll('-', ''); // YYYYMMDD
}

async function ensureIds() {
  if (idCache) return idCache;
  // 파일 캐시 우선(기동당 1회 조회 계약 — 재기동 시 재사용, 삭제하면 재조회)
  try {
    idCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    console.log('[tago:bus] ID 캐시 파일 재사용:', CACHE_FILE);
    return idCache;
  } catch {
    /* 캐시 없음 — 신규 조회 */
  }
  const out = {};
  for (const [hubId, { query, pick }] of Object.entries(HUB_QUERIES)) {
    // 문서 2) [시외버스 터미널 목록 조회]: 요청 terminalNm(옵션)·numOfRows / 응답 terminalId·terminalNm
    const body = await tagoGet(BASE, 'GetSuberbsBusTrminlList', { terminalNm: query, numOfRows: 60, pageNo: 1 });
    const items = asItems(body);
    // 정확 일치 우선, 그다음 pick 판정(후보 순서 의존 제거)
    const exact = items.find((it) => String(it.terminalNm ?? '') === query);
    const hit = exact ?? items.find((it) => pick(String(it.terminalNm ?? '')));
    if (!hit) throw new Error(`터미널 매칭 실패: ${hubId}(검색어 ${query}) · 후보 ${items.length}건`);
    out[hubId] = { terminalId: String(hit.terminalId), terminalNm: String(hit.terminalNm) };
    // 사용자 검증용 매칭 로그(지시 2)
    console.log(
      `[tago:bus] 허브 매칭 · ${hubId} ← terminalId=${out[hubId].terminalId} terminalNm="${out[hubId].terminalNm}" (검색어 "${query}" · 후보 ${items.length}건)`,
    );
  }
  idCache = out;
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(out, null, 2));
  return idCache;
}

// "HHMM" ← 문서 3) 응답 예제 depPlandTime=202112010940 (YYYYMMDDHHMM)
const toHHMM = (v) => {
  const s = String(v);
  return s.length >= 12 ? `${s.slice(8, 10)}:${s.slice(10, 12)}` : null;
};

// from/to ∈ {dongseoul, chuncheon-terminal} · date=YYYY-MM-DD(클라 캘린더 값)
async function queryBus(from, to, date) {
  const ids = await ensureIds();
  const dep = ids[from];
  const arr = ids[to];
  if (!dep || !arr) throw new Error(`미지원 허브: ${from}→${to}`);
  const reqDate = date ? date.replaceAll('-', '') : kstToday();
  if (reqDate !== kstToday()) {
    // 당일 배차만 제공(문서·지시 4) — 미래·과거 날짜는 호출하지 않는다
    return { source: 'fallback', reason: 'not-today' };
  }
  // 문서 3) [출/도착지기반 시외버스정보 조회]: depTerminalId·arrTerminalId·depPlandTime(YYYYMMDD)
  const body = await tagoGet(BASE, 'GetStrtpntAlocFndSuberbsBusInfo', {
    depTerminalId: dep.terminalId,
    arrTerminalId: arr.terminalId,
    depPlandTime: reqDate,
    numOfRows: 50,
    pageNo: 1,
  });
  const rows = asItems(body)
    .map((it) => ({
      depTime: toHHMM(it.depPlandTime), // 문서 응답 필드명 그대로
      arrTime: toHHMM(it.arrPlandTime),
      grade: it.gradeNm ? String(it.gradeNm) : null,
      fare: Number.isFinite(Number(it.charge)) ? Number(it.charge) : null,
    }))
    .filter((r) => r.depTime && r.arrTime)
    .sort((a, b) => a.depTime.localeCompare(b.depTime));
  return { source: 'live', from: dep.terminalNm, to: arr.terminalNm, date: reqDate, rows };
}

module.exports = { queryBus, ensureIds, kstToday };
