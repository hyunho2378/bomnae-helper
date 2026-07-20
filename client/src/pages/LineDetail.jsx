// 라인 상세 · v3.1 rev(IA §2.5, PATTERNS §15 G-Local 이식):
// lg+ grid-cols-[1fr_380px] gap-12 · 좌 = LineHero(라인 컬러 소프트 면) + StopStrip + StoryClips,
// 우 = StickyBookPanel(sticky · 스크롤 동행). 캘린더·인원·합계는 패널 안에만(좌측 중복 금지).
// 모바일(<lg): 하단 고정 바(합계+CTA) → 탭 시 BottomSheet에 패널 렌더.
// 선택 상태는 URL 쿼리(?date=&time=&adult=&child=)와 동기 · 뒤로가기 보존(패널 소관).
// sticky 주의: 그리드 부모 체인에 overflow 지정 금지(§15).
// lineId 검증 실패 시 /loop 리다이렉트(ROUTES §3).
import { useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { getLine, getStops } from '../data/api';
// stories 데이터 · api.js에 접근자가 없어 직접 import(기 확정 결정 · PROGRESS)
import stories from '../data/stories';
import LineHero from '../components/loop/LineHero';
import StickyBookPanel, { computeTotal, readParty } from '../components/loop/StickyBookPanel';
import StopStrip from '../components/loop/StopStrip';
import StoryClips from '../components/loop/StoryClips';
import Container from '../components/layout/Container';
import BottomSheet from '../components/ui/BottomSheet';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import LangSwap from '../i18n/LangSwap';

const VALID = ['potato', 'dakgalbi', 'lake'];

// 컬럼 내부 섹션 헤더 · Section 컴포넌트는 자체 Container를 중첩시키므로 그리드 컬럼 안에서는
// 동일 타이포 규칙(eyebrow caption 500 대문자 자간+ / title h2 600)만 재사용한다.
function ColumnHead({ eyebrow, title }) {
  return (
    <div>
      <LangSwap
        k={eyebrow}
        as="p"
        className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
      />
      <LangSwap k={title} as="h2" className="mt-8 text-h2 font-semibold" />
    </div>
  );
}

export default function LineDetail() {
  const { lineId } = useParams();
  const [searchParams] = useSearchParams();
  const [line, setLine] = useState(null);
  const [stops, setStops] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false); // 모바일 하단 바 → 패널 시트

  const valid = VALID.includes(lineId);

  useEffect(() => {
    if (!valid) return undefined;
    let alive = true;
    (async () => {
      const [lineData, stopData] = await Promise.all([getLine(lineId), getStops(lineId)]);
      if (!alive) return;
      setLine(lineData);
      setStops(stopData);
    })();
    return () => {
      alive = false;
    };
  }, [lineId, valid]);

  if (!valid) return <Navigate to="/loop" replace />;

  if (!line || !stops) {
    return (
      <Container>
        <div className="flex flex-col gap-16 py-64 lg:pt-96">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-128 w-full" />
        </div>
      </Container>
    );
  }

  const lineStories = stops
    .map((s) => stories.find((story) => story.id === s.story_id))
    .filter(Boolean);

  // 모바일 하단 바 합계 · 패널과 동일 산식(StickyBookPanel.computeTotal)
  const { adults, children } = readParty(searchParams);
  const total = computeTotal(line, searchParams.get('date'), adults, children);

  return (
    <div className="pb-128 pt-24 lg:pb-64 lg:pt-96">
      <Container>
        {/* PATTERNS §15 기준 구현 그대로 · 380px는 명세값 브래킷 */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* 좌측 · 콘텐츠 스크롤(IA §2.5 블록 1~3 순서 고정) */}
          <div className="flex min-w-0 flex-col gap-64">
            <LineHero line={line} stopsCount={stops.length} />

            <section id="route" className="flex flex-col gap-24">
              <ColumnHead eyebrow="loop.detail.routeEyebrow" title="loop.detail.routeTitle" />
              <StopStrip lineId={lineId} stops={stops} />
            </section>

            {lineStories.length > 0 && (
              <section id="stories" className="flex flex-col gap-24">
                <ColumnHead
                  eyebrow="loop.detail.storiesEyebrow"
                  title="loop.detail.storiesTitle"
                />
                <StoryClips stories={lineStories} />
              </section>
            )}
          </div>

          {/* 우측 · 스티키 예약 패널(§15). top-96 = 고정 헤더 72px 아래 24px 여백
             (G-Local 기준 구현 top-24는 rem 스케일 · 본 프로젝트 px 토큰 환산, 질문 목록 보고).
             데스크탑 전용 · 모바일은 하단 바 → BottomSheet */}
          <aside className="mt-8 hidden h-fit lg:sticky lg:top-96 lg:mt-0 lg:block">
            <StickyBookPanel line={line} />
          </aside>
        </div>
      </Container>

      {/* 모바일 하단 고정 바 · 합계 + CTA(§15). GlassDock(56px+바닥 16px) 위에 띄운다.
          safe-area는 최하단 요소인 GlassDock이 처리 */}
      <div className="fixed inset-x-0 bottom-80 z-content px-20 md:px-32 lg:hidden">
        <div className="flex items-center justify-between gap-16 rounded-xl bg-white p-16 shadow-lg">
          <p aria-live="polite" className="flex min-w-0 flex-col">
            <LangSwap k="booking.total" className="text-caption font-medium text-inkMeta" />
            <span className="truncate font-display text-h3 font-bold tracking-display">
              {'₩'}
              {total.toLocaleString('en-US')}
            </span>
          </p>
          <Button onClick={() => setSheetOpen(true)}>
            <LangSwap k="booking.title" />
          </Button>
        </div>
      </div>
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="booking.title">
        <div className="max-h-[84vh] overflow-y-auto">
          {/* 전고 84% = PATTERNS §14 시트 명세값 준용 */}
          <StickyBookPanel line={line} />
        </div>
      </BottomSheet>
    </div>
  );
}
