import { useEffect, useState, type FormEvent } from "react";

import { submitLead } from "@/lib/api/leads.functions";
import { SITE } from "@/lib/site-config";

import { PHONE_RE, formatPhone, type Product } from "./shared";

type Choice = "internet" | "mobile" | "bundle";
const CHOICES: { value: Choice; label: string; products: Product[] }[] = [
  { value: "internet", label: "인터넷", products: ["internet"] },
  { value: "mobile", label: "휴대폰", products: ["mobile"] },
  { value: "bundle", label: "결합", products: ["internet", "mobile"] },
];

/** Bottom dock: call line + one-row quick consult form, always on screen. */
export function QuickBar() {
  const [product, setProduct] = useState<Choice | "">("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (message?.tone !== "ok") return;
    const t = window.setTimeout(() => setMessage(null), 5000);
    return () => window.clearTimeout(t);
  }, [message]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    let error = "";
    if (!product) error = "상담받을 상품을 골라 주세요.";
    else if (name.trim().length < 2) error = "이름을 2자 이상 입력해 주세요.";
    else if (!PHONE_RE.test(phone.trim())) error = "연락처를 010-1234-5678 형식으로 입력해 주세요.";
    else if (!consent) error = "개인정보 수집·이용에 동의해 주세요.";
    if (error) {
      setMessage({ tone: "error", text: error });
      return;
    }
    setSubmitting(true);
    try {
      await submitLead({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          products: CHOICES.find((c) => c.value === product)?.products ?? ["internet"],
          contactTime: "any",
          consent: true,
          source: "bar",
        },
      });
      setMessage({ tone: "ok", text: `${name.trim()}님, 접수됐어요. 곧 연락드릴게요.` });
      setProduct("");
      setName("");
      setPhone("");
      setConsent(false);
    } catch {
      setMessage({ tone: "error", text: "신청을 보내지 못했어요. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="qb">
      {message ? (
        <p className={`qb__msg qb__msg--${message.tone}`} role={message.tone === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      ) : null}
      <div className="qb__top">
        <a className="qb__call" href={`tel:${SITE.phoneTel}`}>
          <svg aria-hidden="true" className="qb__call-icon" viewBox="0 0 24 24">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
          </svg>
          {SITE.phone}
        </a>
        <label className="qb__consent">
          <input checked={consent} onChange={(e) => setConsent(e.target.checked)} type="checkbox" />
          <span>개인정보 수집·이용 동의</span>
        </label>
      </div>
      <form className="qb__form" noValidate onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="qb-product">상품</label>
        <select
          className="qb__field qb__select"
          id="qb-product"
          onChange={(e) => setProduct(e.target.value as Choice | "")}
          value={product}
        >
          <option value="">선택</option>
          {CHOICES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="qb-name">이름</label>
        <input
          autoComplete="name"
          className="qb__field"
          id="qb-name"
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          placeholder="성함"
          value={name}
        />
        <label className="sr-only" htmlFor="qb-phone">연락처</label>
        <input
          autoComplete="tel"
          className="qb__field"
          id="qb-phone"
          inputMode="numeric"
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="연락처"
          type="tel"
          value={phone}
        />
        <button className="qb__go" disabled={submitting} type="submit">
          {submitting ? "접수 중" : "상담신청"}
        </button>
      </form>
    </div>
  );
}
