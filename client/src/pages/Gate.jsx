// Getting Here(/gate) · v4 존 B4: 양방향 위치 기반 플래너(IA §9.2).
// 입력(GateForm: 방향 토글 + 허브/춘천 2점 + CalendarField + 시간 FieldSelect)
// → 경로 옵션 카드(data/gts/hubs.js routeTemplates 조회 전용 · §29)
// → RouteTimeline(§28 세로 타임라인). 구 수평 주행 인터랙션(§12)은 §28 명시 삭제로 제거됨.
// 해당 조합 템플릿이 없으면 EmptyState(빈 검색 결과 · DESIGN §7 위치 허용).
// 도착 감지 상태 카드(§8.5)는 결과 하단 위치 유지(IA §9.2.6).
// ArrivalProvider는 App.jsx 전역 배선 전까지 이 페이지가 로컬로 감싼다
// (전역 배선 후 자동 패스스루 · context/ArrivalContext.jsx 헤더 주석 참조).
// 결과 영역은 aria-live="polite"(DESIGN §14 · 경로 결과 갱신 알림).
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';
import Container from '../components/layout/Container';
import EmptyState from '../components/ui/EmptyState';
import ArrivalCard from '../components/gate/ArrivalCard';
import GateForm from '../components/gate/GateForm';
import RouteOptionCard from '../components/gate/RouteOptionCard';
import { ArrivalProvider } from '../context/ArrivalContext';

const TERMINALS = ['t1', 't2', 'gmp'];

export default function Gate() {
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const [options, setOptions] = useState(null);

  // 쿼리 프리필(GateEntryCard 계약 생존 · terminal은 GateForm이 허브로 매핑) · 형식 유효값만 전달
  const initial = useMemo(() => {
    const terminal = searchParams.get('terminal');
    const time = searchParams.get('time');
    const date = searchParams.get('date');
    return {
      terminal: TERMINALS.includes(terminal) ? terminal : undefined,
      time: /^\d{2}:\d{2}$/.test(time ?? '') ? time : undefined,
      date: /^\d{4}-\d{2}-\d{2}$/.test(date ?? '') ? date : undefined,
    };
  }, [searchParams]);

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

          <div className="mt-32">
            <GateForm initial={initial} onResult={setOptions} />
          </div>

          <div aria-live="polite" className="mt-48">
            {options &&
              (options.length === 0 ? (
                // 조합 템플릿 없음 · §29 계약(지어내지 않는다) → 빈 상태
                // PLACEHOLDER · unDraw 단색(빈 경로) SVG 저장 대기(PROGRESS 준비물)
                <EmptyState
                  illustration="empty-route.svg"
                  titleKey="gate.planner.empty.title"
                  bodyKey="gate.planner.empty.body"
                />
              ) : (
                <>
                  {/* v3.2 §16.2: h2 = 700 */}
                  <LangSwap k="gate.results.heading" as="h2" className="text-h2 font-bold" />
                  {/* v4.2 §10.4: 사용자 노출 초안 고지 삭제 · "예상" 라벨은 §39 레그 시각이 담당(존 B5) */}
                  <div className="mt-24 flex flex-col gap-24">
                    {options.map((option) => (
                      <RouteOptionCard key={option.id} option={option} />
                    ))}
                  </div>
                </>
              ))}
          </div>

          {/* 도착 감지 상태 카드 · 결과 하단, 주 기능 방해 없는 위치(IA §9.2.6) */}
          <div className="mt-48">
            <ArrivalCard />
          </div>
        </Container>
      </div>
    </ArrivalProvider>
  );
}
