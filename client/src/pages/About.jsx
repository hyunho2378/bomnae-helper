// About · [H2-19] 크라우드펀딩 개편 — 어바웃.md 카피 전문 이식(brand.crowd 사전).
// 섹션 순서 = md 그대로: 1 Hook(BrandHero 재사용 · hero 값 교체) / 2 Problem & Brand Story /
// 3 Product Intro / 4 Core Strengths 4 / 5 Specs 표 / 6 Why Support / 7 Social Proof(#proof
// 기존 블록 보존 삽입) & FAQ(전부 펼침 · 아코디언 금지) / 8 Closing CTA(CtaBand · cta 값 교체).
// 이모지 0(아이콘은 lucide) · "Mobile App"→"Web platform" 사실 교정 · Tourism 표기 통일.
// 구 섹션(ProblemCards·WhatWeRun·DaySteps·LocalStories·StayLonger·BusinessModel)은 md 대체로
// 렌더 제거(컴포넌트 파일·brand 구 키는 보존 — 3언어 동형 유지).
import {
  Bus,
  Check,
  Globe,
  Handshake,
  HeartHandshake,
  MapPin,
  Smile,
  Store,
  Wallet,
} from 'lucide-react';
import BrandHero from '../components/brand/BrandHero';
import CtaBand from '../components/brand/CtaBand';
import ProofSection from '../components/brand/ProofSection';
import Section from '../components/layout/Section';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';

const STRENGTHS = [
  { key: 'routes', icon: MapPin },
  { key: 'cost', icon: Wallet },
  { key: 'local', icon: Handshake },
  { key: 'ease', icon: Smile },
];

const SPEC_ROWS = ['product', 'platform', 'languages', 'services', 'routes', 'booking', 'boarding', 'addon', 'target', 'revenue'];

const SUPPORT_ICONS = [Globe, Store, HeartHandshake, Bus];

// 불릿 리스트 · 무보더 원칙(마커는 lucide Check 소형)
function CheckList({ keys, iconSize = 16 }) {
  return (
    <ul className="flex flex-col gap-8">
      {keys.map((k) => (
        <li key={k} className="flex items-start gap-12">
          <Check size={iconSize} aria-hidden="true" className="mt-4 shrink-0 text-primary" />
          <LangSwap k={k} className="text-body text-inkSec" />
        </li>
      ))}
    </ul>
  );
}

