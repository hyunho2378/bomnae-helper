// 푸터 v3.1(DESIGN §6 전면 개정) · primary 풀블리드, 텍스트 white(메타 white 72%).
// G-Local 4컬럼: 브랜드 한 문장 / Explore / Contact / Team. 언어 토글 없음, 스트라이프 폐지.
// 최하단 바: © 좌측, Privacy·Terms 우측 새 탭(PATTERNS §17 · a 태그 유일 예외).
import { Link } from 'react-router-dom';
import LangSwap from '../../i18n/LangSwap';
import Container from '../layout/Container';

const EXPLORE = [
  { to: '/gate', k: 'nav.gate' },
  { to: '/loop', k: 'nav.loop' },
  { to: '/hands-free', k: 'nav.handsfree' },
  { to: '/about', k: 'nav.about' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <Container>
        <div className="grid grid-cols-1 gap-32 py-64 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-12">
            <span className="font-display text-h3 font-bold">Bomnae Helper</span>
            <LangSwap k="common.footer.tagline" as="p" className="text-small font-light opacity-70" />
          </div>
          <div className="flex flex-col gap-8">
            <LangSwap
              k="common.footer.explore"
              as="p"
              className="text-caption font-medium uppercase tracking-eyebrow opacity-70"
            />
            <ul className="flex flex-col gap-4">
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
              className="text-caption font-medium uppercase tracking-eyebrow opacity-70"
            />
            <a
              href="mailto:official@bomnaehelper.ac.kr"
              className="inline-flex min-h-44 items-center font-display text-small font-semibold"
            >
              official@bomnaehelper.ac.kr
            </a>
          </div>
          <div className="flex flex-col gap-8">
            <LangSwap
              k="common.footer.team"
              as="p"
              className="text-caption font-medium uppercase tracking-eyebrow opacity-70"
            />
            <LangSwap k="common.footer.teamName" as="p" className="text-small font-regular" />
          </div>
        </div>
        <div className="flex flex-col gap-12 pb-32 sm:flex-row sm:items-center sm:justify-between">
          <LangSwap k="common.footer.copyright" as="p" className="text-caption font-medium opacity-70" />
          <div className="flex items-center gap-24">
            {/* 내부 경로지만 새 탭 의도라 a 태그 허용(ROUTES §4의 유일 예외, PATTERNS §17) */}
            <a
              href="/legal/privacy"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-44 items-center text-caption font-medium"
            >
              <LangSwap k="common.footer.privacy" />
            </a>
            <a
              href="/legal/terms"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-44 items-center text-caption font-medium"
            >
              <LangSwap k="common.footer.terms" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
