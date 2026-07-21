// 라인 상세 · v3.2 rev(IA §8.3.3 yountravel 문법 이식 · PATTERNS §15·§20):
// lg+ grid-cols-[1fr_380px] · 좌 = LineHero + 2개월 스프레드 캘린더(§20 · 회차 전부 펼침)
// + StopStrip + StoryClips, 우 = 스티키 "선택 중인 출발" 패널(캘린더는 좌측으로 이동).
// 가격·잔여석·마감 = 항상 1뷰(§8.3.4 다크패턴 제거) · 날짜 기본값 오늘(회차 리스트 초기 렌더).
// 선택 상태는 URL 쿼리(?date=&time=&adult=&child=)와 동기(replace) · 뒤로가기 보존.
// 모바일(<lg): 하단 고정 바(합계+CTA) → 탭 시 BottomSheet에 패널 렌더.
// sticky 주의: 그리드 부모 체인에 overflow 지정 금지(§15).
// lineId 검증 실패 시 /loop 리다이렉트(ROUTES §3).
import { useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { getDepartures, getLine, getStops } from '../data/api';
// stories 데이터 · api.js에 접근자가 없어 직접 import(기 확정 결정 · PROGRESS)
import stories from '../data/stories';
import DepartureCalendar from '../components/loop/DepartureCalendar';
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
const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

// 컬럼 내부 섹션 헤더 · Section 컴포넌트는 자체 Container를 중첩시키므로 그리드 컬럼 안에서는
// 동일 타이포 규칙(eyebrow caption 500 대문자 자간+ / title h2)만 재사용한다.
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [line, setLine] = useState(null);
  const [stops, setStops] = useState(null);
  const [departures, setDepartures] = useState(null); // 선택 날짜의 회차(리스트·패널 공유)
  const [sheetOpen, setSheetOpen] = useState(false); // 모바일 하단 바 → 패널 시트

  const valid = VALID.includes(lineId);

  // 선택 상태 · URL이 진실. 날짜 기본값 = 오늘(회차 리스트가 초기 렌더 DOM에 존재 · §8.3.4)
  const date = searchParams.get('date') ?? todayStr();
  const time = searchParams.get('time');
  const { adults, children } = readParty(searchParams);

  // URL 쿼리 동기 · replace(선택마다 히스토리를 쌓지 않되 뒤로가기 시 상태 보존)
  const patch = (entries) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([k, v]) => {
      if (v === null || v === undefined) next.delete(k);
      else next.set(k, String(v));
    });
    setSearchParams(next, { replace: true });
  };

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

  // 선택 날짜의 회차 로드 · 회차 리스트(전부 펼침)와 패널 CTA가 공유
  useEffect(() => {
    if (!valid) return undefined;
    let alive = true;
    setDepartures(null);
    (async () => {
      const deps = await getDepartures(lineId, date);
      if (alive) setDepartures(deps);
    })();
    return () => {
      alive = false;
    };
  }, [lineId, valid, date]);

  if (!valid) return <Navigate to="/loop" replace />;

  if (!line || !stops) {
    return (
      <Container>
        <div className="flex flex-col gap-16 py-96 lg:pb-64">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-128 w-full" />
        </div>
      </Container>
    );
  }

  const lineStories = stops
    .map((s) => stories.find((story) => story.id === s.story_id))
    .filter(Boolean);

  const departure = departures?.find((d) => d.time === time) ?? null;
  // 모바일 하단 바 합계 · 패널과 동일 산식(StickyBookPanel.computeTotal)
  const total = computeTotal(line, date, adults, children);

  const panel = (
    <StickyBookPanel
      line={line}
      date={date}
      time={time}
      departure={departure}
      adults={adults}
      childrenCount={children}
      onPatch={patch}
    />
  );

  return (
    <div className="pb-128 pt-96 lg:pb-64">
      {/* pt-96 = 고정 헤더 80px + 16px 오프셋(§16.4 · 모바일 상단 헤더 포함 전 뷰포트) */}
      <Container>
        {/* PATTERNS §15 기준 구현 그대로 · 380px는 명세값 브래킷 */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12">
          {/* 좌측 · 콘텐츠(§8.3.3: hero → 캘린더+회차 → 노선 → 스토리) */}
          <div className="flex min-w-0 flex-col gap-64">
            <LineHero line={line} stopsCount={stops.length} />

            {/* 2개월 스프레드 캘린더 + 회차 전부 펼침(§20) · 좌측 본문 소유(패널 중복 금지) */}
            <section id="departures" className="flex flex-col gap-24">
              <ColumnHead
                eyebrow="loop.detail.calendarEyebrow"
                title="loop.detail.calendarTitle"
              />
              <DepartureCalendar
                line={line}
                selectedDate={date}
                selectedTime={time}
                departures={departures}
                onPickDate={(d) => patch({ date: d, time: null })}
                onPickTime={(picked) => patch({ date, time: picked })}
              />
            </section>

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

          {/* 우측 · 스티키 "선택 중인 출발" 패널(§8.3.3). top-96 = 고정 헤더 80px 아래 16px.
             데스크탑 전용 · 모바일은 하단 바 → BottomSheet */}
          <aside className="mt-8 hidden h-fit lg:sticky lg:top-96 lg:mt-0 lg:block">{panel}</aside>
        </div>
      </Container>

      {/* 모바일 하단 고정 바 · 합계 + CTA(§15). GlassDock(56px+바닥 16px) 위에 띄운다.
          safe-area는 최하단 요소인 GlassDock이 처리 */}
      <div className="fixed inset-x-0 bottom-80 z-content px-16 md:px-24 lg:hidden">
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
          {panel}
        </div>
      </BottomSheet>
    </div>
  );
}
