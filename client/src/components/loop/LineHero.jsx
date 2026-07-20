// 라인 히어로 · v3.1 rev(IA §2.5.1): 라인 컬러 소프트 면(라인 컬러 10% 틴트 · 소면적 고밀도
// 원칙 준수) + 캐릭터 이미지(콘텐츠로만) + 라인명(Kanit Bold) + 소요·정류장 수·가격.
// LineDetail 좌측 컬럼 안 카드(그리드 레이아웃 · 풀블리드 아님), 무보더(DESIGN §7).
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 언어별 포맷 문자열 겹침 렌더용(PATTERNS §1·§18) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';
import th from '../../i18n/th';

const DICTS = { en, ko, th };
const LANGS = ['en', 'ko', 'th'];

const fmtDur = (min, dict) =>
  `${Math.floor(min / 60)}${dict.loop.detail.hoursUnit} ${min % 60}${dict.loop.detail.minutesUnit}`;

// 라인 컬러 정적 클래스 매핑(토큰 클래스만 · HEX 직입력 금지)
// 소프트 면 = 라인 컬러 10% 틴트(v3.1 아이콘 배지 "소프트 배경"과 동일 규칙)
const SOFT = {
  potato: 'bg-surface',
  dakgalbi: 'bg-surface',
  lake: 'bg-surface',
};
const STRIPE = {
  potato: 'bg-yellow',
  dakgalbi: 'bg-spice',
  lake: 'bg-primary',
};

export default function LineHero({ line, stopsCount }) {
  const { lang } = useLang();
  const name = lang === 'ko' ? line.name_ko : line.name_en; // img alt 전용 · th는 en 폴백

  return (
    <header className={`overflow-hidden rounded-xl p-24 lg:p-32 ${SOFT[line.id]}`}>
      <div className="flex flex-col gap-24 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-16">
          {/* 라인명 · 데이터 필드(th 없음)는 en 폴백: lang!=='ko'일 때 en 스팬(v3.1 규칙) */}
          <h1 className="grid font-display text-h1 font-bold tracking-display">
            <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>{line.name_en}</span>
            <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{line.name_ko}</span>
          </h1>
          <span aria-hidden="true" className={`h-8 w-64 rounded-pill ${STRIPE[line.id]}`} />
          <dl className="flex flex-wrap gap-x-32 gap-y-12">
            <div className="flex flex-col gap-4">
              <LangSwap
                k="loop.detail.durationLabel"
                as="dt"
                className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
              />
              {/* 소요 표기 · 사전 유래 포맷은 3언어 겹침 렌더(시프트 0) */}
              <dd className="grid font-display text-h3 font-semibold">
                {LANGS.map((code) => (
                  <span
                    key={code}
                    aria-hidden={lang !== code}
                    className={`col-start-1 row-start-1 ${lang === code ? '' : 'invisible'}`}
                  >
                    {fmtDur(line.duration_min, DICTS[code])}
                  </span>
                ))}
              </dd>
            </div>
            <div className="flex flex-col gap-4">
              <LangSwap
                k="loop.detail.stopsLabel"
                as="dt"
                className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
              />
              <dd className="font-display text-h3 font-semibold">{stopsCount}</dd>
            </div>
            <div className="flex flex-col gap-4">
              <LangSwap
                k="loop.detail.priceLabel"
                as="dt"
                className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
              />
              <dd className="flex items-baseline gap-8">
                {/* 가격 DRAFT · 5일차 BM 검토 확정(IA §4) */}
                <span className="font-display text-h3 font-semibold">
                  {'₩'}
                  {line.price_adult.toLocaleString('en-US')}
                </span>
                <LangSwap
                  k="loop.detail.priceUnit"
                  className="text-small font-regular text-inkSec"
                />
              </dd>
            </div>
          </dl>
        </div>
        {/* 캐릭터는 콘텐츠 이미지로만(UI 팔레트 사용 금지 · DESIGN §1) */}
        <img
          src={line.character_img}
          alt={name}
          loading="lazy"
          className="h-128 w-128 shrink-0 rounded-lg bg-white object-cover"
        />
      </div>
    </header>
  );
}
