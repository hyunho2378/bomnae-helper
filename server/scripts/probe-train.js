// probe-train.js · 열차 API 실호출 검증(지시서 [열차] 절차).
// 활용가이드 문서를 구할 수 없어 오퍼레이션명을 기억으로 확정하지 않는다 —
// 시외버스 가이드(docs/tago/...시외버스정보v1.1.docx)의 네이밍 규칙과 대칭인 후보를
// 순차 실호출해 200 + resultCode 00 이 확인된 조합만 채택한다(성공/실패·응답 샘플 콘솔 출력).
// serviceKey 재인코딩 금지 동일 적용(lib/tago.js 경유).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { tagoGet, asItems } = require('../lib/tago');

const SERVICES = ['TrainInfoService', 'TrainInfo'];
// 대칭 유추 후보(버스: GetCtyCodeList·GetSuberbsBusTrminlList·GetStrtpntAlocFndSuberbsBusInfo)
// 대문자 Get / 소문자 get 두 표기 모두 시도한다(버스 문서는 대문자 Get — 서비스별 상이 가능).
const OPS = [
  { role: 'cityCodes', names: ['GetCtyCodeList', 'getCtyCodeList'], params: {} },
  {
    role: 'stationList',
    names: ['GetCtyAcctoTrainSttnList', 'getCtyAcctoTrainSttnList'],
    params: { numOfRows: 10, pageNo: 1 }, // cityCode는 cityCodes 성공 후 실값 주입
  },
  { role: 'vehicleKinds', names: ['GetVhcleKndList', 'getVhcleKndList'], params: {} },
  {
    role: 'schedule',
    names: ['GetStrtpntAlocFndTrainInfo', 'getStrtpntAlocFndTrainInfo'],
    params: {}, // depPlaceId·arrPlaceId·depPlandTime은 stationList 성공 후 실값 주입
  },
];

const short = (o) => (o === undefined ? 'undefined' : JSON.stringify(o)).slice(0, 240);

async function probe() {
  const adopted = { base: null, ops: {} };
  for (const svc of SERVICES) {
    const base = `http://apis.data.go.kr/1613000/${svc}`;
    console.log(`\n===== 서비스 후보: ${base} =====`);
    // 1) cityCodes
    let cityCode = null;
    for (const name of OPS[0].names) {
      try {
        const body = await tagoGet(base, name, {});
        const items = asItems(body);
        if (!items.length) throw new Error('items 0건');
        console.log(`  [성공] ${name} · items ${items.length} · 샘플: ${short(items[0])}`);
        adopted.base = base;
        adopted.ops.cityCodes = name;
        // 춘천 도시코드 탐색(이름 매칭 로그)
        // 도시코드는 광역 단위(서울특별시=11 등) — 춘천역은 강원도 하위 역 목록에서 찾는다
        const chuncheon = items.find((i) => String(i.cityname ?? i.cityName ?? '').includes('강원'));
        const seoulish = items.find((i) => String(i.cityname ?? i.cityName ?? '').includes('서울'));
        console.log(`  [매칭] 강원(춘천권): ${short(chuncheon)} · 서울: ${short(seoulish)}`);
        cityCode = { chuncheon, seoulish };
        break;
      } catch (e) {
        console.log(`  [실패] ${name} · ${e.message.slice(0, 140)}`);
      }
    }
    if (!adopted.base) continue; // 이 서비스 경로 자체가 무효 — 다음 후보
    // 2) stationList (춘천 도시코드로)
    const codeOf = (c) => c && Number(c.citycode ?? c.cityCode);
    let stations = {};
    for (const name of OPS[1].names) {
      try {
        const cc = codeOf(cityCode?.chuncheon);
        if (!cc) throw new Error('춘천 도시코드 미확보');
        const body = await tagoGet(base, name, { cityCode: cc, numOfRows: 50, pageNo: 1 });
        const items = asItems(body);
        if (!items.length) throw new Error('items 0건');
        console.log(`  [성공] ${name}(cityCode=${cc}) · items ${items.length} · 샘플: ${short(items[0])}`);
        adopted.ops.stationList = name;
        for (const it of items) {
          const nm = String(it.nodename ?? it.nodeName ?? '');
          if (nm) stations[nm] = String(it.nodeid ?? it.nodeId ?? '');
        }
        console.log(`  [춘천권 역 목록] ${Object.keys(stations).join(', ')}`);
        // 서울권 역(용산·상봉·청량리)도 확보
        const scc = codeOf(cityCode?.seoulish);
        if (scc) {
          const b2 = await tagoGet(base, name, { cityCode: scc, numOfRows: 200, pageNo: 1 });
          for (const it of asItems(b2)) {
            const nm = String(it.nodename ?? it.nodeName ?? '');
            if (['용산', '상봉', '청량리'].some((k) => nm.includes(k))) {
              stations[nm] = String(it.nodeid ?? it.nodeId ?? '');
              console.log(`  [매칭] 서울권 역 · ${nm} = ${stations[nm]}`);
            }
          }
        }
        break;
      } catch (e) {
        console.log(`  [실패] ${name} · ${e.message.slice(0, 140)}`);
      }
    }
    // 3) schedule (청량리→춘천 · 오늘)
    const dep = Object.entries(stations).find(([nm]) => nm.includes('청량리') || nm.includes('용산') || nm.includes('상봉'));
    const arr = Object.entries(stations).find(([nm]) => nm === '춘천' || nm.includes('춘천'));
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()).replaceAll('-', '');
    for (const name of OPS[3].names) {
      try {
        if (!dep || !arr) throw new Error('출·도착 역 ID 미확보');
        const body = await tagoGet(base, name, {
          depPlaceId: dep[1],
          arrPlaceId: arr[1],
          depPlandTime: today,
          numOfRows: 30,
          pageNo: 1,
        });
        const items = asItems(body);
        console.log(`  [성공] ${name}(${dep[0]}→${arr[0]} ${today}) · items ${items.length} · 샘플: ${short(items[0] ?? {})}`);
        adopted.ops.schedule = name;
        adopted.sample = items[0] ?? null;
        adopted.stations = { dep: { nm: dep[0], id: dep[1] }, arr: { nm: arr[0], id: arr[1] } };
        break;
      } catch (e) {
        console.log(`  [실패] ${name} · ${e.message.slice(0, 140)}`);
      }
    }
    if (adopted.ops.schedule) break; // 완주 — 추가 서비스 후보 불필요
  }
  console.log('\n===== 채택 결과 =====');
  console.log(JSON.stringify(adopted, null, 2).slice(0, 1600));
  if (!adopted.ops.schedule) {
    console.log('\n[결론] 실호출 검증 실패 — 오퍼레이션 미확정. /api/transit/train 은 fallback 유지.');
    process.exitCode = 2;
  }
}

probe();
