// EN/KR 세그먼트 토글 — 44px 타깃(COMPONENTS A3). 컨텍스트 색 상속(navy 푸터 대응).
import { useLang } from '../../i18n/LangContext';

export default function LangToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className="inline-flex items-center rounded-pill border border-line p-4"
    >
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
