// 정류장 스트립 · IA §2.5 블록 2: 수직 노선도(라인 컬러 세로선 + 정류장 노드).
// 정류장마다 사진·이름(EN/KR 병기)·체류 시간·선주문 대행 문구.
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 언어별 포맷 문자열 겹침 렌더용(PATTERNS §1) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';

// 라인 컬러 정적 클래스 매핑(토큰 클래스만)
const STRIPE = {
  potato: 'bg-yellow',
  dakgalbi: 'bg-spice',
  lake: 'bg-primary',
};
// v3.1 무보더 스윕: 노드 링은 border 대신 ring(box-shadow)으로 표현
const NODE = {
  potato: 'ring-yellow',
  dakgalbi: 'ring-spice',
  lake: 'ring-primary',
};

export default function StopStrip({ lineId, stops }) {
  const { lang } = useLang();

  return (
    <ol className="flex flex-col">
      {stops.map((stop, i) => (
        <li key={stop.id} className="flex gap-16 lg:gap-24">
          {/* 수직 노선도 · 노드(라인 컬러 링) + 세로선 */}
          <div aria-hidden="true" className="flex w-16 shrink-0 flex-col items-center">
            <span className={`h-16 w-16 shrink-0 rounded-pill bg-white ring-4 ring-inset ${NODE[lineId]}`} />
            {i < stops.length - 1 && <span className={`w-4 flex-1 ${STRIPE[lineId]}`} />}
          </div>
          <div
            className={`flex min-w-0 flex-1 flex-col gap-12 ${
              i < stops.length - 1 ? 'pb-40' : ''
            }`}
          >
            <div className="flex flex-wrap items-baseline gap-x-12 gap-y-4">
              <h3 className="font-display text-h3 font-semibold">{stop.name_en}</h3>
              <span className="text-small font-light text-inkSec">{stop.name_ko}</span>
              {/* 체류 시간 · 언어별 단위 폭이 달라 겹침 렌더(시프트 0) */}
              <span className="grid font-display text-caption font-medium text-inkMeta">
                <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>{stop.stay_min} {en.loop.detail.stayUnit}</span>
                <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{stop.stay_min} {ko.loop.detail.stayUnit}</span>
              </span>
            </div>
            <img
              src={stop.photo}
              alt={lang === 'ko' ? stop.name_ko : stop.name_en}
              loading="lazy"
              className="aspect-video w-full max-w-dialog rounded-md bg-surface object-cover"
            />
            <div className="flex flex-col gap-4">
              <LangSwap
                k="loop.detail.preorderTag"
                as="p"
                className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
              />
              {/* 선주문 대행 문구 · 데이터 본문(시프트 허용 영역, PATTERNS §1) */}
              <p className="text-body">{lang === 'ko' ? stop.preorder_ko : stop.preorder_en}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
