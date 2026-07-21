// PayMethodGrid · PATTERNS §42 결제 수단 그리드 (존 C5 신설).
// lg 4열×2행 카드(white · shadow.sm · radius lg · pressable) · 선택 = primary 2px 링(box-shadow).
// 로고 <img src="/pay/*.svg"> 8개 고정 파일명 — 파일이 아직 없으므로 onError 시 텍스트 라벨로
//   교체(깨진 이미지 0 · §42 필수). role=radio 그룹(단일 선택).
import { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import { PAY_METHODS } from './payMethods';

export default function PayMethodGrid({ value, onChange }) {
  const { t } = useLang();
  // 로고 로드 실패 수단 id 집합 · 텍스트 라벨 폴백(§42)
  const [failed, setFailed] = useState({});

  return (
    <div role="radiogroup" aria-label={t('gts.pay.title')} className="grid grid-cols-2 gap-12 lg:grid-cols-4">
      {PAY_METHODS.map((method) => {
        const selected = value === method.id;
        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(method.id)}
            className={`pressable flex min-h-64 flex-col items-center justify-center gap-8 rounded-lg bg-white p-16 shadow-sm ${
              selected ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
          >
            {failed[method.id] ? (
              <span className="text-body font-semibold">{method.label}</span>
            ) : (
              <img
                src={method.file}
                alt={method.label}
                // 로고 높이 32px = 아이콘 5단계 스케일 준용(h-32 토큰 클래스)
                className="h-32 w-auto object-contain"
                onError={() => setFailed((f) => ({ ...f, [method.id]: true }))}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
