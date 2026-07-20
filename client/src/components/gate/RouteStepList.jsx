// 단계별 리스트 · COMPONENTS B: props {legs}. leg = 사진 1장 + 방향 문장 + 소요.
// 수직 타임라인은 라인 컬러가 아니라 primary(COMPONENTS B 명시).
// 방향 문장은 데이터 장문 텍스트 · 직접 렌더(시프트 허용 영역, PATTERNS §1).
import { useLang } from '../../i18n/LangContext';

const fmtDuration = (min, t) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h}${t('common.units.h')}` : null, m ? `${m}${t('common.units.m')}` : null]
    .filter(Boolean)
    .join(' ');
};

export default function RouteStepList({ legs }) {
  const { lang, t } = useLang();

  return (
    <ol className="flex flex-col">
      {legs.map((leg, i) => (
        <li key={leg.id} className="flex gap-16">
          {/* 수직 타임라인 · primary 노드 + 연결선 */}
          <div aria-hidden="true" className="flex flex-col items-center">
            <span className="mt-4 h-12 w-12 shrink-0 rounded-pill bg-primary" />
            {i < legs.length - 1 && <span className="w-px flex-1 bg-primary" />}
          </div>
          <div className="flex flex-1 flex-col gap-16 pb-32 sm:flex-row">
            {/* PLACEHOLDER · 현장 촬영 교체(data/gateRoutes.js photo). 인접 문장이 내용을
                전달하는 보조 이미지라 alt는 빈 값(장식 처리). aspect 고정 + lazy(DESIGN §12). */}
            <img
              src={leg.photo}
              alt=""
              loading="lazy"
              className="aspect-video w-full rounded-sm bg-surface object-cover sm:w-1/3"
            />
            <div className="flex flex-col gap-8">
              <p className="text-body">{lang === 'ko' ? leg.dir_ko : leg.dir_en}</p>
              <span className="font-display text-small font-semibold text-inkSec">
                {fmtDuration(leg.duration_min, t)}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
