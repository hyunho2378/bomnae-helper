// DEPRECATED [H2-5] — 라이브 시계 표시 제거(시간 필드 닫힘 상태가 KST 현재를 표시). 보존.
// 라이브 KST 시계 · v4.2 존 B5(§38): "지금 한국은 HH:MM:SS" · 1초 setInterval 틱 · 언마운트 clear.
// 문안은 사전 키(gate.planner.clock) 보간 · 3언어 겹침 렌더(PlannerSwap · 시프트 0).
// 숫자는 font-display 스택(Kanit 라틴/숫자 · 한글은 SUIT 폴백 · DESIGN §4).
import { useEffect, useState } from 'react';
import { PlannerSwap, kstNowParts } from './fieldOptions';

const pad2 = (n) => String(n).padStart(2, '0');
const kstClock = () => {
  const { h, m, s } = kstNowParts();
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
};

export default function KoreaClock() {
  const [now, setNow] = useState(kstClock);

  useEffect(() => {
    const id = setInterval(() => setNow(kstClock()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="font-display text-body font-semibold">
      <PlannerSwap k="gate.planner.clock" vars={{ time: now }} />
    </p>
  );
}
