// 파일럿 증빙 · IA §2.8: 실운행 영상(자막 상시) + 지표 3개(Kanit Bold 숫자) + 갤러리.
// 전 값 PLACEHOLDER · 3~4일차 실운행 실측·촬영분으로 교체.
import { gallery, metrics } from '../data/pilot'; // api.js에 접근자 없음 · 직접 import(완료 보고 §5 질문)
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import VideoPlayer from '../components/ui/VideoPlayer';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

// PLACEHOLDER · 3~4일차 촬영 교체 (pilot.js 데이터에 video 필드 없음 · 페이지 상수로 관리)
const PILOT_VIDEO_SRC = '/videos/pilot-run.mp4';
const PILOT_VIDEO_POSTER = '/images/stops/pilot-1.jpg'; // PLACEHOLDER · 촬영 교체

export default function Pilot() {
  const { lang } = useLang();

  return (
    <div className="pb-64">
      <Section id="pilot-proof" eyebrow="pilot.eyebrow" title="pilot.title">
        <div className="flex flex-col gap-16">
          <LangSwap k="pilot.copy" as="p" className="text-h3 font-light text-inkSec" />
          {/* 실운행 영상 · muted autoplay loop + 상시 자막(DESIGN §12) */}
          <VideoPlayer
            src={PILOT_VIDEO_SRC}
            poster={PILOT_VIDEO_POSTER}
            captionKey="pilot.videoCaption"
          />
        </div>
      </Section>

      <Section id="pilot-metrics" eyebrow="pilot.metricsEyebrow" title="pilot.metricsTitle">
        <dl className="grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-24">
          {metrics.map((m) => (
            <div key={m.id} className="flex flex-col gap-4 rounded-md border border-line p-24">
              {/* 지표 숫자 · Kanit Bold(IA §2.8), 값 PLACEHOLDER 실측 교체 */}
              <dd className="font-display text-display font-bold tracking-display">{m.value}</dd>
              <dt className="text-small font-medium text-inkSec">
                {lang === 'ko' ? m.label_ko : m.label_en}
              </dt>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="pilot-gallery" eyebrow="pilot.galleryEyebrow" title="pilot.galleryTitle">
        <ul className="grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-24">
          {gallery.map((item) => (
            <li key={item.id}>
              <img
                src={item.photo}
                alt={lang === 'ko' ? item.alt_ko : item.alt_en}
                loading="lazy"
                className="aspect-video w-full rounded-md bg-surface object-cover"
              />
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
