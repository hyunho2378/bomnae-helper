// [V11] 관리자 도구 공용 유틸 · /admin/users(User Management)에서 사용.
//   폴링 훅 + venue 이름 + payload 요약 + 시각 포맷. 관리자 도구는 영어 단일 하드카피(AdminPage 예외 준용).
import { useCallback, useEffect, useState } from 'react';
import { venues } from '../data/gts/venues';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// civic 방식 폴링 훅 · poll ms 간격 자동 + 수동 reload — 실패 시 마지막 데이터 유지 · status로 오류 코드 전달
export function useAdminApi(path, { poll } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null); // HTTP 상태(2fa 만료 감지용)
  const [loadedAt, setLoadedAt] = useState(null);

  const reload = useCallback(async () => {
    if (!path) return;
    try {
      const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
      setStatus(res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
      setLoadedAt(new Date());
    } catch (e) {
      setError(e.message);
    }
  }, [path]);

  useEffect(() => {
    reload();
    if (!poll || !path) return undefined;
    const id = setInterval(reload, poll);
    return () => clearInterval(id);
  }, [reload, poll, path]);

  return { data, error, status, reload, loadedAt };
}

// [V6] 예약 picks(venue id) → 이름(en). [V6] 막국수 중복 정리 구 id 매핑 포함.
const LEGACY_VENUE_ID = { 'makguksu-museum': 'chuncheon-makguksu-museum' };
const VENUE_NAME = Object.fromEntries(venues.map((v) => [v.id, v.name.en]));
export const canonId = (id) => LEGACY_VENUE_ID[id] ?? id;
export const venueName = (id) => VENUE_NAME[canonId(id)] ?? id;
export const resolveVenues = (ids) => (ids || []).map((id) => venues.find((v) => v.id === canonId(id))).filter(Boolean);

export const fmtSec = (ms) => (ms == null ? '-' : `${(ms / 1000).toFixed(1)}s`);

export const fmtDateTime = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// journey_events payload 요약(AdminPage와 동일 규칙)
export function payloadSummary(step, payload = {}) {
  if (step === 'setup') return `party ${payload.party} · ${payload.vehicle}${payload.luggage ? ' · luggage' : ''}`;
  if (step === 'meal_plan') return payload.plan ?? '';
  if (step === 'meals' || step === 'picks') return (payload.selections ?? []).map((s) => s.name).join(', ');
  if (step === 'route_confirm') return (payload.order ?? []).map((s) => s.name).join(' > ');
  if (step === 'pay_method') return payload.method ?? '';
  if (step === 'complete') return `code ${payload.code ?? ''}`;
  if (step === 'log_template') return `from log ${payload.code ?? ''}`;
  if (step === 'login') return payload.email ?? (payload.username ? `@${payload.username}` : '');
  return '';
}
