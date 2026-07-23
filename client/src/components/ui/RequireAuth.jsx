// [V1] 인증 가드 · Tour Builder(/gts/*) 접근 로그인 필수(지시 [1]).
// 비로그인: 글래스 로그인 모달만(닫으면 홈으로) — 콘텐츠 미렌더. ready 전엔 렌더 유보(플래시 방지).
// returnTo = 현재 경로(서버가 OAuth state로 보존 · 쿼리 노출 금지).
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginGate from './LoginGate';
import { LoadingLogoCenter } from './LoadingLogo';

export default function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // [V13] 세션 복원 중(라우트 전환 로딩) — 공식 로고 펄스(콘텐츠·모달 플래시 방지)
  if (!ready) return <LoadingLogoCenter className="min-h-screen" />;
  if (user) return children;
  return <LoginGate open onClose={() => navigate('/', { replace: true })} returnTo={pathname} />;
}
