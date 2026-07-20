import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import en from './en';
import ko from './ko';

// 언어 상태는 in-memory Context — 웹스토리지 금지(DESIGN §13). 기본 EN.
const dicts = { en, ko };
const LangContext = createContext(null);

const pick = (dict, key) => key.split('.').reduce((o, k) => o?.[k], dict);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  // t: 키 미존재 시 키 문자열 반환 + console.warn (COMPONENTS A1)
  const t = useCallback(
    (key) => {
      const value = pick(dicts[lang], key);
      if (typeof value !== 'string') {
        console.warn(`[i18n] missing key: ${key}`);
        return key;
      }
      return value;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
