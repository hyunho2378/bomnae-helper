// 티켓 · IA §2.7: navy 면 티켓 카드(라인 컬러 스트라이프, 예약 코드 6자 Kanit Bold,
// 미팅포인트, 인원, 호스트, 차내 클립 1개, "2 lines left") + 공유(PATTERNS §7).
// 미존재 bookingId는 EmptyState 렌더(라우트 이동 아님 · ROUTES §3).
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { getBooking, getLine, getMeetingPoints, getStops } from '../data/api';
// stories 데이터 · api.js에 접근자가 없어 직접 import(질문 목록 보고, 완료 보고 §5)
import stories from '../data/stories';
import { colors, fonts, lineColors } from '../tokens';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

// 라인 컬러 정적 클래스 매핑(토큰 클래스만)
const STRIPE = {
  potato: 'bg-yellow',
  dakgalbi: 'bg-spice',
  lake: 'bg-primary',
};

// 티켓 카드 → PNG · DOM 캡처 라이브러리 금지, canvas 직접 렌더(PATTERNS §7).
// 색은 전부 tokens(colors/lineColors)에서만. 숫자는 캔버스 드로잉 좌표(레이아웃 아님).
function drawTicketPng(line, booking) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = colors.navy;
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = lineColors[line.id];
  ctx.fillRect(0, 0, 1200, 24); // 라인 컬러 스트라이프
  ctx.fillStyle = colors.bg; // navy 위 흰 텍스트(토큰 bg=순백)
  ctx.font = `600 40px ${fonts.display}`;
  ctx.fillText('BOMNAE HELPER', 80, 140);
  ctx.font = `500 44px ${fonts.display}`;
  ctx.fillText(line.name_en, 80, 220);
  ctx.font = `700 180px ${fonts.display}`;
  ctx.fillText(booking.code, 80, 420); // 예약 코드 6자 · Kanit Bold 큰 숫자
  ctx.font = `300 44px ${fonts.display}`;
  ctx.fillText(`${booking.date} · ${booking.time}`, 80, 520);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

// PATTERNS §7 기준 구현 그대로 · navigator.share 실패/미지원 시 다운로드 폴백
async function shareTicket(cardBlob, text) {
  const file = new File([cardBlob], 'bomnae-ticket.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return;
    } catch {
      /* 사용자 취소 */
    }
  }
  const url = URL.createObjectURL(file); // 폴백: 다운로드
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: 'bomnae-ticket.png',
  });
  a.click();
  URL.revokeObjectURL(url);
}

function TicketRow({ labelKey, children }) {
  return (
    <div className="flex flex-col gap-4">
      <LangSwap
        k={labelKey}
        as="dt"
        className="text-caption font-medium uppercase tracking-eyebrow text-white"
      />
      <dd className="text-body font-semibold text-white">{children}</dd>
    </div>
  );
}

