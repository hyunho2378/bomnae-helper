// 스토리 클립 · IA §2.5 블록 3: 차내에서 보게 될 사장님 스토리 미리보기.
// 영상 있으면 VideoPlayer(자막 상시), 없으면 썸네일 + 요약 카드(CC_PROMPT_3 §3).
// 모바일 가로 스크롤 / lg 3열(COMPONENTS C).
// v3.2(§8.3.3): 빈 이미지 박스 0 · 썸네일 없거나 로드 실패 시 미디어 박스 비렌더(텍스트만).
import { useState } from 'react';
import { useLang } from '../../i18n/LangContext';
import VideoPlayer from '../ui/VideoPlayer';

export default function StoryClips({ stories }) {
  const { lang } = useLang();
  // 로드 실패 썸네일 id 집합 · 실패 시 박스 비렌더(§8.3.3)
  const [failed, setFailed] = useState(() => new Set());
  const markFailed = (id) =>
    setFailed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

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
            // 썸네일 없음·로드 실패 시 미디어 박스 비렌더(빈 이미지 박스 0 · §8.3.3)
            story.thumb &&
            !failed.has(story.id) && (
              <img
                src={story.thumb}
                alt=""
                loading="lazy"
                onError={() => markFailed(story.id)}
                className="aspect-video w-full bg-surface object-cover"
              />
            )
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
