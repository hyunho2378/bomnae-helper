// [V12] 통화 컨텍스트 · 언어 설정과 동일한 방식(React state, in-memory · localStorage/서버세션 아님)으로 보관.
//   기본값은 언어별 매핑(en→USD, th→THB, ko→KRW=환산 없음) · 사용자가 드롭다운으로 명시 선택 시 그 값 우선.
//   환율은 서버 GET /api/rates(6시간 캐시)에서 1회 로드 · 실패/미제공 시 rates=null → 환산을 숨긴다(원화만).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLang } from '../i18n/LangContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export const CURRENCY_SYMBOL = { KRW: '₩', USD: '$', EUR: '€', THB: '฿', JPY: '¥', SGD: 'S$' };
// 드롭다운 순서 · KRW 먼저(원화 = 환산 없음)
export const CURRENCY_ORDER = ['KRW', 'USD', 'EUR', 'THB', 'JPY', 'SGD'];
const DEFAULT_BY_LANG = { en: 'USD', th: 'THB', ko: 'KRW' };

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const { lang } = useLang();
  const [rates, setRates] = useState(null); // { USD:.., EUR:.. } (1 KRW 당 값) 또는 null
  const [picked, setPicked] = useState(null); // 사용자 명시 선택(null이면 언어 기본 추종)

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/rates`)
      .then((r) => r.json())
      .then((d) => {
        if (alive) setRates(d && d.rates ? d.rates : null);
      })
      .catch(() => {
        if (alive) setRates(null); // 실패 = 환산 숨김(화면 안 깨짐)
      });
    return () => {
      alive = false;
    };
  }, []);

  const currency = picked ?? DEFAULT_BY_LANG[lang] ?? 'USD';

  const value = useMemo(
    () => ({
      currency,
      setCurrency: setPicked,
      ratesReady: !!rates,
      // 환산 결과 {amount, symbol, currency} 또는 null(KRW·미선택·환율없음)
      convert: (krw) => {
        if (currency === 'KRW' || krw == null || !rates) return null;
        const rate = rates[currency];
        if (!rate) return null;
        return { amount: Math.round(krw * rate), symbol: CURRENCY_SYMBOL[currency], currency };
      },
    }),
    [currency, rates],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
