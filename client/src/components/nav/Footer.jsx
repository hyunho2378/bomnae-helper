// 푸터 v3.2(DESIGN §16.5 압축) · primary 풀블리드, 세로 2단.
// 240px 캡은 Explore 세로 나열(사용자 지시)과 양립 불가라 해제 — DESIGN §16.5에 반영.
// 1단: 로고+한 문장 / Explore 세로 나열 / Contact 이메일(우측 인셋). 2단: © | Privacy · Terms(새 탭).
// 대회 풀네임·주소성 텍스트 금지. 언어 진입점은 헤더 LangMenu 단일.
import { Link } from 'react-router-dom';
import LangSwap from '../../i18n/LangSwap';
import Container from '../layout/Container';
import { useLang } from '../../i18n/LangContext';
import LogoMark from '../../assets/logo-mark.svg?react';

// [V10] Explore: About 제거([3]) · Travel Log를 Reviews 위에 추가([5]).
const EXPLORE = [
  { to: '/gate', k: 'nav.gate' },
  { to: '/gts', k: 'nav.gts' },
  { to: '/travel-log', k: 'nav.travelLog' },
  { to: '/reviews', k: 'nav.reviews' },
];

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-primary text-white">
      <Container>
        <div className="flex flex-col gap-24 py-32 lg:flex-row lg:items-start lg:justify-between lg:gap-40">
          <div className="flex flex-col gap-8">
            <span className="flex items-center gap-8">
              <LogoMark className="h-24 w-24 shrink-0 text-white" aria-hidden="true" />
              <span className="font-display text-logo font-semibold">Global Tourism System</span>
            </span>
            <LangSwap k="common.footer.tagline" as="p" className="text-small font-medium" />
          </div>
          <div className="flex flex-col gap-8">
            <LangSwap
              k="common.footer.explore"
              as="p"
              className="text-caption font-semibold uppercase tracking-eyebrow"
            />
            <ul className="flex flex-col">
              {EXPLORE.map(({ to, k }) => (
                <li key={to}>
                  <Link to={to} className="inline-flex min-h-44 items-center text-small font-semibold">
                    <LangSwap k={k} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-8 lg:mr-96">
            <LangSwap
              k="common.footer.contact"
              as="p"
              className="text-caption font-semibold uppercase tracking-eyebrow"
            />
            <a
              href="mailto:official@gts.ac.kr"
              className="inline-flex min-h-44 items-center font-display text-small font-semibold"
            >
              official@gts.ac.kr
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-8 pb-24 sm:flex-row sm:items-center sm:justify-between">
          {/* [V10] "Team Bomnae Helper"를 /team 링크로 · 앞뒤 텍스트는 pre/post(t로 유령폭 회피) */}
          <p className="text-caption font-medium">
            {t('common.footer.copyrightPre')}
            <Link to="/team" className="font-semibold underline underline-offset-2 hover:opacity-80">
              {t('common.footer.teamName')}
            </Link>
            {t('common.footer.copyrightPost')}
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
