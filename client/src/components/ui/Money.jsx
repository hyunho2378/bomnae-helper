// [V12] 금액 표시 · 원화가 항상 주 금액, 환산은 보조. 예: "₩40,000 (about $29)".
//   괄호 안 = 소수점 없이 반올림 + "about"(3언어)로 근사임을 명시. 원화 통화/환율 없음이면 원화만.
import { useLang } from '../../i18n/LangContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function Money({ krw, className = '', convClassName = 'text-inkMeta' }) {
  const { t } = useLang();
  const { convert } = useCurrency();
  const krwStr = `₩${Number(krw ?? 0).toLocaleString('en-US')}`;
  const c = convert(krw);
  return (
    <span className={className}>
      {krwStr}
      {c && (
        <span className={`whitespace-nowrap font-medium ${convClassName}`}>
          {` (${t('common.money.about')} ${c.symbol}${c.amount.toLocaleString('en-US')})`}
        </span>
      )}
    </span>
  );
}
