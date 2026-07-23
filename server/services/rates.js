// [V12] 환율 캐시 · open.er-api.com(KRW 기준, 키 불필요)을 6시간마다 갱신해 메모리에 캐시.
//   호출 실패 시 마지막 캐시 유지 · 캐시가 아예 없으면 null(클라가 환산을 숨긴다 — 화면 안 깨짐).
//   rates[X] = 1 KRW 당 X 통화 값 → 환산액 = krw * rates[X].
const SUPPORTED = ['USD', 'EUR', 'THB', 'JPY', 'SGD'];
const SOURCE_URL = 'https://open.er-api.com/v6/latest/KRW';
const REFRESH_MS = 6 * 60 * 60 * 1000; // 6시간

let cache = null; // { base:'KRW', rates:{USD..}, updatedAt }

async function fetchRates() {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.result !== 'success' || !data.rates) throw new Error('bad payload');
  const rates = {};
  for (const c of SUPPORTED) {
    if (typeof data.rates[c] === 'number') rates[c] = data.rates[c];
  }
  if (!Object.keys(rates).length) throw new Error('no supported currencies');
  cache = { base: 'KRW', rates, updatedAt: new Date().toISOString() };
  return cache;
}

async function refresh() {
  try {
    await fetchRates();
    console.log('[rates] 갱신 완료 ·', cache.updatedAt, '·', Object.keys(cache.rates).join(','));
  } catch (e) {
    // 실패해도 서버는 산다 — 마지막 캐시 유지(없으면 계속 null)
    console.warn('[rates] 갱신 실패(마지막 캐시 유지):', e.message);
  }
}

// 기동 시 1회 즉시 + 6시간 간격(unref로 프로세스 종료를 막지 않음)
function startRatesCache() {
  refresh();
  const timer = setInterval(refresh, REFRESH_MS);
  timer.unref?.();
}

const getRates = () => cache;

module.exports = { startRatesCache, getRates, SUPPORTED };
