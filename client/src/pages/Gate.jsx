// Trip Planner(/gate) · v4.2 존 B5(IA §10.3): 칩 토글 폐지 → 수직 2섹션
// ("To Chuncheon" 폼 섹션 → 아래 "From Chuncheon" 폼 섹션 · 각자 독립 상태 · 구조 동일).
// 폼 상단 라이브 KST 시계(§38 · KoreaClock) · 결과 카드는 §39 레그 시각 계산("예상" 라벨) 표기.
// §40 데모 도착 시퀀스: To 섹션 결과 확정(내 경로 찾기 제출) 8초([v4.4-3]) 뒤 중앙 모달 → /gts.
//   타이머는 페이지 이탈 시 clear · 세션당 1회 발화(재검색 제출 시 재장전 허용).
// 구 도착 감지 카드(§8.5·§21)는 렌더 제거하되 ARRIVAL_MODE='geo' 플래그로 코드 보존(삭제 금지).
// 홈 미니 폼(GateEntryCard) 삭제로 쿼리 프리필 계약 소멸 · useSearchParams 프리필 제거.
// ArrivalProvider는 App.jsx 전역 배선의 로컬 패스스루(context/ArrivalContext.jsx 가드 참조).
// 결과 영역은 aria-live="polite"(DESIGN §14 · 경로 결과 갱신 알림).
import { useEffect, useRef, useState } from 'react';
import LangSwap from '../i18n/LangSwap';
import Container from '../components/layout/Container';
import EmptyState from '../components/ui/EmptyState';
import ArrivalCard from '../components/gate/ArrivalCard';
import DemoArrivalModal from '../components/gate/DemoArrivalModal';
import GateForm from '../components/gate/GateForm';
import RouteOptionCard from '../components/gate/RouteOptionCard';
import { ArrivalProvider } from '../context/ArrivalContext';

// §40 도착 시퀀스 모드 · 'demo'(기본) = 제출 3초 뒤 데모 모달 / 'geo' = §21 지오 감지 카드 복원
const ARRIVAL_MODE = 'demo';

// 방향 1개 = 폼 + 결과 1세트 · To/From이 같은 구조로 수직 반복(IA §10.3 구조 동일 계약)
function PlannerSection({ direction, onConfirmed }) {
  const [result, setResult] = useState(null);

  const handleResult = (payload) => {
    setResult(payload);
    onConfirmed?.(payload);
  };

  return (
    <section className="mt-32">
      <LangSwap k={`gate.planner.dir.${direction}`} as="h2" className="text-h2 font-bold" />
      <div className="mt-24">
        <GateForm direction={direction} onResult={handleResult} />
      </div>
      <div aria-live="polite" className="mt-32">
        {result &&
          (result.options.length === 0 ? (
            // 조합 템플릿 없음 · §29 계약(지어내지 않는다) → 빈 상태
            // PLACEHOLDER · unDraw 단색(빈 경로) SVG 저장 대기(PROGRESS 준비물)
            <EmptyState
              illustration="empty-route.svg"
              titleKey="gate.planner.empty.title"
              bodyKey="gate.planner.empty.body"
            />
          ) : (
            <>
              <LangSwap k="gate.results.heading" as="h3" className="text-h3 font-semibold" />
              <div className="mt-24 flex flex-col gap-24">
                {result.options.map((option) => (
                  <RouteOptionCard key={option.id} option={option} departHHMM={result.departHHMM} />
                ))}
              </div>
            </>
          ))}
      </div>
    </section>
  );
}

export default function Gate() {
  const [demoOpen, setDemoOpen] = useState(false);
  const demoTimer = useRef(0);

  // §40: To 섹션 결과 확정 → 3초 뒤 모달(재검색 시 재장전) · 빈 결과에는 발화하지 않는다
  const scheduleDemo = (payload) => {
    if (ARRIVAL_MODE !== 'demo' || payload.options.length === 0) return;
    clearTimeout(demoTimer.current);
    demoTimer.current = setTimeout(() => setDemoOpen(true), 8000); // [v4.4-3] 10초 → 8초
  };

  // 이탈(언마운트) 시 타이머 clear(§40)
  useEffect(() => () => clearTimeout(demoTimer.current), []);

  return (
    <ArrivalProvider>
      {/* v3.2 모바일 상단 헤더 80px 신설 → 모바일 상단 패딩 pt-96(lg 기존 유지) */}
      <div className="pb-64 pt-96 lg:pt-128">
        <Container>
          <LangSwap
            k="nav.gate"
            as="p"
            className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
          />
          <LangSwap k="gate.planner.title" as="h1" className="mt-8 text-h1 font-bold tracking-display" />
          {/* v3.1: 텍스트 max-w 캡 해제(컨테이너가 폭 결정, DESIGN §13) */}
          <LangSwap k="gate.planner.intro" as="p" className="mt-16 text-body text-inkSec" />

          {/* §10.3 수직 2섹션 · To 먼저, 아래 From · 데모 도착은 To에서만 발화(§40) */}
          <PlannerSection direction="to" onConfirmed={scheduleDemo} />
          <PlannerSection direction="from" />

          {/* §21 지오 감지 상태 카드 · geo 모드 전용 렌더(코드 보존 · §40) */}
          {ARRIVAL_MODE === 'geo' && (
            <div className="mt-48">
              <ArrivalCard />
            </div>
          )}
        </Container>
      </div>

      {/* §40 데모 도착 모달 · Escape·닫기·"나중에" = 닫힘, 주 CTA → /gts */}
      <DemoArrivalModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </ArrivalProvider>
  );
}
