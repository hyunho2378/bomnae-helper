// 스토리 클립 · IA §2.5 블록 3: 차내에서 보게 될 사장님 스토리 미리보기.
// 영상 있으면 VideoPlayer(자막 상시), 없으면 썸네일 + 요약 카드(CC_PROMPT_3 §3).
// 모바일 가로 스크롤 / lg 3열(COMPONENTS C).
import { useLang } from '../../i18n/LangContext';
import VideoPlayer from '../ui/VideoPlayer';

export default function StoryClips({ stories }) {
  const { lang } = useLang();

  return (
    <ul className="-mx-20 flex snap-x gap-16 overflow-x-auto px-20 pb-8 md:-mx-32 md:px-32 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-24 lg:overflow-visible lg:px-0 lg:pb-0">
      {stories.map((story) => (
        // v3.1 무보더 · 카드 깊이는 shadow.sm, radius 카드 스케일 lg(DESIGN §7)
        <li
          key={story.id}
          className="w-full shrink-0 basis-4/5 snap-start overflow-hidden rounded-lg bg-white shadow-sm sm:basis-1/2 lg:basis-auto"
        >
          {story.video_url ? (
            // 촬영분 수급 후 경로: 자막 상시(DESIGN §12)
            <VideoPlayer
              src={story.video_url}
              poster={story.thumb}
              captionKey="loop.detail.clipCaption"
            />
          ) : (
            <img
              src={story.thumb}
              alt=""
              loading="lazy"
              className="aspect-video w-full bg-surface object-cover"
            />
          )}
          <div className="flex flex-col gap-8 p-16">
            <h3 className="text-body font-semibold">
              {lang === 'ko' ? story.title_ko : story.title_en}
            </h3>
            {/* 요약 · 데이터 본문(시프트 허용 영역) */}
            <p className="line-clamp-2 text-small font-regular text-inkSec">
              {lang === 'ko' ? story.summary_ko : story.summary_en}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
