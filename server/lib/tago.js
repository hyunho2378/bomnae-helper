// TAGO 공통 호출기 · 근거: docs/tago/오픈API활용가이드_국토교통부(TAGO)_시외버스정보v1.1.docx
//   Base URL: http://apis.data.go.kr/1613000/SuburbsBusInfo/<오퍼레이션> (문서 "가. API 서비스 개요")
// serviceKey 는 이미 URL 인코딩된 값(문서: "인증키(URL Encode)") — 재인코딩 절대 금지:
//   URLSearchParams 미사용, 쿼리 문자열에 원문 그대로 이어붙인다(이중 인코딩 = 최다 실패 원인).
const TIMEOUT_MS = 8000;

async function tagoGet(base, op, params) {
  const key = process.env.TAGO_SERVICE_KEY;
  if (!key) throw new Error('TAGO_SERVICE_KEY 미설정');
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  // serviceKey 원문 이어붙이기(재인코딩 금지 계약)
  const url = `${base}/${op}?serviceKey=${key}${qs ? `&${qs}` : ''}&_type=json`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ac.signal });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      // 키 미활성·게이트웨이 오류는 XML(OpenAPI_ServiceResponse)로 옴 — 원문 일부를 에러로 전달
      throw new Error(`비JSON 응답: ${text.slice(0, 160)}`);
    }
    const header = json?.response?.header;
    // 문서 "c) 응답 메시지 명세": resultCode 00 = NORMAL SERVICE
    if (header && header.resultCode !== '00' && header.resultCode !== 0) {
      throw new Error(`resultCode ${header.resultCode}: ${header.resultMsg}`);
    }
    return json?.response?.body ?? null;
  } finally {
    clearTimeout(timer);
  }
}

// items.item 이 단건이면 객체, 복수면 배열, 없으면 '' — 전부 배열로 정규화
const asItems = (body) => {
  const item = body?.items?.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
};

module.exports = { tagoGet, asItems, TIMEOUT_MS };
