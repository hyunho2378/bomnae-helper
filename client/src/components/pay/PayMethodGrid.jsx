// PayMethodGrid · PATTERNS §42 결제 수단 그리드 (존 C5 신설).
// lg 4열×2행 카드(white · shadow.sm · radius lg · pressable) · 선택 = primary 2px 링(box-shadow).
// 로고 <img src="/pay/*.svg"> 8개 고정 파일명 — 파일이 아직 없으므로 onError 시 텍스트 라벨로
//   교체(깨진 이미지 0 · §42 필수). role=radio 그룹(단일 선택).
import { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { PAY_METHODS } from './payMethods';

// 로고별 시각 배율 · SVG마다 내부 여백·종횡비가 달라 같은 h-80으로 렌더해도 시각 크기가 다르다.
//   컨테이너(카드)는 불변, 이미지 스케일만 보정. 이후 다른 로고도 여기서 배율만 추가하면 된다(기본 1).
const LOGO_SCALE = {
  alipay: 1.9,
  paypal: 1.4,
};

export default function PayMethodGrid({ value, onChange }) {
  const { t } = useLang();
  // [H2-15] 로고 폴백 단계: (svg) → 'png' → 'text' · 깨진 이미지 아이콘 노출 금지(§42)
  const [stage, setStage] = useState({});
  const fail = (id) =>
    setStage((s) => ({ ...s, [id]: s[id] === 'png' ? 'text' : 'png' }));

  return (
    <div role="radiogroup" aria-label={t('gts.pay.title')} className="grid grid-cols-2 gap-24 md:grid-cols-3 lg:grid-cols-4">
      {PAY_METHODS.map((method) => {
        const selected = value === method.id;
        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(method.id)}
            className={`pressable flex min-h-96 flex-col items-center justify-center gap-8 rounded-lg bg-white p-20 shadow-sm ${
              selected ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
          >
            {stage[method.id] === 'text' ? (
              <span className="text-h3 font-semibold">{method.label}</span>
            ) : (
              <img
                src={stage[method.id] === 'png' ? method.file.replace(/\.svg$/, '.png') : method.file}
                alt={method.label}
                // [V18] 로고 2.5배(h-32=32px → h-80=80px) · 카드 gap/패딩도 비례 상향(gap-24·p-20·min-h-96)
                // 로고별 시각 배율(LOGO_SCALE) · 컨테이너·레이아웃 박스는 h-80 그대로, transform으로 시각 크기만 보정
                className="h-80 w-auto object-contain"
                style={LOGO_SCALE[method.id] ? { transform: `scale(${LOGO_SCALE[method.id]})` } : undefined}
                onError={() => fail(method.id)}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
