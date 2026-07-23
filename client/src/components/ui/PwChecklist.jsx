// [V10] 비밀번호 규칙 실시간 체크리스트 · LoginGate(회원가입)·Profile(비밀번호 변경) 공유.
//   충족 = green + Check, 미충족 = inkMeta + 빈 점. 규칙은 lib/authRules(서버와 동일).
import { Check } from 'lucide-react';
import { PW_RULES } from '../../lib/authRules';
import LangSwap from '../../i18n/LangSwap';

export default function PwChecklist({ pin }) {
  return (
    <ul className="flex flex-col gap-4">
      {PW_RULES.map(({ key, test }) => {
        const ok = test(pin);
        return (
          <li key={key} className="flex items-center gap-8">
            {ok ? (
              <Check size={14} aria-hidden="true" className="shrink-0 text-green" />
            ) : (
              <span
                aria-hidden="true"
                className="h-14 w-14 shrink-0 rounded-pill"
                style={{ boxShadow: 'inset 0 0 0 1.5px rgba(20,23,46,0.25)' }}
              />
            )}
            <LangSwap
              k={`common.loginGate.${key}`}
              className={`text-caption font-medium ${ok ? 'text-green' : 'text-inkMeta'}`}
            />
          </li>
        );
      })}
    </ul>
  );
}
