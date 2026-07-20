// STUB 확장 · AGENT-2. 기준: IA §2.2, COMPONENTS.md 섹션 B, ROUTES §1(쿼리 ?terminal=&time=&date=).
// 입력(GateForm, 쿼리 프리필) → 옵션 카드 2~3개 → 선택 시 단계별 리스트 → Hands-Free 크로스셀.
// 결과 영역은 aria-live="polite"(DESIGN §14 · 경로 결과 갱신 알림).
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';
import Container from '../components/layout/Container';
import GateForm from '../components/gate/GateForm';
import HandsFreeCard from '../components/gate/HandsFreeCard';
import RouteOptionCard from '../components/gate/RouteOptionCard';
import RouteStepList from '../components/gate/RouteStepList';

const TERMINALS = ['t1', 't2', 'gmp'];

export default function Gate() {
  const [searchParams] = useSearchParams();
  const { t } = useLang();
  const [options, setOptions] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // 쿼리 프리필 · 형식이 유효한 값만 전달(그 외 GateForm 기본값)
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

  const handleResult = (nextOptions) => {
    setOptions(nextOptions);
    setSelectedId(null);
  };
  const selected = options?.find((option) => option.id === selectedId);

  return (
    <div className="pb-64 pt-48 lg:pt-128">
      <Container>
        <LangSwap
          k="nav.gate"
          as="p"
          className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
        />
        <LangSwap k="gate.title" as="h1" className="mt-8 text-h1 font-bold tracking-display" />
        <LangSwap k="gate.intro" as="p" className="mt-16 max-w-dialog text-body text-inkSec" />

        <div className="mt-32">
          <GateForm initial={initial} onResult={handleResult} />
        </div>

        <div aria-live="polite" className="mt-48">
          {options && (
            <>
              <LangSwap k="gate.results.heading" as="h2" className="text-h2 font-semibold" />
              {/* 첫 탑승 편 = 도착시각 + 입국수속 버퍼 60분 반영(IA §2.2, data/gateRoutes.js) */}
              <p className="mt-8 text-small text-inkSec">{t('gate.results.buffer')}</p>
              <div className="mt-24 grid gap-16 md:grid-cols-2 md:gap-24">
                {options.map((option) => (
                  <RouteOptionCard
                    key={option.id}
                    option={option}
                    selected={option.id === selectedId}
                    onSelect={() => setSelectedId(option.id)}
                  />
                ))}
              </div>
              {selected && (
                <div className="mt-48">
                  <LangSwap k="gate.results.stepsHeading" as="h3" className="text-h3 font-medium" />
                  <div className="mt-24">
                    <RouteStepList legs={selected.legs} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-48">
          <HandsFreeCard />
        </div>
      </Container>
    </div>
  );
}
