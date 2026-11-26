/**
 * 싹딜 인터넷 가입 랜딩 - 최종 믹스 버전
 *
 * - 정보 흐름: 시안 1 (히어로 → 금액 구성 → 비교 → 가구별 견적 → 사은품 → 후기 → 3단계 → FAQ → 상담 신청)
 * - 디자인:    시안 2 (네이비·블루·골드 팔레트, Black Han Sans + IBM Plex Sans KR, 글래스 카드, 3D 아트)
 * - 외부 라이브러리 없음: React 내장 Hook + 순수 CSS(sakd-landing.css)만 사용
 *
 * 사용법
 *   import SakdLanding from "./SakdLanding";
 *   <SakdLanding assetBase="/assets/" />
 *   이미지는 assetBase 아래 3d/, brand/, gifts/ 폴더에 두면 됩니다.
 *
 * 실제 운영 전 바꿀 곳: 맨 위 CONFIG 블록(전화번호, 카카오 링크, 금액, 후기 등)과 submitLead() 함수
 */
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";

import "./sakd-landing.css";

/* =====================================================================
 * CONFIG - 운영 값은 여기서만 바꾸면 됩니다
 * ===================================================================== */
const SITE = {
  name: "싹딜",
  phone: "1588-0000",
  phoneTel: "15880000",
  hours: "평일 오전 9시 ~ 오후 7시",
  kakaoUrl: "#", // 카카오톡 채널 상담 링크
};

const NAV = [
  { id: "breakdown", label: "혜택 구성" },
  { id: "compare", label: "타사 비교" },
  { id: "quote", label: "우리 집 견적" },
  { id: "gifts", label: "사은품" },
  { id: "reviews", label: "고객 후기" },
  { id: "faq", label: "자주 묻는 질문" },
];

const TICKER = [
  "설치 당일 현금 지급",
  "차액 200% 보상",
  "인터넷 최대 138만원",
  "사은품 직접 선택",
  "상담만 받아도 괜찮아요",
];

const HERO_MAX = 138; // 만원

/* 금액 구성 (예시 수치 - 실제 운영 기준으로 교체) */
const BREAKDOWN = [
  { label: "현금 지원금", sub: "설치 당일 입금", amount: 68, unit: "만원", tone: "gold" },
  { label: "사은품", sub: "가전 1개 선택", amount: 40, unit: "만원 상당", tone: "blue" },
  { label: "휴대폰 결합 할인", sub: "3년 합계", amount: 30, unit: "만원", tone: "sky" },
] as const;

/* 타사 비교 (타사 수치는 자사 조사 기준) - accent: 금색 강조, secret: 강조 배경 */
const COMPARE = [
  { icon: "🌐", key: "인터넷+TV", other: "35만원", ours: "최대 47만원", sub: "통신사별 상이" },
  { icon: "📱", key: "휴대폰 개통", other: "40만원", ours: "50만원", sub: "USIM 개통 기준" },
  { icon: "🔒", key: "비밀지원금", other: "20만원", ours: "상담 시 공개", sub: "추가 지원금 별도 안내", accent: true, secret: true },
  { icon: "⚡", key: "지급 시점", other: "오후 마감 전\n설치 시 당일", otherSmall: true, ours: "1시간 내 입금", sub: "설치 완료 후 당일", accent: true },
  { icon: "🛡️", key: "차액 보상", other: "120~130%", ours: "200% 보상", sub: "차액의 2배", accent: true },
  { icon: "💰", key: "총 지원금액", other: "95만원", ours: `최대 ${HERO_MAX}만원`, sub: "" },
];
const COMPARE_NOTES = [
  "인터넷+TV 사은품은 통신사·상품별로 다릅니다 (SK 40만원 / KT 45만원 / LG U+ 47만원)",
  "타사업체 수치는 자사 조사 기준이며, 지급 조건 및 차액 보상 세부 기준은 상담 시 안내드립니다",
];

type Plan = {
  tab: string;
  product: string;
  speed: string;
  cash: number;
  fee: number;
  note: string;
};
const PLANS: Plan[] = [
  {
    tab: "1인 가구",
    product: "LG헬로비전 광랜라이트 인터넷",
    speed: "100Mbps",
    cash: 13,
    fee: 21890,
    note: "인터넷 단독 / 공유기 포함 / 3년 약정 · VAT 포함 · 휴대폰·카드 할인 제외 / 가입·설치 조건 상담 확인",
  },
  {
    tab: "2~3인",
    product: "LG헬로비전 기가라이트 인터넷 + TV",
    speed: "500Mbps",
    cash: 31,
    fee: 32890,
    note: "인터넷 + 헬로tv플러스(102채널) / 공유기 포함 / 3년 약정 · VAT 포함 · 휴대폰·카드 할인 제외 / 가입·설치 조건 상담 확인",
  },
  {
    tab: "가족",
    product: "LG헬로비전 플래티넘기가 인터넷 + TV",
    speed: "1Gbps",
    cash: 34,
    fee: 34100,
    note: "인터넷 + 헬로tv플러스(102채널) / 공유기 포함 / 3년 약정 · VAT 포함 · 휴대폰·카드 할인 제외 / 가입·설치 조건 상담 확인",
  },
];

const GIFTS = [
  { img: "gifts/gift-tv.webp", brand: "삼성전자", name: "43인치 4K UHD TV" },
  { img: "gifts/gift-vacuum.webp", brand: "LG전자", name: "오브제컬렉션 스틱청소기" },
  { img: "gifts/gift-purifier.webp", brand: "LG전자", name: "퓨리케어 AI 공기청정기" },
  { img: "gifts/gift-washer.webp", brand: "삼성전자", name: "드럼세탁기 9kg" },
];
const GIFTS_MORE = [
  { cat: "생활가전", name: "삼성 비스포크 무선청소기" },
  { cat: "주방가전", name: "쿠쿠 IH 전기압력밥솥" },
  { cat: "주방가전", name: "필립스 에어프라이어" },
  { cat: "상품권", name: "신세계 상품권" },
];

