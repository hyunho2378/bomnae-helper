// 인원 스테퍼 · COMPONENTS A4. IconButton(-,+) + 숫자 Kanit 600.
// 경계값은 클램프로 처리(IconButton 계약에 disabled 없음).
import { Minus, Plus } from 'lucide-react';
import LangSwap from '../../i18n/LangSwap';
import IconButton from './IconButton';

export default function Stepper({ value, min = 0, max = 12, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-16">
      <LangSwap k={label} className="text-small font-medium" />
      <div className="flex items-center gap-8">
        <IconButton
          icon={Minus}
          label="common.decrease"
          size={20}
          onClick={() => onChange(Math.max(min, value - 1))}
        />
        <span className="min-w-44 text-center font-display text-h3 font-semibold" aria-live="polite">
          {value}
        </span>
        <IconButton
          icon={Plus}
          label="common.increase"
          size={20}
          onClick={() => onChange(Math.min(max, value + 1))}
        />
      </div>
    </div>
  );
}
