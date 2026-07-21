// 열차 서비스 · 활용가이드 부재 — 오퍼레이션은 scripts/probe-train.js 실호출 검증으로 채택(지시서 [열차]).
// 채택 근거(2026-07-21 probe 성공 로그):
//   Base: http://apis.data.go.kr/1613000/TrainInfo  (TrainInfoService는 404)
//   GetCtyCodeList                → {citycode:"11",cityname:"서울특별시"} · 15건(강원도=32)
//   GetCtyAcctoTrainSttnList      → {nodeid:"NAT601605",nodename:"망상"} · 강원 48건(춘천·남춘천 포함)
//   GetStrtpntAlocFndTrainInfo    → {trainno,traingradename:"ITX-청춘",depplandtime:"20260721055500",
//                                    arrplandtime,adultcharge:"8300"} · 청량리(NAT130126)→남춘천(NAT140840) 18건
// 역 ID는 코드에 박지 않는다 — 기동 시 목록 조회로 이름 매칭·캐시(tago-ids.json train 섹션).
const fs = require('fs');
const path = require('path');
const { tagoGet, asItems } = require('../lib/tago');

const BASE = 'http://apis.data.go.kr/1613000/TrainInfo';
const CACHE_FILE = path.join(__dirname, '..', 'cache', 'tago-ids.json');

// hubs.js(클라 §29) 철도 허브 ↔ 역 이름(공식 역명 — ID 아님·이름 매칭 근거)
// 남춘천: ITX-청춘 다수가 남춘천 착발이라 춘천행 0건일 때의 보조 도착지로만 사용.
const HUB_STATIONS = {
  yongsan: { city: '서울', names: ['용산'] },
  sangbong: { city: '서울', names: ['상봉'] },
  cheongnyangni: { city: '서울', names: ['청량리'] }, // 허브 외 보조 출발지(§29 확장 검토용 · 현재 미노출)
  'chuncheon-station': { city: '강원', names: ['춘천', '남춘천'] },
};

let cache = null; // { cityCodes: {서울:11, 강원:32}, stations: { hubId: [{nm,id}] } }

const kstToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()).replaceAll('-', '');

async function ensureTrainIds() {
  if (cache) return cache;
  try {
    const file = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (file.train) {
      cache = file.train;
      console.log('[tago:train] ID 캐시 파일 재사용');
      return cache;
    }
  } catch {
    /* 캐시 없음 */
  }
  // 1) 도시코드(probe 채택: GetCtyCodeList → citycode/cityname)
  const cities = asItems(await tagoGet(BASE, 'GetCtyCodeList', {}));
  const cityCode = (kw) => {
    const hit = cities.find((c) => String(c.cityname ?? '').includes(kw));
    if (!hit) throw new Error(`도시코드 매칭 실패: ${kw}`);
    console.log(`[tago:train] 도시 매칭 · ${kw} → citycode=${hit.citycode} (${hit.cityname})`);
    return Number(hit.citycode);
  };
  const codes = { 서울: cityCode('서울'), 강원: cityCode('강원') };
  // 2) 역 목록(probe 채택: GetCtyAcctoTrainSttnList → nodeid/nodename) · 도시별 1회
  const byCity = {};
  for (const [nm, cc] of Object.entries(codes)) {
    byCity[nm] = asItems(await tagoGet(BASE, 'GetCtyAcctoTrainSttnList', { cityCode: cc, numOfRows: 300, pageNo: 1 }));
  }
  const stations = {};
  for (const [hubId, { city, names }] of Object.entries(HUB_STATIONS)) {
    const list = byCity[city] ?? [];
    stations[hubId] = names
      .map((want) => {
        const hit = list.find((s) => String(s.nodename ?? '') === want);
        if (hit) {
          console.log(`[tago:train] 역 매칭 · ${hubId} ← nodeid=${hit.nodeid} nodename="${hit.nodename}"`);
          return { nm: String(hit.nodename), id: String(hit.nodeid) };
        }
        console.log(`[tago:train] 역 매칭 실패 · ${hubId} 후보 "${want}"`);
        return null;
      })
      .filter(Boolean);
    if (!stations[hubId].length) throw new Error(`역 매칭 0건: ${hubId}`);
  }
  cache = { cityCodes: codes, stations };
  let file = {};
  try {
    file = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    /* 신규 */
  }
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify({ ...file, train: cache }, null, 2));
  return cache;
}

// probe 샘플 depplandtime="20260721055500"(YYYYMMDDHHMMSS) — 8~12자리에서 HH:MM 추출
const toHHMM = (v) => {
  const s = String(v);
  return s.length >= 12 ? `${s.slice(8, 10)}:${s.slice(10, 12)}` : null;
};

// from/to ∈ HUB_STATIONS 키 · date YYYY-MM-DD(미지정 시 KST 오늘)
async function queryTrain(from, to, date) {
  const ids = await ensureTrainIds();
  const deps = ids.stations[from];
  const arrs = ids.stations[to];
  if (!deps?.length || !arrs?.length) throw new Error(`미지원 허브: ${from}→${to}`);
  const reqDate = date ? date.replaceAll('-', '') : kstToday();
  const rows = [];
  let matchedArr = null;
  for (const arr of arrs) {
    // probe 채택: GetStrtpntAlocFndTrainInfo(depPlaceId, arrPlaceId, depPlandTime=YYYYMMDD)
    const body = await tagoGet(BASE, 'GetStrtpntAlocFndTrainInfo', {
      depPlaceId: deps[0].id,
      arrPlaceId: arr.id,
      depPlandTime: reqDate,
      numOfRows: 60,
      pageNo: 1,
    });
    const items = asItems(body);
    if (items.length) {
      matchedArr = arr;
      for (const it of items) {
        rows.push({
          depTime: toHHMM(it.depplandtime), // probe 응답 필드명 그대로(소문자)
          arrTime: toHHMM(it.arrplandtime),
          trainType: it.traingradename ? String(it.traingradename) : null,
          fare: Number.isFinite(Number(it.adultcharge)) ? Number(it.adultcharge) : null,
        });
      }
      break; // 춘천 우선, 0건이면 남춘천 시도(HUB_STATIONS 순서)
    }
  }
  rows.sort((a, b) => String(a.depTime).localeCompare(String(b.depTime)));
  return {
    source: 'live',
    from: deps[0].nm,
    to: matchedArr ? matchedArr.nm : arrs[0].nm,
    date: reqDate,
    rows: rows.filter((r) => r.depTime && r.arrTime),
  };
}

module.exports = { queryTrain, ensureTrainIds };