export default function Ticket() {
  const { bookingId } = useParams();
  const [state, setState] = useState({ loading: true, booking: null, line: null, meetingPoint: null, story: null });
  const { lang } = useLang();

  useEffect(() => {
    let alive = true;
    (async () => {
      const booking = await getBooking(bookingId);
      if (!booking) {
        if (alive) setState({ loading: false, booking: null, line: null, meetingPoint: null, story: null });
        return;
      }
      const [line, points, stops] = await Promise.all([
        getLine(booking.lineId),
        getMeetingPoints(),
        getStops(booking.lineId),
      ]);
      const storyId = stops.find((s) => s.story_id)?.story_id ?? null;
      const story = stories.find((s) => s.id === storyId) ?? null;
      if (alive) {
        setState({ loading: false, booking, line, meetingPoint: points[0], story });
      }
    })();
    return () => {
      alive = false;
    };
  }, [bookingId]);

  const { loading, booking, line, meetingPoint, story } = state;

  if (loading) {
    return (
      <Container>
        <div className="mx-auto flex w-full max-w-dialog flex-col gap-16 py-64 lg:pt-96">
          <Skeleton className="h-128 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </Container>
    );
  }

  // 미존재 예약 · EmptyState 렌더(404 라우트 이동 아님, ROUTES §3)
  if (!booking) {
    return (
      <Container>
        {/* PLACEHOLDER · unDraw 단색(빈결과) SVG 저장 대기(PROGRESS 준비물) */}
        <EmptyState
          illustration="empty.svg"
          titleKey="ticket.notFound.title"
          bodyKey="ticket.notFound.body"
          cta={{ labelKey: 'ticket.notFound.cta', to: '/loop' }}
        />
      </Container>
    );
  }

  return (
    <Container>
      <div className="mx-auto flex w-full max-w-dialog flex-col gap-32 py-64 lg:pt-96">
        <LangSwap k="ticket.title" as="h1" className="text-h2 font-semibold" />

        {/* navy 티켓 카드 · 강대비 면(DESIGN §2) */}
        <article className="overflow-hidden rounded-lg bg-navy">
          <div aria-hidden="true" className={`h-8 ${STRIPE[line.id]}`} />
          <div className="flex flex-col gap-24 p-24 lg:p-32">
            <div className="flex items-baseline justify-between gap-16">
              <span className="font-display text-small font-semibold uppercase tracking-eyebrow text-white">
                Bomnae Helper
              </span>
              {/* 라인명 겹침(시프트 0) · 데이터 필드(th 없음)는 en 폴백: lang!=='ko'(v3.1 규칙) */}
              <span className="grid text-small font-medium text-white">
                <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 truncate ${lang !== 'ko' ? '' : 'invisible'}`}>{line.name_en}</span>
                <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 truncate ${lang === 'ko' ? '' : 'invisible'}`}>{line.name_ko}</span>
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <LangSwap
                k="ticket.codeLabel"
                as="p"
                className="text-caption font-medium uppercase tracking-eyebrow text-white"
              />
              {/* 예약 코드 6자 · Kanit Bold 큰 숫자(IA §2.7) */}
              <p className="font-display text-h1 font-bold tracking-display text-white">
                {booking.code}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-16">
              <TicketRow labelKey="booking.summary.departure">
                <span className="font-display">
                  {booking.date} · {booking.time}
                </span>
              </TicketRow>
              <TicketRow labelKey="booking.summary.meeting">
                <span className="flex flex-wrap items-baseline gap-8">
                  {/* 미팅포인트명 겹침(시프트 0) · 데이터 필드는 en 폴백: lang!=='ko'(v3.1 규칙) */}
                  <span className="grid">
                    <span aria-hidden={lang === 'ko'} className={`col-start-1 row-start-1 ${lang !== 'ko' ? '' : 'invisible'}`}>{meetingPoint.name_en}</span>
                    <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>{meetingPoint.name_ko}</span>
                  </span>
                  <Link
                    to="/loop"
                    className="text-small font-medium text-white underline underline-offset-4"
                  >
                    <LangSwap k="ticket.viewMap" />
                  </Link>
                </span>
              </TicketRow>
              <TicketRow labelKey="booking.summary.party">
                <span className="flex items-baseline gap-8">
                  <LangSwap k="booking.adults" className="text-caption font-light" />
                  <span className="font-display">{booking.adults}</span>
                  <LangSwap k="booking.children" className="text-caption font-light" />
                  <span className="font-display">{booking.children}</span>
                </span>
              </TicketRow>
              <TicketRow labelKey="booking.summary.host">
                {/* 호스트 이름 PLACEHOLDER · 확정 전(lines.js) */}
                {line.host_name}
              </TicketRow>
            </dl>
            {/* navy 위 수평 디바이더 · v3.1 무보더(border 속성 미사용, 면 요소로 표현).
                line 토큰은 잉크 계열이라 navy 위 시인 불가 · white 사용 */}
            <div className="flex flex-col gap-16">
              <div aria-hidden="true" className="h-px w-full bg-white" />
              <div className="flex items-baseline justify-between">
                <LangSwap k="booking.total" className="text-small font-medium text-white" />
                <span className="font-display text-h3 font-bold text-white">
                  {'₩'}
                  {booking.total.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>
        </article>

        <Button
          onClick={async () => {
            const blob = await drawTicketPng(line, booking);
            await shareTicket(blob, `${line.name_en} · ${booking.date} ${booking.time} · ${booking.code}`);
          }}
        >
          <LangSwap k="ticket.shareCta" />
          <Share2 size={16} aria-hidden="true" />
        </Button>

        {/* 차내 클립 1개 · "What you'll watch on board"(IA §2.7) */}
        {story && (
          <section className="flex flex-col gap-12">
            <LangSwap k="ticket.watch" as="h2" className="text-h3 font-semibold" />
            {/* v3.1 무보더 · 카드 shadow.sm + radius 카드 스케일 lg(DESIGN §7) */}
            <div className="flex items-center gap-16 rounded-lg bg-white p-16 shadow-sm">
              <img
                src={story.thumb}
                alt=""
                loading="lazy"
                className="h-64 w-96 shrink-0 rounded-md bg-surface object-cover"
              />
              <div className="flex min-w-0 flex-col gap-4">
                <p className="truncate text-body font-semibold">
                  {lang === 'ko' ? story.title_ko : story.title_en}
                </p>
                <p className="line-clamp-2 text-small font-light text-inkSec">
                  {lang === 'ko' ? story.summary_ko : story.summary_en}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CJM Revisit · 남은 라인이 곧 재방문 이유(IA §2.7) · radius 카드 스케일 lg(v3.1) */}
        <div className="flex flex-col items-center gap-12 rounded-lg bg-surface p-24 text-center">
          <LangSwap k="ticket.linesLeft" as="p" className="text-body font-semibold" />
          <Button variant="ghost" as={Link} to="/loop">
            <LangSwap k="ticket.linesLeftCta" />
          </Button>
        </div>
      </div>
    </Container>
  );
}
