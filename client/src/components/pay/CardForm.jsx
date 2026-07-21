// CardForm · PATTERNS §42 카드 폼 (존 C5 신설) — 검증 없음, 빈 제출 허용(프로토타입).
// 자동 포맷만 수행: 카드번호 #### 4그룹 · 만료 MM/YY · CVC 숫자 4자 상한.
// 마운트 시 확장 연출: grid-rows 0fr→1fr · 220ms(§42 명세값) easeOut(tokens) ·
//   reduced-motion은 전역 룰로 즉시 표시. 폼 하단 caption 1줄 = 프로토타입 고지(Terms §2 취지 키).
import { useEffect, useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import { motion } from '../../tokens';

// #### 4그룹 자동 포맷(§42) · 숫자 외 제거 후 16자 상한
const formatCardNumber = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

// MM/YY 자동 포맷(§42) · 숫자 4자 상한
const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function Field({ labelKey, value, onChange, placeholder, inputMode, className = '' }) {
  return (
    <label className={`flex flex-col gap-8 ${className}`}>
      <LangSwap k={labelKey} className="text-small font-semibold" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        className="h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

export default function CardForm() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' });

  // 마운트 후 1프레임 뒤 확장 시작(0fr → 1fr)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const set = (key, format = (v) => v) => (e) =>
    setCard((c) => ({ ...c, [key]: format(e.target.value) }));

  return (
    <div
      className="grid"
      // §42 명세값 220ms 확장 · easeOut(tokens.motion)
      style={{ gridTemplateRows: open ? '1fr' : '0fr', transition: `grid-template-rows 220ms ${motion.easeOut}` }}
    >
      <div className="overflow-hidden">
        <div className="flex flex-col gap-16 pt-8">
          <div className="grid gap-16 md:grid-cols-2">
            <Field
              labelKey="gts.pay.cardNumber"
              value={card.number}
              onChange={set('number', formatCardNumber)}
              inputMode="numeric"
              className="md:col-span-2"
            />
            <Field
              labelKey="gts.pay.expiry"
              value={card.expiry}
              onChange={set('expiry', formatExpiry)}
              placeholder={t('gts.pay.expiryPlaceholder')}
              inputMode="numeric"
            />
            <Field
              labelKey="gts.pay.cvc"
              value={card.cvc}
              onChange={set('cvc', (v) => v.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
            />
            <Field
              labelKey="gts.pay.nameOnCard"
              value={card.name}
              onChange={set('name')}
              className="md:col-span-2"
            />
          </div>
          {/* §42 프로토타입 고지 · caption 1줄(Terms §2 취지 문구 키 재사용) */}
          <LangSwap k="gts.checkout.prototypeNotice" as="p" className="text-caption font-medium text-inkMeta" />
        </div>
      </div>
    </div>
  );
}
