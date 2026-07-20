// PATTERNS §1 기준 구현 그대로 — 레이아웃 시프트 0 이중언어. 임의 변형 금지.
import { useLang } from './LangContext';
import en from './en';
import ko from './ko';

const pick = (dict, key) => key.split('.').reduce((o, k) => o?.[k], dict);

export default function LangSwap({ k, as: Tag = 'span', className = '' }) {
  const { lang } = useLang();
  const textEn = pick(en, k) ?? k;
  const textKo = pick(ko, k) ?? k;
  return (
    <Tag className={`grid ${className}`}>
      <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>{textEn}</span>
      <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{textKo}</span>
    </Tag>
  );
}
