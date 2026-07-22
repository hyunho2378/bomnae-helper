// [V1] 관리자 대시보드 /admin — 헤더 링크 없음(직접 URL 진입만).
// 참조 패턴: DAH(RequireAdmin 가드 + 좌 사이드바 AdminLayout · 비관리자 UI 미렌더) +
//   civic(폴링 훅 useApi(path, { poll }) + 수동 reload — WebSocket·SSE 금지 · 15s + 새로고침).
// 비관리자·비로그인 = 404 위장(NotFound 렌더 · 관리자 존재 노출 금지). 서버측은 401/403 이중 차단.
// 문자열: 관리자 내부 도구라 3언어 대상 아님 — 영어 단일 하드카피 허용(지시 [3] 명시 예외).
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { motion } from '../tokens';
import NotFound from './NotFound';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// civic 방식 폴링 훅 · poll ms 간격 자동 + 수동 reload — 실패 시 마지막 데이터 유지
function useApi(path, { poll } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
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
    if (!poll) return undefined;
    const id = setInterval(reload, poll);
    return () => clearInterval(id);
  }, [reload, poll]);

  return { data, error, reload, loadedAt };
}

const fmtSec = (ms) => (ms == null ? '-' : `${(ms / 1000).toFixed(1)}s`);
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-GB');
const payloadSummary = (step, payload = {}) => {
  if (step === 'setup') return `party ${payload.party} · ${payload.vehicle}${payload.luggage ? ' · luggage' : ''}`;
  if (step === 'meal_plan') return payload.plan ?? '';
  if (step === 'meals' || step === 'picks') return (payload.selections ?? []).map((s) => s.name).join(', ');
  if (step === 'route_confirm') return (payload.order ?? []).map((s) => s.name).join(' > ');
  if (step === 'pay_method') return payload.method ?? '';
  if (step === 'complete') return `code ${payload.code ?? ''}`;
  if (step === 'log_template') return `from log ${payload.code ?? ''}`; // [V3]
  if (step === 'login') return payload.email ?? (payload.username ? `@${payload.username}` : '');
  return '';
};


// [V4] Overview = 요약 스탯 4장만(Participants 테이블 제거). 서버 /api/admin/participants는
//   스탯 집계 재사용을 위해 유지 · 클라 뷰(참가자 행 리스트)만 삭제.
// [V5] complete 이벤트 payload에서 두 건너뛰기 bool 추출 · 스킵 비율 = flag 보유 완주자 중 false 비율
function skipRate(rows, field) {
  const flags = rows
    .filter((r) => r.completed)
    .map((r) => (r.steps ?? []).find((s) => s.step === 'complete')?.payload)
    .filter((p) => p && typeof p[field] === 'boolean');
  if (!flags.length) return '-';
  const skipped = flags.filter((p) => p[field] === false).length;
  return `${Math.round((skipped / flags.length) * 100)}%`;
}

function Overview() {
  const { data, error, loadedAt } = useApi('/api/admin/participants', { poll: 15000 });
  const rows = data?.participants ?? [];
  const completed = rows.filter((r) => r.completed).length;
  const avgMs = rows.length ? rows.reduce((a, r) => a + (r.total_ms ?? 0), 0) / rows.length : null;

  const stats = [
    { label: 'Participants', value: rows.length },
    { label: 'Completed', value: completed },
    { label: 'Completion rate', value: rows.length ? `${Math.round((completed / rows.length) * 100)}%` : '-' },
    { label: 'Avg total time', value: avgMs != null ? fmtSec(avgMs) : '-' },
    // [V5] 무마찰 검증 스탯 · 완주자 중 각 단계를 건너뛴 비율
    { label: 'Dropoff skipped', value: skipRate(rows, 'dropoffProvided') },
    { label: 'Payment skipped', value: skipRate(rows, 'payMethodProvided') },
  ];

  return (
    <div className="flex flex-col gap-24">
      <div className="grid grid-cols-2 gap-16 lg:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-4 rounded-lg bg-white p-24 shadow-sm">
            <span className="text-caption font-semibold uppercase tracking-eyebrow text-inkMeta">{label}</span>
            <span className="font-display text-h2 font-bold text-ink">{value}</span>
          </div>
        ))}
      </div>
      {error && <p className="text-small font-medium text-spice">Load failed: {error}</p>}
      {loadedAt && (
        <p className="text-caption text-inkMeta">Updated {loadedAt.toLocaleTimeString('en-GB')} · polls every 15s</p>
      )}
    </div>
  );
}

