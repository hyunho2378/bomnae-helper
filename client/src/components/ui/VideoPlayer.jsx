// 영상 + 상시 자막 — PATTERNS §10 기준 구현. 자막은 DOM 텍스트(언어 토글 연동),
// 17px는 DESIGN §12 명세값. 소스 영상에 자막 굽기 금지.
import { useLang } from '../../i18n/LangContext';

export default function VideoPlayer({ src, poster, captionKey }) {
  const { t } = useLang();
  return (
    <div className="relative">
      <video
        src={src}
        poster={poster}
        muted
        autoPlay
        playsInline
        loop
        className="aspect-video w-full object-cover"
      />
      <p className="absolute inset-x-0 bottom-0 bg-scrim px-16 py-12 text-[17px] leading-snug text-white">
        {t(captionKey)}
      </p>
    </div>
  );
}
