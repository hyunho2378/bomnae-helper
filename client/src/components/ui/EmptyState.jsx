// 빈 상태 — DESIGN §7·§9. unDraw 단색 일러스트 + 한 문장 + 행동 CTA.
// 위치 제한: 빈 검색 결과 / 404·500 / 로그인 게이트.
import { Link } from 'react-router-dom';
import LangSwap from '../../i18n/LangSwap';
import Button from './Button';

export default function EmptyState({ illustration, titleKey, bodyKey, cta }) {
  return (
    <div className="flex flex-col items-center gap-16 py-64 text-center">
      {/* PLACEHOLDER — unDraw 단색(primary) 재컬러 SVG 저장 대기 (DESIGN §9) */}
      <img
        src={`/images/illustrations/${illustration}`}
        alt=""
        loading="lazy"
        className="w-full max-w-dialog"
      />
      <LangSwap k={titleKey} as="h2" className="text-h2 font-semibold" />
      <LangSwap k={bodyKey} as="p" className="text-inkSec" />
      {cta && (
        <Button as={Link} to={cta.to}>
          <LangSwap k={cta.labelKey} />
        </Button>
      )}
    </div>
  );
}
