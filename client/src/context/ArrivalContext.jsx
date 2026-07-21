// ArrivalContext · v3.2 도착 감지 상태기(PATTERNS §21, IA §8.5) · 존 B2 신설(오케스트레이터 승인).
// 상태기: off → explaining → waiting → arrived | denied | error | outside. 웹스토리지 금지(새로고침 시 off).
// 전역 지속(라우트 이동 유지)을 위해 App.jsx에서 <ArrivalProvider>로 감싸야 한다
// (BrowserRouter·LangProvider 안쪽 · App.jsx는 오케스트레이터 소유라 배선 대기 · 완료 보고 질문 참조).
// 배선 전에도 동작하도록 Gate.jsx가 로컬로 감싼다. 전역 제공이 생기면 로컬 래퍼는 자동 패스스루.
// 사전 설명 모달 우선 보장: navigator.geolocation은 오직 allow()(설명 모달의 주 버튼)에서만 호출된다.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ArrivalExplainModal from '../components/gate/ArrivalExplainModal';
import ArrivalModal from '../components/gate/ArrivalModal';

// 춘천 권역 · PATTERNS §21 명세값: 중심 [127.7300, 37.8813] 반경 9km 원(하버사인)
const CENTER = { lng: 127.73, lat: 37.8813 };
const RADIUS_KM = 9;
const WATCH_OPTIONS = { enableHighAccuracy: false, maximumAge: 30000, timeout: 20000 };
const STREAK_TO_ARRIVE = 2; // 2회 연속 권역 내 측위 시 arrived(순간 튐 방지)

// 하버사인 거리(km) · Gate 최근접 공항 매칭(fieldOptions)과 공유하는 단일 구현
export function haversineKm(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const ArrivalContext = createContext(null);

function ArrivalProviderImpl({ children }) {
  const [status, setStatus] = useState('off');
  // arrived 모달 · "지금은 괜찮아요"/닫기 후 재알림 금지: 다시 true가 되는 경로는 사용자 액션뿐
  const [modalOpen, setModalOpen] = useState(false);
  const watchId = useRef(null);
  const streak = useRef(0);

  const clearWatch = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const arrive = useCallback(() => {
    clearWatch(); // arrived 후 watch 해제(PATTERNS §21)
    streak.current = 0;
    setStatus('arrived');
    setModalOpen(true);
  }, [clearWatch]);

  const onFix = useCallback(
    (position) => {
      const here = { lng: position.coords.longitude, lat: position.coords.latitude };
      // 좌표·거리 수치는 상태 판정에만 쓰고 어디에도 노출하지 않는다(IA §8.5.3)
      if (haversineKm(here, CENTER) <= RADIUS_KM) {
        streak.current += 1;
        if (streak.current >= STREAK_TO_ARRIVE) arrive();
        else setStatus('waiting');
      } else {
        streak.current = 0;
        setStatus('outside'); // 권역 밖 · 활성 유지(watch 계속, IA §8.5.6)
      }
    },
    [arrive],
  );

  const onFail = useCallback(
    (err) => {
      clearWatch();
      streak.current = 0;
      // PERMISSION_DENIED(1)만 denied · 그 외(측위 불가·타임아웃)는 error(IA §8.5.6)
      setStatus(err?.code === 1 ? 'denied' : 'error');
    },
    [clearWatch],
  );

  // 실제 권한 요청 지점 · 반드시 설명 모달(explaining)의 "위치 사용 허용"을 거친다(IA §8.5.2)
  const startWatch = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      return;
    }
    clearWatch();
    streak.current = 0;
    setStatus('waiting');
    watchId.current = navigator.geolocation.watchPosition(onFix, onFail, WATCH_OPTIONS);
  }, [clearWatch, onFix, onFail]);

  useEffect(() => clearWatch, [clearWatch]);

  const value = useMemo(
    () => ({
      status,
      modalOpen,
      // 카드 "도착 확인 켜기"·"위치 정보 사용 안내"·denied "위치 설정 다시 보기" → 사전 설명 모달
      openExplain: () => setStatus('explaining'),
      // 설명 모달 "다음에 할게요"/닫기 · 재알림 금지(사용자 재요청 전 자동 재노출 없음)
      declineExplain: () => setStatus('off'),
      allow: startWatch,
      disable: () => {
        clearWatch();
        streak.current = 0;
        setStatus('off');
      },
      retry: startWatch,
      // 수동 확인 · watch 없이 즉시 arrived(PATTERNS §21)
      confirmManual: arrive,
      dismissModal: () => setModalOpen(false),
    }),
    [status, modalOpen, startWatch, clearWatch, arrive],
  );

  return (
    <ArrivalContext.Provider value={value}>
      {children}
      <ArrivalExplainModal />
      <ArrivalModal />
    </ArrivalContext.Provider>
  );
}

// 중복 마운트 가드: 상위(App)에 전역 프로바이더가 이미 있으면 패스스루.
// App.jsx 배선 전에는 Gate.jsx의 로컬 래퍼가 실제 프로바이더가 된다.
export function ArrivalProvider({ children }) {
  const existing = useContext(ArrivalContext);
  if (existing) return children;
  return <ArrivalProviderImpl>{children}</ArrivalProviderImpl>;
}

export function useArrival() {
  return useContext(ArrivalContext);
}
