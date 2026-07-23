// [V10] 아바타 · user.avatar(Blob URL) 있으면 이미지, 없거나 로드 실패 시 이름 이니셜(primary 원).
//   헤더 팝메뉴·모바일 Dock·Profile 공유. 크기는 size(px), 이니셜 폰트는 크기에 비례.
import { useState } from 'react';

export default function Avatar({ user, size = 32, className = '' }) {
  const [failed, setFailed] = useState(false);
  const initial = (user?.name?.[0] ?? '?').toUpperCase();
  const style = { width: size, height: size };
  if (user?.avatar && !failed) {
    return (
      <img
        src={user.avatar}
        alt=""
        onError={() => setFailed(true)}
        style={style}
        className={`shrink-0 rounded-pill bg-surface object-cover ${className}`}
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: Math.round(size * 0.42) }}
      className={`flex shrink-0 items-center justify-center rounded-pill bg-primary font-semibold text-white ${className}`}
    >
      {initial}
    </span>
  );
}
