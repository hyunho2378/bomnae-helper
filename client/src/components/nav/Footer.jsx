// 푸터 v3.2(DESIGN §16.5 압축) · primary 풀블리드, 세로 2단, 데스크탑 240px 이내.
// 1단: 로고+한 문장 / Explore 가로 나열 / Contact 이메일. 2단: © + Team 5 | Privacy · Terms(새 탭).
// 대회 풀네임·주소성 텍스트 금지. 언어 진입점은 헤더 LangMenu 단일.
import { Link } from 'react-router-dom';
import LangSwap from '../../i18n/LangSwap';
import Container from '../layout/Container';

const EXPLORE = [
  { to: '/about', k: 'nav.about' },
  { to: '/gate', k: 'nav.gate' },
  { to: '/hands-free', k: 'nav.handsfree' },
  { to: '/loop', k: 'nav.loop' },
];

export default function Footer() {
  return (
    <footer className="max-h-240 bg-primary text-white">
      <Container>
        <div className="flex flex-col gap-24 py-32 lg:flex-row lg:items-start lg:justify-between lg:gap-40">
          <div className="flex flex-col gap-8">
            <span className="font-display text-logo font-bold">Bomnae Helper</span>
            <LangSwap k="common.footer.tagline" as="p" className="text-small font-regular" />
          </div>
          <div className="flex flex-col gap-8">
            <LangSwap
              k="common.footer.explore"
              as="p"
              className="text-caption font-semibold uppercase tracking-eyebrow"
            />
            <ul className="flex flex-wrap items-center gap-x-24 gap-y-4">
              {EXPLORE.map(({ to, k }) => (
                <li key={to}>
                  <Link to={to} className="inline-flex min-h-44 items-center text-small font-semibold">
                    <LangSwap k={k} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-8">
            <LangSwap
              k="common.footer.contact"
              as="p"
              className="text-caption font-semibold uppercase tracking-eyebrow"
            />
            <a
              href="mailto:official@bomnaehelper.ac.kr"
              className="inline-flex min-h-44 items-center font-display text-small font-semibold"
            >
              official@bomnaehelper.ac.kr
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-8 pb-24 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-baseline gap-x-12 text-caption font-regular">
            <LangSwap k="common.footer.copyright" />
            <LangSwap k="common.footer.team" className="font-semibold" />
          </p>
          <div className="flex items-center gap-24">
            {/* 내부 경로지만 새 탭 의도라 a 태그 허용(PATTERNS §17 유일 예외) */}
            <a
              href="/legal/privacy"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-44 items-center text-caption font-semibold"
            >
              <LangSwap k="common.footer.privacy" />
            </a>
            <a
              href="/legal/terms"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-44 items-center text-caption font-semibold"
            >
              <LangSwap k="common.footer.terms" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
