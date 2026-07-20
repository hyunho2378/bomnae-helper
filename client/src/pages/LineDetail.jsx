// 라인 상세 — IA §2.5 5블록 순서 고정:
// 1 LineHero / 2 StopStrip / 3 StoryClips / 4 DepartureCalendar(+동승·호스트) / 5 CTA → book.
// lineId 검증 실패 시 /loop 리다이렉트(ROUTES §3).
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getDepartures, getLine, getStops } from '../data/api';
// stories 데이터 — api.js에 접근자가 없어 직접 import(질문 목록 보고, 완료 보고 §5)
import stories from '../data/stories';
import DepartureCalendar from '../components/loop/DepartureCalendar';
import LineHero from '../components/loop/LineHero';
import StopStrip from '../components/loop/StopStrip';
import StoryClips from '../components/loop/StoryClips';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';
// 숫자 삽입 문장 겹침 렌더용(PATTERNS §1) — 시프트 0
import en from '../i18n/en';
import ko from '../i18n/ko';

const VALID = ['potato', 'dakgalbi', 'lake'];

export default function LineDetail() {
  const { lineId } = useParams();
  const [line, setLine] = useState(null);
  const [stops, setStops] = useState(null);
  const [pick, setPick] = useState(null); // {date, time} — 캘린더 선택 → book 쿼리 프리필
  const [riders, setRiders] = useState(7); // IA §2.5 예시 기본값 — 회차 선택 시 booked_count로 갱신
  const { lang } = useLang();

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

  // 회차 선택 → 동승 인원(booked_count) 갱신
  useEffect(() => {
    if (!valid || !pick) return undefined;
    let alive = true;
    (async () => {
      const deps = await getDepartures(lineId, pick.date);
      const dep = deps.find((d) => d.time === pick.time);
      if (alive && dep) setRiders(dep.booked_count);
    })();
    return () => {
      alive = false;
    };
  }, [lineId, pick, valid]);

  if (!valid) return <Navigate to="/loop" replace />;

  if (!line || !stops) {
    return (
      <Container>
        <div className="flex flex-col gap-16 py-64">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-128 w-full" />
        </div>
      </Container>
    );
  }

  const lineStories = stops
    .map((s) => stories.find((story) => story.id === s.story_id))
    .filter(Boolean);

  const bookHref = `/loop/${lineId}/book${
    pick ? `?date=${pick.date}&time=${encodeURIComponent(pick.time)}` : ''
  }`;

  return (
    <div className="pb-64">
      {/* 블록 1 — 라인 히어로 */}
      <LineHero line={line} stopsCount={stops.length} />

      {/* 블록 2 — 정류장 수직 노선도 + 선주문 문구 */}
      <Section id="route" eyebrow="loop.detail.routeEyebrow" title="loop.detail.routeTitle">
        <StopStrip lineId={lineId} stops={stops} />
      </Section>

      {/* 블록 3 — 차내 스토리 미리보기 */}
      {lineStories.length > 0 && (
        <Section
          id="stories"
          eyebrow="loop.detail.storiesEyebrow"
          title="loop.detail.storiesTitle"
        >
          <StoryClips stories={lineStories} />
        </Section>
      )}

      {/* 블록 4 — 출발 캘린더 + 좌석=매칭 문장 + 호스트(IA §2.5 4·5) */}
      <Section
        id="departures"
        eyebrow="loop.detail.calendarEyebrow"
        title="loop.detail.calendarTitle"
      >
        <div className="flex flex-col gap-24">
          <DepartureCalendar lineId={lineId} onPick={setPick} />
          <div className="flex flex-col gap-8 rounded-md border border-line p-20">
            {/* 좌석 = 매칭 — 숫자 삽입 문장은 언어별 완성 문장 겹침(시프트 0) */}
            <p className="grid text-body" aria-live="polite">
              <span aria-hidden={lang !== 'en'} className={`col-start-1 row-start-1 ${lang === 'en' ? '' : 'invisible'}`}>
                {en.loop.detail.ridersPre} <span className="font-display font-semibold">{riders}</span> {en.loop.detail.ridersPost}
              </span>
              <span aria-hidden={lang !== 'ko'} className={`col-start-1 row-start-1 ${lang === 'ko' ? '' : 'invisible'}`}>
                {ko.loop.detail.ridersPre} <span className="font-display font-semibold">{riders}</span> {ko.loop.detail.ridersPost}
              </span>
            </p>
            <p className="flex flex-wrap items-baseline gap-x-8 text-small text-inkSec">
              <LangSwap
                k="loop.detail.hostLabel"
                className="font-medium uppercase tracking-eyebrow text-caption text-inkMeta"
              />
              {/* 호스트 이름 PLACEHOLDER — 확정 전(lines.js) */}
              <span className="font-display font-semibold text-ink">{line.host_name}</span>
              <LangSwap k="loop.detail.hostIntro" className="font-light" />
            </p>
          </div>
        </div>
      </Section>

      {/* 블록 5 — CTA. 플로우 끝까지 동일 어휘 "Reserve seats"(DESIGN §13) */}
      <Container>
        <div className="flex justify-center">
          <Button as={Link} to={bookHref} size="lg">
            <LangSwap k="booking.title" />
          </Button>
        </div>
      </Container>
    </div>
  );
}
