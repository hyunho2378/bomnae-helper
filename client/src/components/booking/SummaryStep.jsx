// 예약 Step 3 · 요약(IA §2.6): 라인·회차·미팅포인트·동승 인원·호스트·선주문 안내·합계.
import { useLang } from '../../i18n/LangContext';
import LangSwap from '../../i18n/LangSwap';
// 숫자 삽입 문장 겹침 렌더용(PATTERNS §1) · 시프트 0
import en from '../../i18n/en';
import ko from '../../i18n/ko';

// 라인 컬러 정적 클래스 매핑(토큰 클래스만)
const DOT = {
  potato: 'bg-yellow',
  dakgalbi: 'bg-spice',
  lake: 'bg-primary',
};

function Row({ labelKey, children }) {
  return (
    <div className="flex items-baseline justify-between gap-16 border-b border-line py-12 last:border-b-0">
      <LangSwap
        k={labelKey}
        as="dt"
        className="shrink-0 text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
      />
      <dd className="min-w-0 text-right text-body">{children}</dd>
    </div>
  );
}

export default function SummaryStep({ line, draft, departure, meetingPoint, total }) {
  const { lang } = useLang();

  return (
    <div className="flex flex-col gap-24">
      <dl className="flex flex-col rounded-md border border-line px-20 py-8">
        <Row labelKey="booking.summary.line">
          <span className="flex items-center justify-end gap-8">
            <span aria-hidden="true" className={`h-8 w-8 rounded-pill ${DOT[line.id]}`} />
            {/* 라인명 EN/KR 겹침(시프트 0) */}
            <span className="grid font-semibold">
              <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>{line.name_en}</span>
              <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{line.name_ko}</span>
            </span>
          </span>
        </Row>
        <Row labelKey="booking.summary.departure">
          <span className="font-display font-semibold">
            {draft.date} · {draft.time}
          </span>
        </Row>
        <Row labelKey="booking.summary.meeting">
          {/* 미팅포인트 고정(IA §5) · MVP는 첫 번째 포인트, PLACEHOLDER 좌표(stops.js). EN/KR 겹침(시프트 0) */}
          <span className="grid">
            <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>{meetingPoint.name_en}</span>
            <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{meetingPoint.name_ko}</span>
          </span>
        </Row>
        <Row labelKey="booking.summary.party">
          <span className="flex items-baseline justify-end gap-8">
            <LangSwap k="booking.adults" className="text-small text-inkSec" />
            <span className="font-display font-semibold">{draft.adults}</span>
            <LangSwap k="booking.children" className="text-small text-inkSec" />
            <span className="font-display font-semibold">{draft.children}</span>
          </span>
        </Row>
        <Row labelKey="booking.summary.host">
          {/* 호스트 이름 PLACEHOLDER · 확정 전(lines.js) */}
          <span className="font-semibold">{line.host_name}</span>
        </Row>
      </dl>

      {/* 동승 인원 · 좌석 = 매칭(IA §2.5·2.6). 숫자 삽입 문장은 언어별 완성 문장 겹침(시프트 0) */}
      <p className="grid text-body">
        <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>
          {en.loop.detail.ridersPre} <span className="font-display font-semibold">{departure.booked_count}</span> {en.loop.detail.ridersPost}
        </span>
        <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>
          {ko.loop.detail.ridersPre} <span className="font-display font-semibold">{departure.booked_count}</span> {ko.loop.detail.ridersPost}
        </span>
      </p>

      {/* 선주문 안내 · 핵심 차별점(IA §2.1 How it works) */}
      <LangSwap
        k="booking.summary.preorderNote"
        as="p"
        className="rounded-md bg-surface p-16 text-small font-light text-inkSec"
      />

      <div className="flex items-baseline justify-between">
        <LangSwap k="booking.total" className="text-small font-medium text-inkSec" />
        <span className="font-display text-h2 font-bold tracking-display">
          {'₩'}
          {total.toLocaleString('en-US')}
        </span>
      </div>
    </div>
  );
}
