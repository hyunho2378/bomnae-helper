// DEPRECATED(v3.1) · LangMenu(드롭다운)로 대체됨. 어디서도 사용하지 말 것.
// 파일은 명세(COMPONENTS 증분 존 A행)에 따라 삭제하지 않고 보존만 한다.
import { useLang } from '../../i18n/LangContext';

export default function LangToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <div role="group" aria-label={t('common.language')} className="inline-flex items-center rounded-pill p-4">
      {['en', 'ko'].map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
          className={`inline-flex min-h-44 min-w-44 items-center justify-center rounded-pill px-12 text-caption font-medium transition-colors duration-fast ${
            lang === code ? 'bg-primary text-white' : 'text-inherit'
          }`}
        >
          {t(`common.lang.${code}`)}
        </button>
      ))}
    </div>
  );
}