export default function About() {
  const { t } = useLang();
  return (
    <div>
      {/* 1 · Hook(md) — BrandHero 마크업 재사용, hero.title/sub = md 카피 */}
      <BrandHero />

      {/* 2 · Problem Statement & Brand Story */}
      <Section id="story" title="brand.crowd.story.title">
        <div className="flex max-w-none flex-col gap-24">
          <p className="text-h3 font-medium text-inkSec">{t('brand.crowd.story.intro')}</p>
          <CheckList keys={[1, 2, 3, 4, 5].map((n) => `brand.crowd.story.b${n}`)} />
          <p className="text-body text-inkSec">{t('brand.crowd.story.outro1')}</p>
          <p className="text-body text-inkSec">{t('brand.crowd.story.outro2')}</p>
          <div className="flex flex-col gap-8">
            <LangSwap k="brand.crowd.story.missionLead" as="p" className="text-small font-semibold" />
            {/* 미션 인용 · 무보더 — surface 면 카드로 강조 */}
            <blockquote className="rounded-lg bg-surface p-24">
              <p className="font-display text-h3 font-bold">{t('brand.crowd.story.mission')}</p>
            </blockquote>
          </div>
        </div>
      </Section>

      {/* 3 · Product Introduction */}
      <Section id="product" title="brand.crowd.product.title">
        <div className="flex flex-col gap-24">
          <p className="text-h3 font-medium text-inkSec">{t('brand.crowd.product.body')}</p>
          <LangSwap k="brand.crowd.product.offersTitle" as="h3" className="text-body font-semibold" />
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex items-start gap-12">
                <Check size={16} aria-hidden="true" className="mt-4 shrink-0 text-primary" />
                <LangSwap k={`brand.crowd.product.o${n}`} className="text-body text-inkSec" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 4 · Core Strengths & Key Features(4카드 · 무보더 white + shadow.sm) */}
      <Section id="strengths" title="brand.crowd.strengths.title">
        <div className="grid gap-16 md:grid-cols-2 md:gap-24 lg:grid-cols-4">
          {STRENGTHS.map(({ key, icon: Icon }) => (
            <article key={key} className="flex flex-col gap-12 rounded-lg bg-white p-24 shadow-sm">
              <span
                aria-hidden="true"
                className="flex h-48 w-48 items-center justify-center rounded-pill bg-surface text-primary"
              >
                <Icon size={24} aria-hidden="true" />
              </span>
              <LangSwap k={`brand.crowd.strengths.cards.${key}.title`} as="h3" className="text-h3 font-semibold" />
              <LangSwap k={`brand.crowd.strengths.cards.${key}.body`} as="p" className="text-small text-inkSec" />
            </article>
          ))}
        </div>
      </Section>

      {/* 5 · Product Specifications(표 · 내부 구획은 line 디바이더만 · [H2-19②] Web platform 교정) */}
      <Section id="specs" title="brand.crowd.specs.title">
        <div className="overflow-x-auto rounded-lg bg-white p-24 shadow-sm">
          <dl className="flex flex-col divide-y divide-line">
            {SPEC_ROWS.map((row) => (
              <div key={row} className="flex flex-col gap-4 py-12 md:flex-row md:items-baseline md:gap-24">
                <LangSwap
                  k={`brand.crowd.specs.rows.${row}.k`}
                  as="dt"
                  className="shrink-0 text-caption font-semibold uppercase tracking-eyebrow text-inkMeta md:w-1/4"
                />
                <LangSwap k={`brand.crowd.specs.rows.${row}.v`} as="dd" className="text-body font-medium" />
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* 6 · Why Support GTS? */}
      <Section id="support" title="brand.crowd.support.title">
        <div className="flex flex-col gap-24">
          <p className="text-body font-medium text-inkSec">{t('brand.crowd.support.intro')}</p>
          <div className="grid gap-16 md:grid-cols-2">
            {SUPPORT_ICONS.map((Icon, i) => (
              <div key={`brand.crowd.support.i${i + 1}`} className="flex items-start gap-12">
                <span
                  aria-hidden="true"
                  className="flex h-40 w-40 shrink-0 items-center justify-center rounded-pill bg-surface text-primary"
                >
                  <Icon size={20} aria-hidden="true" />
                </span>
                <LangSwap k={`brand.crowd.support.i${i + 1}`} className="text-body text-inkSec" />
              </div>
            ))}
          </div>
          <p className="font-display text-h3 font-bold">{t('brand.crowd.support.outro')}</p>
        </div>
      </Section>

      {/* 7 · Social Proof 자리 = 기존 #proof 블록 보존 삽입(실운행 영상·지표·갤러리) */}
      <ProofSection />

      {/* 7b · FAQ 전부 펼침(아코디언 숨김 금지 · §16.10) */}
      <Section id="faq" title="brand.crowd.faq.title">
        <div className="grid gap-16 md:grid-cols-2 md:gap-24">
          <article className="flex flex-col gap-12 rounded-lg bg-white p-24 shadow-sm">
            <LangSwap k="brand.crowd.faq.q1.q" as="h3" className="text-h3 font-semibold" />
            <p className="text-small text-inkSec">{t('brand.crowd.faq.q1.a')}</p>
          </article>
          <article className="flex flex-col gap-12 rounded-lg bg-white p-24 shadow-sm">
            <LangSwap k="brand.crowd.faq.q2.q" as="h3" className="text-h3 font-semibold" />
            <CheckList keys={[1, 2, 3, 4, 5, 6].map((n) => `brand.crowd.faq.q2.i${n}`)} />
          </article>
          <article className="flex flex-col gap-12 rounded-lg bg-white p-24 shadow-sm">
            <LangSwap k="brand.crowd.faq.q3.q" as="h3" className="text-h3 font-semibold" />
            <p className="text-small text-inkSec">{t('brand.crowd.faq.q3.intro')}</p>
            <CheckList keys={[1, 2, 3, 4].map((n) => `brand.crowd.faq.q3.i${n}`)} />
            <p className="text-small font-semibold">{t('brand.crowd.faq.q3.outro')}</p>
          </article>
          <article className="flex flex-col gap-12 rounded-lg bg-white p-24 shadow-sm">
            <LangSwap k="brand.crowd.faq.q4.q" as="h3" className="text-h3 font-semibold" />
            <p className="text-small text-inkSec">{t('brand.crowd.faq.q4.intro')}</p>
            <CheckList keys={[1, 2, 3, 4, 5].map((n) => `brand.crowd.faq.q4.i${n}`)} />
          </article>
        </div>
      </Section>

      {/* 8 · Closing CTA(CtaBand 재사용 · cta 값 = md Closing) */}
      <CtaBand />
    </div>
  );
}
