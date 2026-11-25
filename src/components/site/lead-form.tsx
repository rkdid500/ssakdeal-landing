import { useRef, useState, type FormEvent } from "react";

import { submitLead } from "@/lib/api/leads.functions";

import { PHONE_RE, PRODUCTS, formatPhone, type Product } from "./shared";

type Field = "products" | "name" | "phone" | "privacy" | "third";
type Errors = Partial<Record<Field, string>>;

const TERMS = {
  privacy:
    "수집 항목: 이름, 휴대폰 번호, 관심 상품. 이용 목적: 상담 안내. 보유 기간: 상담 종료 후 1년.",
  third:
    "제공받는 자: 상담 상품의 통신사 및 개통 대리점. 제공 항목: 이름, 휴대폰 번호, 관심 상품. 목적: 가입 상담과 개통. 보유 기간: 목적 달성 후 즉시 파기.",
  marketing: "이벤트와 혜택 소식을 문자로 받아요. 언제든 수신을 거부할 수 있어요.",
} as const;

const FIELD_IDS: Record<Field, string> = {
  products: "lf-product-internet",
  name: "lf-name",
  phone: "lf-phone",
  privacy: "lf-privacy",
  third: "lf-third",
};

export function LeadForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [third, setThird] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [open, setOpen] = useState<keyof typeof TERMS | null>(null);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const doneRef = useRef<HTMLDivElement>(null);

  const all = privacy && third && marketing;

  function clear(field: Field) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function toggleProduct(value: Product) {
    setProducts((prev) => (prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]));
    clear("products");
  }

  function toggleAll() {
    const next = !all;
    setPrivacy(next);
    setThird(next);
    setMarketing(next);
    if (next) setErrors((prev) => ({ ...prev, privacy: undefined, third: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const next: Errors = {};
    if (products.length === 0) next.products = "상담받을 상품을 하나 이상 골라 주세요.";
    if (name.trim().length < 2) next.name = "이름을 2자 이상 입력해 주세요.";
    if (!PHONE_RE.test(phone.trim())) next.phone = "휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요.";
    if (!privacy) next.privacy = "개인정보 수집·이용에 동의해 주세요.";
    if (!third) next.third = "개인정보 제3자 제공에 동의해 주세요.";
    setErrors(next);
    const first = (Object.keys(FIELD_IDS) as Field[]).find((key) => next[key]);
    if (first) {
      document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }
    setStatus("submitting");
    try {
      await submitLead({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          products,
          contactTime: "any",
          consent: true,
          consentThird: true,
          marketing,
          source: "form",
          website,
        },
      });
      setStatus("success");
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setProducts([]);
    setName("");
    setPhone("");
    setPrivacy(false);
    setThird(false);
    setMarketing(false);
    setErrors({});
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <div className="lf-done" ref={doneRef} role="status" tabIndex={-1}>
        <p className="lf-done__title">상담 신청이 접수됐어요</p>
        <p className="lf-done__text">
          {name.trim()}님, 남겨주신 번호로 영업일 기준 하루 안에 연락드릴게요.
        </p>
        <button className="lf-done__again" onClick={reset} type="button">
          다른 번호로 다시 신청하기
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";
  const consentRows: { key: "privacy" | "third" | "marketing"; label: string; checked: boolean; set: (v: boolean) => void }[] = [
    { key: "privacy", label: "(필수) 개인정보 수집·이용 동의", checked: privacy, set: setPrivacy },
    { key: "third", label: "(필수) 개인정보 제3자 제공 동의", checked: third, set: setThird },
    { key: "marketing", label: "(선택) 마케팅 정보 수신 동의", checked: marketing, set: setMarketing },
  ];

  return (
    <form className="lf" noValidate onSubmit={handleSubmit}>
      <fieldset
        aria-describedby={errors.products ? "lf-products-error" : undefined}
        className="lf__products"
      >
        <legend className="sr-only">관심 상품 (여러 개 선택 가능)</legend>
        {PRODUCTS.map((p) => (
          <label className="lf-tile" key={p.value}>
            <input
              checked={products.includes(p.value)}
              className="lf-tile__input"
              id={`lf-product-${p.value}`}
              onChange={() => toggleProduct(p.value)}
              type="checkbox"
            />
            <img alt="" aria-hidden="true" className="lf-tile__art" height={64} loading="lazy" src={p.art} width={64} />
            <span className="lf-tile__label">{p.label}</span>
          </label>
        ))}
      </fieldset>
      <p className="lf__hint">둘 다 고르면 결합 할인까지 함께 계산해 드려요.</p>
      {errors.products ? <p className="lf__error" id="lf-products-error">{errors.products}</p> : null}

      <div className="lf-row">
        <label className="lf-row__label" htmlFor="lf-name">이름</label>
        <input
          aria-describedby={errors.name ? "lf-name-error" : undefined}
          aria-invalid={errors.name ? true : undefined}
          autoComplete="name"
          className="lf-row__input"
          id="lf-name"
          maxLength={20}
          onChange={(e) => {
            setName(e.target.value);
            clear("name");
          }}
          placeholder="이름을 입력해 주세요"
          value={name}
        />
      </div>
      {errors.name ? <p className="lf__error" id="lf-name-error">{errors.name}</p> : null}

      <div className="lf-row">
        <label className="lf-row__label" htmlFor="lf-phone">연락처</label>
        <input
          aria-describedby={errors.phone ? "lf-phone-error" : undefined}
          aria-invalid={errors.phone ? true : undefined}
          autoComplete="tel"
          className="lf-row__input"
          id="lf-phone"
          inputMode="numeric"
          onChange={(e) => {
            setPhone(formatPhone(e.target.value));
            clear("phone");
          }}
          placeholder="연락처를 입력해 주세요"
          type="tel"
          value={phone}
        />
      </div>
      {errors.phone ? <p className="lf__error" id="lf-phone-error">{errors.phone}</p> : null}

      <div aria-hidden="true" className="lf__trap">
        <label htmlFor="lf-website">웹사이트</label>
        <input autoComplete="off" id="lf-website" onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} value={website} />
      </div>

      <div className="lf-consent">
        <label className="lf-consent__all">
          <input checked={all} className="lf-check" onChange={toggleAll} type="checkbox" />
          <span>전체 동의</span>
        </label>
        <ul className="lf-consent__list">
          {consentRows.map((row) => (
            <li className="lf-consent__item" key={row.key}>
              <div className="lf-consent__row">
                <label className="lf-consent__label">
                  <input
                    aria-invalid={row.key !== "marketing" && errors[row.key] ? true : undefined}
                    checked={row.checked}
                    className="lf-check"
                    id={row.key === "marketing" ? "lf-marketing" : FIELD_IDS[row.key]}
                    onChange={(e) => {
                      row.set(e.target.checked);
                      if (row.key !== "marketing") clear(row.key);
                    }}
                    type="checkbox"
                  />
                  <span>{row.label}</span>
                </label>
                <button
                  aria-controls={`lf-term-${row.key}`}
                  aria-expanded={open === row.key}
                  className="lf-consent__view"
                  onClick={() => setOpen(open === row.key ? null : row.key)}
                  type="button"
                >
                  {open === row.key ? "닫기" : "보기"}
                </button>
              </div>
              {open === row.key ? (
                <p className="lf-consent__term" id={`lf-term-${row.key}`}>{TERMS[row.key]}</p>
              ) : null}
            </li>
          ))}
        </ul>
        {errors.privacy || errors.third ? (
          <p className="lf__error">{errors.privacy ?? errors.third}</p>
        ) : null}
      </div>

      {status === "error" ? (
        <p className="lf__alert" role="alert">
          신청을 보내지 못했어요. 잠시 후 다시 눌러 주시거나 전화로 문의해 주세요.
        </p>
      ) : null}

      <button aria-busy={submitting} className="lf-submit" disabled={submitting} type="submit">
        {submitting ? "보내는 중" : "싹딜 혜택 상담 신청하기"}
        {submitting ? null : <span aria-hidden="true" className="lf-submit__chev" />}
      </button>
    </form>
  );
}