function LiveTimeline() {
  const { data, error, loadedAt } = useApi('/api/admin/events', { poll: 15000 });
  const [seen, setSeen] = useState(() => new Set());
  const freshIds = useRef(new Set());

  const events = data?.events ?? [];
  useEffect(() => {
    if (!events.length) return;
    const next = new Set(seen);
    freshIds.current = new Set();
    events.forEach((e) => {
      if (!next.has(e.id)) {
        if (seen.size) freshIds.current.add(e.id); // 첫 로드는 하이라이트 없음
        next.add(e.id);
      }
    });
    if (next.size !== seen.size) setSeen(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  return (
    <div className="flex flex-col gap-16">
      {error && <p className="text-small font-medium text-spice">Load failed: {error}</p>}
      <ol className="flex flex-col divide-y divide-line rounded-lg bg-white shadow-sm">
        {events.map((e) => (
          <li
            key={e.id}
            className="flex flex-wrap items-baseline gap-x-12 gap-y-4 px-16 py-12 text-small"
            style={
              freshIds.current.has(e.id)
                ? {
                    // 새 이벤트 유입 하이라이트 1회(§17 예산 내 · surface → white 배경 전환)
                    animation: `bh-admin-flash 1200ms ${motion.easeOut} 1`,
                  }
                : undefined
            }
          >
            <span className="font-display font-semibold text-inkSec">{fmtTime(e.created_at)}</span>
            <span className="font-semibold text-ink">{e.email}</span>
            <span className="font-display font-bold text-primary">{e.step}</span>
            <span className="min-w-0 flex-1 text-inkSec">{payloadSummary(e.step, e.payload)}</span>
            <span className="font-display text-caption font-semibold text-inkMeta">+{fmtSec(e.duration_ms)}</span>
          </li>
        ))}
        {!events.length && <p className="px-16 py-24 text-small text-inkSec">No events yet.</p>}
      </ol>
      {loadedAt && (
        <p className="text-caption text-inkMeta">Updated {loadedAt.toLocaleTimeString('en-GB')} · polls every 15s</p>
      )}
      <style>{`@keyframes bh-admin-flash { from { background: ${'#F5F6FA'}; } to { background: transparent; } }`}</style>
    </div>
  );
}

// DAH RequireAdmin 문법: 비로그인·비관리자 = NotFound 렌더(404 위장 · UI 미렌더)
function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user?.isAdmin) return <NotFound />;
  return children;
}

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <RequireAdmin>
      <Container>
        <div className="flex flex-col gap-24 pb-64 pt-96">
          <div className="flex flex-wrap items-center justify-between gap-16">
            <h1 className="font-display text-h1 font-bold tracking-display">Validation dashboard</h1>
            <Button variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
              <RefreshCw size={16} aria-hidden="true" />
              Refresh
            </Button>
          </div>
          {/* DAH AdminLayout 구도 · 좌 사이드바 + 우 콘텐츠 */}
          <div className="flex flex-col gap-24 lg:grid lg:grid-cols-[200px_1fr] lg:items-start">
            <nav className="flex gap-8 lg:flex-col">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'timeline', label: 'Live timeline' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`pressable flex min-h-44 items-center rounded-md px-16 text-small font-semibold ${
                    tab === id ? 'bg-primary text-white' : 'bg-white text-ink shadow-sm hover:bg-surface'
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
            {/* reloadKey로 훅 리마운트 = 수동 새로고침(civic reload 문법) */}
            <div key={reloadKey}>{tab === 'overview' ? <Overview /> : <LiveTimeline />}</div>
          </div>
        </div>
      </Container>
    </RequireAdmin>
  );
}
