// [V10] 팀 소개 · /team(공개). 첨부 슬라이드 레이아웃: TEAM 아이브로우 + 헤드라인 + 2행 3열 카드.
//   카드 = 사진(부재 시 이니셜 플레이스홀더) · 파란 이름(+CEO 배지) · 볼드 역할 · 기여 한 줄.
//   이름은 고유명사(data/team.js) · 역할/기여/헤드라인은 i18n(team.*) 3언어.
import { useState } from 'react';
import Container from '../components/layout/Container';
import LangSwap from '../i18n/LangSwap';
import { teamMembers } from '../data/team';

// 사진 · 부재/로드 실패 시 이니셜 플레이스홀더(surface 면 · 깨진 아이콘 금지)
function TeamPhoto({ src, name }) {
  const [failed, setFailed] = useState(false);
  const initial = (name[0] ?? '?').toUpperCase();
  return (
    <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-[64px] font-bold text-inkMeta">{initial}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

function MemberCard({ m }) {
  return (
    <article className="flex flex-col gap-16">
      <TeamPhoto src={m.photo} name={m.name} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-8">
          <h3 className="font-display text-h3 font-semibold text-primary">{m.name}</h3>
          {m.tag && (
            <span className="rounded-pill bg-primary/10 px-8 py-2 text-caption font-bold uppercase tracking-eyebrow text-primary">
              <LangSwap k={`team.${m.tag}`} />
            </span>
          )}
        </div>
        <LangSwap k={`team.members.${m.key}.role`} as="p" className="text-body font-bold" />
        <LangSwap k={`team.members.${m.key}.contribution`} as="p" className="text-small text-inkSec" />
      </div>
    </article>
  );
}

export default function Team() {
  return (
    <div className="bg-white">
      <Container>
        <div className="flex flex-col gap-40 pb-128 pt-96 lg:pb-[120px]">
          <div className="flex flex-col gap-16">
            <p className="text-caption font-semibold uppercase tracking-eyebrow text-primary">
              <LangSwap k="team.eyebrow" />
            </p>
            <LangSwap
              k="team.headline"
              as="h1"
              className="max-w-[900px] font-display text-[clamp(28px,3.4vw,44px)] font-bold leading-[1.15] tracking-display"
            />
          </div>
          <div className="grid gap-x-24 gap-y-40 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((m) => (
              <MemberCard key={m.key} m={m} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