const REVIEWS = [
  {
    tag: "재약정 대신 신규",
    who: "문*환",
    text: "처음에는 그냥 재약정하려다가 이것저것 비교해 보고 신규로 바꿨어요. 설치까지 생각보다 간단해서 만족해요!",
  },
  {
    tag: "설명이 깔끔",
    who: "심*혁",
    text: "인터넷 가입 알아보면서 여기저기 문의했는데 설명이 깔끔해서 좋았습니다. 사은품도 빵빵합니다.",
  },
  {
    tag: "맞춤 추천",
    who: "박*하",
    text: "500메가랑 1기가 중에 고민했는데 사용 패턴에 맞춰서 알려주시더라고요. 괜히 비싼 걸로 안 해도 돼서 좋았어요.",
  },
  {
    tag: "빠른 설치",
    who: "문*희",
    text: "약정 끝나서 새로 가입했어요. 상담도 빠르고 설치 일정도 바로 잡혀서 생각보다 금방 끝났네요.",
  },
  {
    tag: "조건 비교",
    who: "하*석",
    text: "인터넷 어디서 해야 하나 한참 찾아봤는데 조건 비교해서 설명해 주셔서 결정하기 편했어요.",
  },
  {
    tag: "가족 결합",
    who: "홍*기",
    text: "가족 결합 때문에 어떤 게 나은지 헷갈렸는데 비교해서 알려주셔서 도움 됐어요.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "상담",
    body: "현금·사은품 금액을 가입 전에 확정해요",
    art: "3d/clipboard.webp",
  },
  { n: "02", title: "설치", body: "원하는 날짜에 기사님이 방문해요", art: "3d/calendar.webp" },
  {
    n: "03",
    title: "당일 지급",
    body: "설치 당일 고객님 계좌로 입금해요",
    art: "3d/moneybag.webp",
  },
];

const FAQS = [
  {
    q: `최대 ${HERO_MAX}만원은 누구나 받나요?`,
    a: "인터넷 + TV + 휴대폰 결합 기준 최대 금액이에요. 인터넷만 가입하셔도 현금 지원금은 받으실 수 있고, 내 조건의 정확한 금액은 상담에서 가입 전에 먼저 안내해 드려요.",
  },
  {
    q: "지원금은 정말 설치 당일 들어오나요?",
    a: "네. 설치가 완료된 당일 고객님 계좌로 입금해 드려요.",
  },
  {
    q: "차액 200% 보상은 어떻게 받나요?",
    a: "동일 날짜·동일 통신사·동일 요금제 기준으로 다른 업체가 더 높은 혜택을 제공하면, 그 차액의 200%를 추가로 보상해 드려요.",
  },
  {
    q: "통신사나 속도는 제가 골라야 하나요?",
    a: "아니요. 사용 패턴과 가구원 수를 듣고 상담사가 맞는 조건을 추천해 드려요.",
  },
  {
    q: "상담만 받고 가입 안 해도 되나요?",
    a: "물론이에요. 다른 곳과 충분히 비교해 보시고 결정하셔도 괜찮아요.",
  },
];

const PRODUCTS = [
  { value: "인터넷", art: "3d/router.webp" },
  { value: "인터넷 + TV", art: "gifts/gift-tv.webp" },
  { value: "휴대폰 결합", art: "3d/phone.webp" },
];

export type Lead = { product: string; name: string; phone: string; plan: string; from: string };

/** 상담 신청 전송. 실제 접수 API(구글 시트, 폼 서비스, 자체 서버 등)를 여기에 연결하세요. */
async function submitLead(lead: Lead): Promise<void> {
  // 예시: await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
  void lead;
  await new Promise((r) => setTimeout(r, 500));
}

/* =====================================================================
 * Hooks (React 내장 Hook만 사용)
 * ===================================================================== */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** 요소가 화면에 들어오면 true. once=true면 한 번 들어온 뒤로 계속 true */
function useInView<T extends Element>({ threshold = 0.2, once = true, rootMargin = "0px" } = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once, rootMargin]);
  return [ref, inView] as const;
}

/** 0(또는 이전 값)에서 target까지 숫자를 올리는 카운트업 */
function useCountUp(target: number, run: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    if (!run) return;
    if (prefersReducedMotion()) {
      from.current = target;
      setValue(target);
      return;
    }
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = start + (target - start) * eased;
      from.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return value;
}

/** 스크롤이 threshold(px)를 넘었는지 */
function useScrolledPast(threshold: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return past;
}

/** 메뉴·모달이 열려 있는 동안 배경 스크롤 잠금 */
function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [locked]);
}

/** Esc 키로 닫기 */
function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onEscape]);
}

/* =====================================================================
 * 작은 공용 컴포넌트
 * ===================================================================== */
type AssetFn = (path: string) => string;

