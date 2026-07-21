// 데이터 필드 3언어 겹침 렌더(PATTERNS §1·§18 · 시프트 0) · venues의 name/oneLine 전용.
// LangSwap은 사전 키 전용이라 데이터 객체({en,ko,th})용 헬퍼를 존 C4 디렉토리에 둔다.
// th 미존재 필드는 en 폴백(v3.1 규칙).
import { useLang } from '../../i18n/LangContext';

const LANGS = ['en', 'ko', 'th'];

export default function TriText({ text, className = '' }) {
  const { lang } = useLang();
  return (
    <span className={`grid ${className}`}>
      {LANGS.map((code) => (
        <span
          key={code}
          aria-hidden={lang !== code}
          className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
        >
          {text[code] ?? text.en}
        </span>
      ))}
    </span>
  );
}
