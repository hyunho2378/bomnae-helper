// STUB 확장 · AGENT-2. 기준: IA §2.3, COMPONENTS.md 섹션 B.
// 폼(Stepper 수하물 / 터미널·날짜 / 숙소 주소 / 이메일) → 개당 요금 합계(DRAFT)
// → 확정 버튼에서만 LoginGate(Guest-first, ROUTES §3) → createHandsFree → 접수 코드 화면.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LangContext';
import LangSwap from '../i18n/LangSwap';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import LoginGate from '../components/ui/LoginGate';
import Stepper from '../components/ui/Stepper';
import { createHandsFree } from '../data/api';

const PRICE_PER_BAG = 25000; // DRAFT · 5일차 BM 검토 확정(IA §4)
const TERMINALS = ['t1', 't2', 'gmp']; // gateRoutes planGate 키와 동일 계약

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function HandsFree() {
  const { t } = useLang();
  const { user } = useAuth();
  const [bags, setBags] = useState(1);
  const [terminal, setTerminal] = useState('t1');
  const [date, setDate] = useState(localToday());
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [gateOpen, setGateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);

  const total = bags * PRICE_PER_BAG;

  const validate = () => {
    const next = {};
    if (!date) next.date = true;
    if (!address.trim()) next.address = true;
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitOrder = async () => {
    setSubmitting(true);
    // api.js는 전부 async · await 계약(PROGRESS 인수인계 노트)
    const result = await createHandsFree({ terminal, date, bags, address, email, total });
    setOrder(result);
    setSubmitting(false);
  };

  const confirm = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (user) submitOrder();
    else setGateOpen(true);
  };

  return (
    <div className="pb-64 pt-48 lg:pt-128">
      <Container>
        <div className="mx-auto w-full max-w-dialog">
          {/* 접수 상태 변경 알림 영역 · DESIGN §14 aria-live polite */}
          <div aria-live="polite">
            {order ? (
              <div className="flex flex-col items-center gap-16 rounded-md border border-line p-32 text-center">
                <BadgeCheck size={48} aria-hidden="true" className="text-primary" />
                <LangSwap k="handsfree.success.title" as="h1" className="text-h2 font-semibold" />
                <LangSwap
                  k="handsfree.success.codeLabel"
                  as="p"
                  className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
                />
                <p className="font-display text-h1 font-bold tracking-display">{order.code}</p>
                <LangSwap k="handsfree.success.body" as="p" className="text-small text-inkSec" />
                <Button as={Link} to="/">
                  <LangSwap k="handsfree.success.home" />
                </Button>
              </div>
            ) : (
              <>
                <LangSwap
                  k="nav.gate"
                  as="p"
                  className="text-caption font-medium uppercase tracking-eyebrow text-inkMeta"
                />
                <LangSwap k="handsfree.title" as="h1" className="mt-8 text-h1 font-bold tracking-display" />
                {/* 기존 수하물 딜리버리 사업자 제휴 · 춘천 구간 예약 레이어(정직 표기, IA §2.3) */}
                <LangSwap k="handsfree.intro" as="p" className="mt-16 text-body text-inkSec" />

                <form noValidate onSubmit={confirm} className="mt-32 flex flex-col gap-24">
                  <div className="rounded-md border border-line bg-white p-24">
                    <Stepper value={bags} min={1} onChange={setBags} label="handsfree.form.bags" />
                  </div>

                  <label className="flex flex-col gap-8">
                    <LangSwap k="gate.form.terminal" className="text-small font-medium" />
                    <select
                      value={terminal}
                      onChange={(e) => setTerminal(e.target.value)}
                      className="h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary"
                    >
                      {TERMINALS.map((id) => (
                        <option key={id} value={id}>
                          {t(`gate.form.terminals.${id}`)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-8">
                    <LangSwap k="gate.form.date" className="text-small font-medium" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setErrors((prev) => ({ ...prev, date: false }));
                      }}
                      aria-invalid={Boolean(errors.date)}
                      aria-describedby={errors.date ? 'handsfree-date-error' : undefined}
                      className={`h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary ${
                        errors.date ? 'ring-2 ring-spice' : ''
                      }`}
                    />
                    {errors.date && (
                      <p id="handsfree-date-error" className="text-small text-spice">
                        {t('handsfree.form.errors.date')}
                      </p>
                    )}
                  </label>

                  <label className="flex flex-col gap-8">
                    <LangSwap k="handsfree.form.address" className="text-small font-medium" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setErrors((prev) => ({ ...prev, address: false }));
                      }}
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={errors.address ? 'handsfree-address-error' : undefined}
                      className={`h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary ${
                        errors.address ? 'ring-2 ring-spice' : ''
                      }`}
                    />
                    {errors.address && (
                      <p id="handsfree-address-error" className="text-small text-spice">
                        {t('handsfree.form.errors.address')}
                      </p>
                    )}
                  </label>

                  <label className="flex flex-col gap-8">
                    <LangSwap k="handsfree.form.email" className="text-small font-medium" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: false }));
                      }}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'handsfree-email-error' : undefined}
                      className={`h-48 rounded-md bg-surface px-16 text-body focus:ring-2 focus:ring-primary ${
                        errors.email ? 'ring-2 ring-spice' : ''
                      }`}
                    />
                    {errors.email && (
                      <p id="handsfree-email-error" className="text-small text-spice">
                        {t('handsfree.form.errors.email')}
                      </p>
                    )}
                  </label>

                  <div className="flex flex-col gap-8 border-t border-line pt-24">
                    <p className="flex items-baseline justify-between text-small text-inkSec">
                      <LangSwap k="handsfree.form.perBag" />
                      <span className="font-display font-semibold">
                        {t('common.currency')}
                        {PRICE_PER_BAG.toLocaleString('en-US')}
                      </span>
                    </p>
                    <p className="flex items-baseline justify-between">
                      <LangSwap k="booking.total" className="text-small font-medium" />
                      <span className="font-display text-h2 font-bold">
                        {t('common.currency')}
                        {total.toLocaleString('en-US')}
                      </span>
                    </p>
                  </div>

                  <Button type="submit" disabled={submitting}>
                    <LangSwap k="handsfree.form.submit" />
                    {submitting && (
                      <Loader2 size={16} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </Container>

      <LoginGate open={gateOpen} onClose={() => setGateOpen(false)} onSuccess={submitOrder} />
    </div>
  );
}