function Art({
  src,
  size,
  className = "",
  eager = false,
}: {
  src: string;
  size: number;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={`sk-art ${className}`}
      decoding="async"
      height={size}
      loading={eager ? "eager" : "lazy"}
      src={src}
      width={size}
    />
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div
      className={`sk-reveal ${inView ? "is-in" : ""} ${className}`}
      id={id}
      ref={ref}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function CountUp({
  to,
  run,
  format = true,
  duration,
}: {
  to: number;
  run: boolean;
  format?: boolean;
  duration?: number;
}) {
  const v = useCountUp(to, run, duration);
  const n = Math.round(v);
  return <>{format ? n.toLocaleString("ko-KR") : n}</>;
}

function NumBadge({ n }: { n: string }) {
  return <span className="sk-num">{n}</span>;
}

function Chev() {
  return <span aria-hidden="true" className="sk-chev" />;
}

/** 높이 애니메이션이 있는 펼침 영역 (grid-template-rows 0fr → 1fr) */
function Collapse({ open, id, children }: { open: boolean; id: string; children: ReactNode }) {
  return (
    <div
      aria-hidden={!open}
      className={`sk-collapse ${open ? "is-open" : ""}`}
      id={id}
      inert={!open}
    >
      <div className="sk-collapse__inner">{children}</div>
    </div>
  );
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

/* =====================================================================
 * 상단: 진행 바 + 티커 + 헤더(모바일 메뉴 토글)
 * ===================================================================== */
function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return <div aria-hidden="true" className="sk-progress" ref={bar} />;
}

function Ticker() {
  return (
    <div className="sk-ticker">
      <p className="sk-sr">{TICKER.join(", ")}</p>
      <div aria-hidden="true" className="sk-ticker__track">
        {[0, 1].map((k) => (
          <span className="sk-ticker__set" key={k}>
            {TICKER.map((t) => (
              <span className="sk-ticker__item" key={t}>
                {t}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

function Header({ asset, onConsult }: { asset: AssetFn; onConsult: (from: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolledPast(40);
  const close = useCallback(() => setMenuOpen(false), []);
  useBodyLock(menuOpen);
  useEscape(menuOpen, close);

  return (
    <header className={`sk-header ${scrolled ? "is-solid" : ""} ${menuOpen ? "is-menu" : ""}`}>
      <div className="sk-header__bar">
        <a
          aria-label={`${SITE.name} 처음으로`}
          className="sk-header__logo"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            close();
            window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
          }}
        >
          <img alt={SITE.name} height={26} src={asset("brand/logo-white.webp")} width={52} />
        </a>
        <div className="sk-header__right">
          <button className="sk-header__cta" onClick={() => onConsult("header")} type="button">
            상담 신청
          </button>
          <button
            aria-controls="sk-menu"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            className="sk-burger"
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <nav aria-label="페이지 메뉴" className="sk-menu" id="sk-menu" inert={!menuOpen}>
        <ul className="sk-menu__list">
          {NAV.map((item, i) => (
            <li key={item.id} style={{ "--i": i } as CSSProperties}>
              <a
                className="sk-menu__link"
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  close();
                  scrollToId(item.id);
                }}
              >
                <NumBadge n={String(i + 1).padStart(2, "0")} />
                {item.label}
                <Chev />
              </a>
            </li>
          ))}
        </ul>
        <a className="sk-menu__call" href={`tel:${SITE.phoneTel}`}>
          전화 상담 <strong>{SITE.phone}</strong>
        </a>
      </nav>
      <button
        aria-hidden="true"
        className="sk-menu__dim"
        onClick={close}
        tabIndex={-1}
        type="button"
      />
    </header>
  );
}

/* =====================================================================
 * 1. 히어로 (마우스/터치 패럴랙스)
 * ===================================================================== */
function Hero({
  asset,
  onConsult,
  ctaRef,
}: {
  asset: AssetFn;
  onConsult: (from: string) => void;
  ctaRef: RefObject<HTMLButtonElement | null>;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const onMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion() || !stage.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    stage.current.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    stage.current.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };
  const onLeave = () => {
    stage.current?.style.setProperty("--mx", "0");
    stage.current?.style.setProperty("--my", "0");
  };

  return (
    <section
      className={`sk-hero ${mounted ? "is-in" : ""}`}
      id="hero"
      onPointerLeave={onLeave}
      onPointerMove={onMove}
    >
      <p className="sk-hero__chip">통신사 요금은 어디나 같아요. 다른 건 지원금뿐</p>
      <h1 className="sk-hero__title">
        <span className="sk-hero__line">인터넷 바꾸면</span>
        <span className="sk-hero__amount">
          <small>최대</small>
          <strong>
            <CountUp duration={1500} run={mounted} to={HERO_MAX} />
          </strong>
          <em>만원</em>
        </span>
      </h1>
      <a
        className="sk-hero__link"
        href="#breakdown"
        onClick={(e) => {
          e.preventDefault();
          scrollToId("breakdown");
        }}
      >
        인터넷 + TV + 휴대폰 결합 기준 · 구성 보기
      </a>

      <div aria-hidden="true" className="sk-hero__stage" ref={stage}>
        <span className="sk-hero__halo" />
        <Art className="sk-hero__router sk-layer" eager size={220} src={asset("3d/router.webp")} />
        <Art
          className="sk-hero__coins sk-layer sk-layer--far"
          eager
          size={110}
          src={asset("3d/coins.webp")}
        />
        <Art
          className="sk-hero__gift sk-layer sk-layer--near"
          eager
          size={96}
          src={asset("3d/gift.webp")}
        />
        <Art
          className="sk-hero__mascot sk-layer sk-layer--far"
          eager
          size={96}
          src={asset("brand/ssak-02.webp")}
        />
      </div>

      <ul className="sk-hero__chips">
        <li>⚡ 설치 당일 지급</li>
        <li>🛡 차액 200% 보상</li>
        <li>🎁 사은품 골라 받기</li>
      </ul>
      <button
        className="sk-btn sk-btn--glow"
        onClick={() => onConsult("hero")}
        ref={ctaRef}
        type="button"
      >
        내 지원금 확인하기
        <Chev />
      </button>
      <p className="sk-hero__sub">상담만 받아도 괜찮아요. 다 비교해 보고 마지막에 연락 주세요</p>
    </section>
  );
}

/* =====================================================================
 * 2. 138만원 구성 (막대 성장 + 카운트업)
 * ===================================================================== */
function Breakdown({ asset, onConsult }: { asset: AssetFn; onConsult: (from: string) => void }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const total = BREAKDOWN.reduce((s, b) => s + b.amount, 0);
  return (
    <section aria-labelledby="breakdown-title" className="sk-sec sk-sec--light" id="breakdown">
      <Reveal>
        <NumBadge n="01" />
        <p className="sk-eyebrow sk-eyebrow--ink">광고에서 본 그 금액</p>
        <h2 className="sk-title sk-title--ink" id="breakdown-title">
          {HERO_MAX}만원, <span className="sk-blue">이렇게</span> 받아요
        </h2>
      </Reveal>

      <div className={`sk-bd ${inView ? "is-in" : ""}`} ref={ref}>
        <div aria-hidden="true" className="sk-bd__bar">
          {BREAKDOWN.map((b, i) => (
            <span
              className={`sk-bd__seg sk-bd__seg--${b.tone}`}
              key={b.label}
              style={
                { "--w": `${(b.amount / total) * 100}%`, "--d": `${i * 160}ms` } as CSSProperties
              }
            />
          ))}
        </div>
        <dl className="sk-bd__list">
          {BREAKDOWN.map((b) => (
            <div className="sk-bd__row" key={b.label}>
              <dt>
                <i className={`sk-dot sk-dot--${b.tone}`} />
                {b.label}
                <small>{b.sub}</small>
              </dt>
              <dd>
                <CountUp run={inView} to={b.amount} />
                {b.unit}
              </dd>
            </div>
          ))}
          <div className="sk-bd__row sk-bd__row--total">
            <dt>최대 합계</dt>
            <dd>
              <CountUp duration={1600} run={inView} to={total} />
              만원
            </dd>
          </div>
        </dl>
        <p className="sk-fine">구성 금액은 예시 수치입니다. 실제 운영 기준으로 교체해 주세요.</p>
      </div>

      <Reveal className="sk-bd__note">
        <Art className="sk-float" size={72} src={asset("brand/ssak-01.webp")} />
        <p>
          인터넷만 쓰셔도 <strong>현금 지원금은 그대로</strong> 받아요. 내 조건 금액은 상담으로 1분
          만에 확인하세요.
        </p>
      </Reveal>
      <button className="sk-btn sk-btn--glow" onClick={() => onConsult("breakdown")} type="button">
        내 조건 금액 확인하기
        <Chev />
      </button>
    </section>
  );
}

/* =====================================================================
 * 3. 비교 (좌우 등장 + 체크 팝 + 타사 열 흐려짐)
 * ===================================================================== */
function Compare({ asset, onConsult }: { asset: AssetFn; onConsult: (from: string) => void }) {
  const [ref, inView] = useInView<HTMLTableElement>({ threshold: 0.25 });
  return (
    <section aria-labelledby="compare-title" className="sk-sec sk-sec--dark" id="compare">
      <Reveal>
        <NumBadge n="02" />
        <p className="sk-eyebrow">비교해 보세요</p>
        <h2 className="sk-title" id="compare-title">
          같은 인터넷,
          <br />
          받는 돈이 <span className="sk-gold">다릅니다</span>
        </h2>
        <p className="sk-lead">통신사 요금은 같고, 차이는 대리점이 정하는 지원금뿐이에요.</p>
      </Reveal>

      <table className={`sk-cmp ${inView ? "is-in" : ""}`} ref={ref}>
        <caption className="sk-sr">타사업체와 싹딜 지원금 비교</caption>
        <colgroup>
          <col className="sk-cmp__c-other" />
          <col className="sk-cmp__c-key" />
          <col className="sk-cmp__c-ours" />
        </colgroup>
        <thead>
          <tr>
            <th className="sk-cmp__h sk-cmp__h--other" scope="col">
              타사업체
            </th>
            <td />
            <th className="sk-cmp__h sk-cmp__h--ours" scope="col">
              <span className="sk-cmp__badge">혜택 최고 보장</span>
              <span className="sk-cmp__eng">OUR BENEFIT</span>
              싹딜
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARE.map((row, i) => {
            const last = i === COMPARE.length - 1;
            const cls = [last ? "sk-cmp__total" : "", row.secret ? "sk-cmp__secret" : ""].join(" ").trim();
            return (
              <tr className={cls || undefined} key={row.key} style={{ "--i": i } as CSSProperties}>
                <td className={`sk-cmp__other ${row.otherSmall ? "sk-cmp__other--small" : ""}`}>{row.other}</td>
                <th className="sk-cmp__key" scope="row">
                  <span aria-hidden="true" className="sk-cmp__icon">
                    {row.icon}
                  </span>
                  {row.key}
                </th>
                <td className="sk-cmp__ours">
                  <strong className={`sk-cmp__val ${row.accent || last ? "sk-cmp__val--gold" : ""}`}>
                    {last ? (
                      <>
                        <small className="sk-cmp__pre">최대</small>
                        {row.ours.replace(/^최대\s*/, "")}
                      </>
                    ) : (
                      row.ours
                    )}
                  </strong>
                  {row.sub ? <span className="sk-cmp__sub">{row.sub}</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Reveal className="sk-guard">
        <Art className="sk-guard__coins sk-float" size={64} src={asset("3d/coins.webp")} />
        <p className="sk-guard__title">
          더 받은 곳이 있다면?
          <br />
          <span className="sk-gold">차액의 2배</span>로 돌려드립니다
        </p>
      </Reveal>
      <ul className="sk-cmp__notes">
        {COMPARE_NOTES.map((n) => (
          <li key={n}>※ {n}</li>
        ))}
      </ul>
      <button className="sk-btn sk-btn--glow" onClick={() => onConsult("compare")} type="button">
        내 지원금 먼저 확인하기
        <Chev />
      </button>
      <button className="sk-textbtn" onClick={() => onConsult("compare-quote")} type="button">
        다른 곳 견적 받아 두셨나요? 비교해 드릴게요 ›
      </button>
    </section>
  );
}

/* =====================================================================
 * 4. 가구별 견적 (탭 전환 + 슬라이딩 필 + 금액 카운트업 + 조건 토글)
 * ===================================================================== */
function Quote({
  asset,
  onConsult,
}: {
  asset: AssetFn;
  onConsult: (from: string, plan?: string) => void;
}) {
  const [tab, setTab] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.25 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const plan = PLANS[tab];

  const select = (i: number) => {
    setTab(i);
    setNoteOpen(false);
  };
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (tab + dir + PLANS.length) % PLANS.length;
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="quote-title" className="sk-sec sk-sec--mist" id="quote" ref={ref}>
      <Reveal>
        <NumBadge n="03" />
        <h2 className="sk-title sk-title--ink" id="quote-title">
          우리 집은 <span className="sk-blue">얼마</span> 받을까요?
        </h2>
        <p className="sk-lead sk-lead--ink">가구에 맞는 추천 조건을 골라 보세요</p>
      </Reveal>

      <div
        aria-label="가구 유형"
        className="sk-tabs"
        onKeyDown={onKey}
        role="tablist"
        style={{ "--tab": tab, "--n": PLANS.length } as CSSProperties}
      >
        <span aria-hidden="true" className="sk-tabs__pill" />
        {PLANS.map((p, i) => (
          <button
            aria-controls={`${baseId}-panel`}
            aria-selected={tab === i}
            className="sk-tabs__btn"
            id={`${baseId}-tab-${i}`}
            key={p.tab}
            onClick={() => select(i)}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            tabIndex={tab === i ? 0 : -1}
            type="button"
          >
            {p.tab}
          </button>
        ))}
      </div>

      <article
        aria-labelledby={`${baseId}-tab-${tab}`}
        className="sk-plan"
        id={`${baseId}-panel`}
        role="tabpanel"
      >
        <div className="sk-plan__visual">
          <div className="sk-plan__swap" key={tab}>
            <p className="sk-plan__speed">{plan.speed}</p>
            <p className="sk-plan__product">{plan.product}</p>
            <p className="sk-plan__label">현금 지원금</p>
            <p className="sk-plan__cash">
              <CountUp run={inView} to={plan.cash} />
              <small>만원</small>
            </p>
          </div>
          <Art className="sk-plan__art sk-float" size={120} src={asset("3d/router.webp")} />
        </div>
        <div className="sk-plan__body">
          <p className="sk-pill-tag">+ 사은품 골라 받기</p>
          <div className="sk-plan__fee">
            <span>월 요금</span>
            <strong>
              <CountUp duration={900} run={inView} to={plan.fee} />원
            </strong>
          </div>
          <button
            aria-controls={`${baseId}-note`}
            aria-expanded={noteOpen}
            className={`sk-toggle ${noteOpen ? "is-open" : ""}`}
            onClick={() => setNoteOpen((v) => !v)}
            type="button"
          >
            조건 보기
            <span aria-hidden="true" className="sk-toggle__icon" />
          </button>
          <Collapse id={`${baseId}-note`} open={noteOpen}>
            <p className="sk-plan__note">{plan.note}</p>
          </Collapse>
          <button
            className="sk-btn sk-btn--glow"
            onClick={() => onConsult("quote", plan.tab)}
            type="button"
          >
            이 조건으로 상담받기
            <Chev />
          </button>
        </div>
      </article>
    </section>
  );
}

/* =====================================================================
 * 5. 사은품 (마우스 3D 틸트 + 전체 보기 시트)
 * ===================================================================== */
function tilt(e: ReactPointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
  el.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
}
function untilt(e: ReactPointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--ry", "0deg");
  e.currentTarget.style.setProperty("--rx", "0deg");
}

function Gifts({ asset, onOpenAll }: { asset: AssetFn; onOpenAll: () => void }) {
  return (
    <section aria-labelledby="gifts-title" className="sk-sec sk-sec--light" id="gifts">
      <Reveal>
        <NumBadge n="04" />
        <h2 className="sk-title sk-title--ink" id="gifts-title">
          사은품도 <span className="sk-blue">내가</span> 골라요
        </h2>
        <p className="sk-lead sk-lead--ink">가입하면 아래 중 1개를 무료로 드려요</p>
      </Reveal>
      <ul className="sk-gifts">
        {GIFTS.map((g, i) => (
          <li key={g.name}>
            <Reveal className="sk-gift" delay={i * 90}>
              <div className="sk-gift__card" onPointerLeave={untilt} onPointerMove={tilt}>
                <img
                  alt=""
                  className="sk-gift__img"
                  height={240}
                  loading="lazy"
                  src={asset(g.img)}
                  width={240}
                />
                <p className="sk-gift__brand">{g.brand}</p>
                <p className="sk-gift__name">{g.name}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
      <button className="sk-btn sk-btn--line" onClick={onOpenAll} type="button">
        사은품 전체 보기 <span className="sk-blue">+{GIFTS_MORE.length}종</span>
      </button>
      <p className="sk-fine sk-fine--center">
        가입 통신사에 따라 선택 가능한 사은품이 다를 수 있어요
      </p>
    </section>
  );
}

/* =====================================================================
 * 6. 후기 (자동 슬라이드 + 스와이프 + 점 내비게이션)
 * ===================================================================== */
function Reviews({ asset }: { asset: AssetFn }) {
  const n = REVIEWS.length;
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const [dragX, setDragX] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3, once: false });

  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (hold || !inView || prefersReducedMotion()) return;
    const t = window.setInterval(() => setIndex((v) => (v + 1) % n), 3800);
    return () => window.clearInterval(t);
  }, [hold, inView, n]);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    setHold(true);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) setDragX(e.clientX - drag.current.x);
  };
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    drag.current = null;
    setDragX(0);
    if (dx < -48) go(index + 1);
    else if (dx > 48) go(index - 1);
    if (e.pointerType !== "mouse") setHold(false);
  };

  return (
    <section aria-labelledby="reviews-title" className="sk-reviews" id="reviews">
      <div className="sk-reviews__top">
        <Art className="sk-reviews__trophy sk-float" size={150} src={asset("3d/trophy.webp")} />
        <NumBadge n="05" />
        <h2 className="sk-title" id="reviews-title">
          먼저 바꾼 분들의
          <br />
          <span className="sk-gold">이야기</span>
        </h2>
        <p className="sk-lead">싹딜에서 가입한 고객님 후기</p>
      </div>

      <div
        aria-roledescription="carousel"
        className="sk-slider"
        onBlur={() => setHold(false)}
        onFocus={() => setHold(true)}
        onMouseEnter={() => setHold(true)}
        onMouseLeave={() => setHold(false)}
        ref={ref}
      >
        <div
          className={`sk-slider__view ${dragX ? "is-drag" : ""}`}
          onPointerCancel={onUp}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
        >
          <ul
            aria-live={hold ? "polite" : "off"}
            className="sk-slider__track"
            style={{ transform: `translateX(calc(${index} * -1 * (86% + 12px) + ${dragX}px))` }}
          >
            {REVIEWS.map((r, i) => (
              <li
                aria-hidden={i !== index}
                aria-label={`${n}개 중 ${i + 1}번째 후기`}
                aria-roledescription="slide"
                className={`sk-review ${i === index ? "is-active" : ""}`}
                key={r.who + r.tag}
              >
                <div className="sk-review__head">
                  <Art size={44} src={asset("3d/chat.webp")} />
                  <span aria-label="별점 5점" className="sk-review__stars" role="img">
                    ★★★★★
                  </span>
                  <span className="sk-pill-tag">{r.tag}</span>
                </div>
                <p className="sk-review__text">{r.text}</p>
                <p className="sk-review__who">{r.who} 고객님</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="sk-slider__nav">
          <button
            aria-label="이전 후기"
            className="sk-slider__arrow"
            onClick={() => go(index - 1)}
            type="button"
          >
            ‹
          </button>
          <div className="sk-slider__dots">
            {REVIEWS.map((r, i) => (
              <button
                aria-current={i === index}
                aria-label={`${i + 1}번째 후기 보기`}
                className={`sk-slider__dot ${i === index ? "is-active" : ""}`}
                key={r.who + i}
                onClick={() => go(i)}
                type="button"
              />
            ))}
          </div>
          <button
            aria-label="다음 후기"
            className="sk-slider__arrow"
            onClick={() => go(index + 1)}
            type="button"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
 * 7. 진행 과정 3단계 (타임라인 선이 차오름)
 * ===================================================================== */
function Steps({ asset }: { asset: AssetFn }) {
  const [ref, inView] = useInView<HTMLOListElement>({ threshold: 0.3 });
  return (
    <section aria-labelledby="steps-title" className="sk-sec sk-sec--dark" id="steps">
      <Reveal>
        <NumBadge n="06" />
        <h2 className="sk-title" id="steps-title">
          신청부터 입금까지,
          <br />
          <span className="sk-gold">딱 3단계</span>
        </h2>
      </Reveal>
      <ol className={`sk-steps ${inView ? "is-in" : ""}`} ref={ref}>
        <span aria-hidden="true" className="sk-steps__line" />
        {STEPS.map((s, i) => (
          <li
            className={`sk-step ${i === STEPS.length - 1 ? "sk-step--last" : ""}`}
            key={s.n}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="sk-step__node">{s.n}</span>
            <div className="sk-step__card">
              <div>
                <h3 className="sk-step__title">{s.title}</h3>
                <p className="sk-step__text">{s.body}</p>
              </div>
              <Art size={84} src={asset(s.art)} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* =====================================================================
 * 8. FAQ (아코디언, 하나씩 열림)
 * ===================================================================== */
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();
  return (
    <section aria-labelledby="faq-title" className="sk-sec sk-sec--light" id="faq">
      <Reveal>
        <NumBadge n="07" />
        <h2 className="sk-title sk-title--ink" id="faq-title">
          신청 전에 궁금한 점
        </h2>
      </Reveal>
      <div className="sk-faq">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div className={`sk-faq__item ${isOpen ? "is-open" : ""}`} key={f.q}>
              <h3>
                <button
                  aria-controls={`${baseId}-a${i}`}
                  aria-expanded={isOpen}
                  className="sk-faq__q"
                  onClick={() => setOpen(isOpen ? null : i)}
                  type="button"
                >
                  <span className="sk-faq__mark">Q</span>
                  {f.q}
                  <span aria-hidden="true" className="sk-toggle__icon" />
                </button>
              </h3>
              <Collapse id={`${baseId}-a${i}`} open={isOpen}>
                <p className="sk-faq__a">{f.a}</p>
              </Collapse>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =====================================================================
 * 상담 신청 폼 (페이지 하단 + 바텀시트 공용)
 * ===================================================================== */
const PHONE_RE = /^01[016789]-\d{3,4}-\d{4}$/;
function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length < 11) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function LeadForm({
  asset,
  plan = "",
  from = "page",
}: {
  asset: AssetFn;
  plan?: string;
  from?: string;
}) {
  const uid = useId();
  const [product, setProduct] = useState(PRODUCTS[0].value);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [error, setError] = useState<{
    field: "name" | "phone" | "agree" | "send";
    text: string;
  } | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    if (name.trim().length < 2)
      return setError({ field: "name", text: "이름을 2자 이상 입력해 주세요." });
    if (!PHONE_RE.test(phone))
      return setError({
        field: "phone",
        text: "휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요.",
      });
    if (!agree) return setError({ field: "agree", text: "개인정보 수집·이용에 동의해 주세요." });
    setError(null);
    setStatus("sending");
    try {
      await submitLead({ product, name: name.trim(), phone, plan, from });
      setStatus("done");
    } catch {
      setStatus("idle");
      setError({
        field: "send",
        text: "신청을 보내지 못했어요. 잠시 후 다시 시도하거나 전화로 문의해 주세요.",
      });
    }
  };

  if (status === "done") {
    return (
      <div aria-live="polite" className="sk-form__done">
        <Art size={96} src={asset("brand/ssak-03.webp")} />
        <p className="sk-form__done-title">신청이 접수됐어요</p>
        <p className="sk-form__done-text">곧 상담사가 내 조건 지원금을 안내해 드릴게요.</p>
        <button
          className="sk-textbtn sk-textbtn--ink"
          onClick={() => {
            setStatus("idle");
            setName("");
            setPhone("");
            setAgree(false);
          }}
          type="button"
        >
          다시 작성하기
        </button>
      </div>
    );
  }

  return (
    <form className="sk-form" noValidate onSubmit={onSubmit}>
      {plan ? (
        <p className="sk-form__plan">
          선택한 조건: <strong>{plan}</strong>
        </p>
      ) : null}
      <fieldset className="sk-form__products">
        <legend className="sk-form__legend">관심 상품</legend>
        <div className="sk-form__tiles">
          {PRODUCTS.map((p) => (
            <label className="sk-tile" key={p.value}>
              <input
                checked={product === p.value}
                className="sk-tile__input"
                name={`${uid}-product`}
                onChange={() => setProduct(p.value)}
                type="radio"
                value={p.value}
              />
              <Art className="sk-tile__art" size={52} src={asset(p.art)} />
              <span className="sk-tile__label">{p.value}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="sk-field">
        <span className="sk-field__label">이름</span>
        <input
          aria-invalid={error?.field === "name"}
          autoComplete="name"
          className="sk-field__input"
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          value={name}
        />
      </label>
      <label className="sk-field">
        <span className="sk-field__label">연락처</span>
        <input
          aria-invalid={error?.field === "phone"}
          autoComplete="tel"
          className="sk-field__input"
          inputMode="numeric"
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="010-0000-0000"
          type="tel"
          value={phone}
        />
      </label>

      <div className={`sk-consent ${error?.field === "agree" ? "is-error" : ""}`}>
        <div className="sk-consent__row">
          <label className="sk-consent__label">
            <input
              checked={agree}
              className="sk-consent__check"
              onChange={(e) => setAgree(e.target.checked)}
              type="checkbox"
            />
            [필수] 개인정보 수집·이용 동의
          </label>
          <button
            aria-controls={`${uid}-term`}
            aria-expanded={termOpen}
            className="sk-consent__view"
            onClick={() => setTermOpen((v) => !v)}
            type="button"
          >
            {termOpen ? "닫기" : "보기"}
          </button>
        </div>
        <Collapse id={`${uid}-term`} open={termOpen}>
          <p className="sk-consent__term">
            수집 항목은 이름, 휴대폰 번호, 관심 상품이에요. 상담 안내 목적으로만 사용하고 상담이
            끝난 날부터 1년 뒤 파기해요.
          </p>
        </Collapse>
      </div>

      {error ? (
        <p className="sk-form__error" role="alert">
          {error.text}
        </p>
      ) : null}
      <button className="sk-btn sk-btn--glow" disabled={status === "sending"} type="submit">
        {status === "sending" ? "접수 중..." : "상담 신청하기"}
        {status === "sending" ? null : <Chev />}
      </button>
      <p className="sk-fine sk-fine--center">영업일 기준 순서대로 전화드려요</p>
    </form>
  );
}

/* =====================================================================
 * 9. 마지막 CTA + 폼
 * ===================================================================== */
function Apply({
  asset,
  sectionRef,
}: {
  asset: AssetFn;
  sectionRef: RefObject<HTMLElement | null>;
}) {
  return (
    <section
      aria-labelledby="apply-title"
      className="sk-sec sk-sec--deep sk-apply"
      id="apply"
      ref={sectionRef}
    >
      <Reveal className="sk-apply__card">
        <Art className="sk-apply__mascot sk-float" size={110} src={asset("brand/ssak-00.webp")} />
        <h2 className="sk-title sk-title--ink" id="apply-title">
          비교는 다 해 보세요.
          <br />
          마지막에 <span className="sk-blue">싹딜</span>에 물어보세요.
        </h2>
        <LeadForm asset={asset} from="apply" />
      </Reveal>
      <a className="sk-apply__phone" href={`tel:${SITE.phoneTel}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
        </svg>
        {SITE.phone}
      </a>
      <p className="sk-lead">{SITE.hours}</p>
    </section>
  );
}

function Footer({ asset }: { asset: AssetFn }) {
  return (
    <footer className="sk-foot">
      <img
        alt={SITE.name}
        className="sk-foot__logo"
        height={26}
        loading="lazy"
        src={asset("brand/logo-white.webp")}
        width={52}
      />
      <p>회사명: 싹딜 (오픈 전 입력) | 대표자: 오픈 전 입력</p>
      <p>사업자번호: 오픈 전 입력 | 주소: 오픈 전 입력</p>
      <p>
        대표번호 {SITE.phone} | {SITE.hours}
      </p>
      <p className="sk-foot__notice">
        표시된 금액은 가입 통신사·상품·결합 조건에 따라 달라질 수 있습니다. 상담 시 실제 지급 금액을
        안내해 드립니다.
      </p>
      <p className="sk-foot__copy">© 2026 {SITE.name}. ALL RIGHTS RESERVED.</p>
    </footer>
  );
}

/* =====================================================================
 * 바텀시트 모달 (진입/퇴장 애니메이션, Esc, 배경 클릭, 포커스 가두기)
 * ===================================================================== */
function Sheet({
  open,
  onClose,
  title,
  sub,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  const [render, setRender] = useState(open);
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement as HTMLElement | null;
      setRender(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const t = window.setTimeout(() => setRender(false), prefersReducedMotion() ? 0 : 320);
    lastFocus.current?.focus?.();
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (shown) panel.current?.focus();
  }, [shown]);

  useBodyLock(open);
  useEscape(open, onClose);

  const trap = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panel.current) return;
    const items = panel.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const visible = Array.from(items).filter((el) => !el.closest("[inert]"));
    if (!visible.length) return;
    const first = visible[0];
    const last = visible[visible.length - 1];
    if (
      e.shiftKey &&
      (document.activeElement === first || document.activeElement === panel.current)
    ) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!render) return null;
  return (
    <div className={`sk-sheet ${shown ? "is-open" : ""}`}>
      <button
        aria-label="닫기"
        className="sk-sheet__dim"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="sk-sheet__panel"
        onKeyDown={trap}
        ref={panel}
        role="dialog"
        tabIndex={-1}
      >
        <span aria-hidden="true" className="sk-sheet__grab" />
        <div className="sk-sheet__head">
          <div>
            <h3 className="sk-sheet__title" id={titleId}>
              {title}
            </h3>
            {sub ? <p className="sk-sheet__sub">{sub}</p> : null}
          </div>
          <button aria-label="닫기" className="sk-sheet__close" onClick={onClose} type="button">
            ×
          </button>
        </div>
        <div className="sk-sheet__body">{children}</div>
      </div>
    </div>
  );
}

/* =====================================================================
 * 하단 고정 CTA + 맨 위로
 * ===================================================================== */
function StickyCta({ show, onConsult }: { show: boolean; onConsult: (from: string) => void }) {
  return (
    <div className={`sk-sticky ${show ? "is-show" : ""}`} inert={!show}>
      <a aria-label="카카오톡 상담" className="sk-sticky__kakao" href={SITE.kakaoUrl}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.3.3.6.6.4l4.3-2.8c.5.1.9.1 1.4.1 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
        </svg>
      </a>
      <button
        className="sk-btn sk-btn--glow sk-btn--sweep"
        onClick={() => onConsult("sticky")}
        type="button"
      >
        내 지원금 1분 만에 확인하기
      </button>
    </div>
  );
}

function ToTop({ lifted }: { lifted: boolean }) {
  const show = useScrolledPast(900);
  return (
    <button
      aria-label="맨 위로"
      className={`sk-totop ${show ? "is-show" : ""} ${lifted ? "is-lifted" : ""}`}
      onClick={() =>
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })
      }
      tabIndex={show ? 0 : -1}
      type="button"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 5l-7 7m7-7l7 7M12 5v14" />
      </svg>
    </button>
  );
}

/* =====================================================================
 * 페이지 조립
 * ===================================================================== */
export default function SakdLanding({ assetBase = "/assets/" }: { assetBase?: string }) {
  const asset = useCallback<AssetFn>((p) => `${assetBase.replace(/\/?$/, "/")}${p}`, [assetBase]);

  const [sheet, setSheet] = useState({ open: false, from: "", plan: "" });
  const [giftsOpen, setGiftsOpen] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const heroCta = useRef<HTMLButtonElement>(null);
  const applyRef = useRef<HTMLElement>(null);

  const openConsult = useCallback((from: string, plan = "") => {
    setGiftsOpen(false);
    setSheet({ open: true, from, plan });
  }, []);
  const closeConsult = useCallback(() => setSheet((s) => ({ ...s, open: false })), []);
  const closeGifts = useCallback(() => setGiftsOpen(false), []);

  /* 히어로 버튼을 지나치면 하단 CTA 등장, 마지막 신청 폼이 보이면 숨김 */
  useEffect(() => {
    const cta = heroCta.current;
    const apply = applyRef.current;
    if (!cta || !apply || !("IntersectionObserver" in window)) return;
    let pastHero = false;
    let atApply = false;
    const sync = () => setShowSticky(pastHero && !atApply);
    const io1 = new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      sync();
    });
    const io2 = new IntersectionObserver(
      ([e]) => {
        atApply = e.isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );
    io1.observe(cta);
    io2.observe(apply);
    return () => {
      io1.disconnect();
      io2.disconnect();
    };
  }, []);

  return (
    <div className="sk" id="top">
      <ScrollProgress />
      <div className="sk-page">
        <Ticker />
        <Header asset={asset} onConsult={openConsult} />
        <main>
          <Hero asset={asset} ctaRef={heroCta} onConsult={openConsult} />
          <Breakdown asset={asset} onConsult={openConsult} />
          <Compare asset={asset} onConsult={openConsult} />
          <Quote asset={asset} onConsult={openConsult} />
          <Gifts asset={asset} onOpenAll={() => setGiftsOpen(true)} />
          <Reviews asset={asset} />
          <Steps asset={asset} />
          <Faq />
          <Apply asset={asset} sectionRef={applyRef} />
        </main>
        <Footer asset={asset} />
      </div>

      <StickyCta onConsult={openConsult} show={showSticky} />
      <ToTop lifted={showSticky} />

      <Sheet
        onClose={closeConsult}
        open={sheet.open}
        sub="상담사가 내 조건 실수령액을 알려 드려요"
        title="내 지원금 확인하기"
      >
        <LeadForm
          asset={asset}
          from={sheet.from}
          key={`${sheet.from}-${sheet.plan}`}
          plan={sheet.plan}
        />
      </Sheet>

      <Sheet
        onClose={closeGifts}
        open={giftsOpen}
        sub="가입하면 1개를 무료로 골라요"
        title="사은품 전체"
      >
        <ul className="sk-giftlist">
          {[
            ...GIFTS.map((g) => ({ cat: "대형가전", name: `${g.brand} ${g.name}` })),
            ...GIFTS_MORE,
          ].map((g) => (
            <li key={g.name}>
              <span>{g.name}</span>
              <small>{g.cat}</small>
            </li>
          ))}
        </ul>
        <p className="sk-fine">전체 목록은 예시입니다. 실제 사은품 목록으로 교체해 주세요.</p>
        <button
          className="sk-btn sk-btn--glow"
          onClick={() => openConsult("gift-sheet")}
          type="button"
        >
          이 중에서 골라 상담받기
          <Chev />
        </button>
      </Sheet>
    </div>
  );
}
