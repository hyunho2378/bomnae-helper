// 라인 히어로 — IA §2.5 블록 1: 라인 컬러 면 스트라이프 + 캐릭터 이미지(콘텐츠로만)
// + 라인명(Kanit Bold) + 소요·정류장 수·가격. 풀블리드 허용(히어로 — DESIGN §5).
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
import Container from '../layout/Container';

// 라인 컬러 정적 클래스 매핑(토큰 클래스만 — HEX 직입력 금지)
const STRIPE = {
  potato: 'bg-yellow',
  dakgalbi: 'bg-spice',
  lake: 'bg-primary',
};

export default function LineHero({ line, stopsCount }) {
  const { lang, t } = useLang();
  const name = lang === 'ko' ? line.name_ko : line.name_en;
  const hours = Math.floor(line.duration_min / 60);
  const minutes = line.duration_min % 60;

  return (
    <header className="border-b border-line">
      {/* 라인 컬러 면 — 텍스트 없는 컬러 스트라이프(소면적 고밀도, DESIGN §2) */}
      <div aria-hidden="true" className={`h-12 ${STRIPE[line.id]}`} />
      <Container>
        <div className="flex flex-col gap-32 pb-48 pt-48 lg:flex-row lg:items-center lg:justify-between lg:pt-96">
          <div className="flex min-w-0 flex-col gap-16">
            <h1 className="font-display text-h1 font-bold tracking-display">{name}</h1>
            <span aria-hidden="true" className={`h-8 w-64 rounded-pill ${STRIPE[line.id]}`} />
            <dl className="flex flex-wrap gap-x-32 gap-y-12">
              <div className="flex flex-col gap-4">
                <LangSwap
                  k="loop.detail.durationLabel"
                  as="dt"
                  className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
                />
                <dd className="font-display text-h3 font-semibold">
                  {hours}
                  {t('loop.detail.hoursUnit')} {minutes}
                  {t('loop.detail.minutesUnit')}
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
                  {/* 가격 DRAFT — 5일차 BM 검토 확정(IA §4) */}
                  <span className="font-display text-h3 font-semibold">
                    {'₩'}
                    {line.price_adult.toLocaleString('en-US')}
                  </span>
                  <LangSwap
                    k="loop.detail.priceUnit"
                    className="text-small font-light text-inkSec"
                  />
                </dd>
              </div>
            </dl>
          </div>
          {/* 캐릭터는 콘텐츠 이미지로만(UI 팔레트 사용 금지 — DESIGN §1) */}
          <img
            src={line.character_img}
            alt={name}
            loading="lazy"
            className="h-128 w-128 shrink-0 rounded-lg bg-surface object-cover"
          />
        </div>
      </Container>
    </header>
  );
}
