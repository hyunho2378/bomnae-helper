// 푸터 v3.2(DESIGN §16.5 압축) · primary 풀블리드, 세로 2단.
// 240px 캡은 Explore 세로 나열(사용자 지시)과 양립 불가라 해제 — DESIGN §16.5에 반영.
// 1단: 로고+한 문장 / Explore 세로 나열 / Contact 이메일(우측 인셋). 2단: © | Privacy · Terms(새 탭).
// 대회 풀네임·주소성 텍스트 금지. 언어 진입점은 헤더 LangMenu 단일.
import { Link } from 'react-router-dom';
import LangSwap from '../../i18n/LangSwap';
import Container from '../layout/Container';
import LogoMark from '../../assets/logo-mark.svg?react';

// v4(IA §9.1): 내비 3항목과 동일 세트 — 퇴역 라우트 링크 잔존 금지
const EXPLORE = [
  { to: '/about', k: 'nav.about' },
  { to: '/gate', k: 'nav.gate' },
  { to: '/gts', k: 'nav.gts' },
];

export default function Footer() {
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
          <p className="text-caption font-medium">
            <LangSwap k="common.footer.copyright" />
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
