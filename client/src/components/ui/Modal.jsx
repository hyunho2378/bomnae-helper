// Sheet/Dialog 자동 분기 래퍼 — 페이지는 Modal만 사용한다 (COMPONENTS A4).
// 분기 기준은 tokens.breakpoints.lg. 라우트 변경 시 자동 닫기 (ROUTES §4).
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { breakpoints } from '../../tokens';
import BottomSheet from './BottomSheet';
import Dialog from './Dialog';

const query = `(min-width: ${breakpoints.lg}px)`;
const subscribe = (cb) => {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const getSnapshot = () => window.matchMedia(query).matches;

export default function Modal({ open, onClose, title, children }) {
  const isDesktop = useSyncExternalStore(subscribe, getSnapshot);
  const { pathname } = useLocation();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      onClose?.();
    }
  }, [pathname, onClose]);

  const Variant = isDesktop ? Dialog : BottomSheet;
  return (
    <Variant open={open} onClose={onClose} title={title}>
      {children}
    </Variant>
  );
}
