/**
 * 싹딜 인터넷 가입 랜딩 - 최종 버전 (반응형)
 *
 * - 정보 흐름: 히어로 → 타사 비교 → 선택 이유 → 사은품 → 후기 → 3단계 → FAQ → 상담 신청 (+ 하단 고정 상담 바)
 * - 디자인:    최싸몰 벤치마킹 랜딩형. 딥 네이비 + 블루 단일 강조, 본문 Pretendard · 광고 문구 G마켓 산스
 * - 반응형:    모바일 우선, 768px(태블릿)·1024px(데스크톱)에서 레이아웃 전환
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

/* 맨 위 한 줄 띠에 번갈아 나오는 문구 */
const STRIP = ["같은 인터넷이라도, 받는 돈은 다르게", "설치 당일 1시간 이내 입금 완료", "더 받은 곳이 있다면 차액 200% 보장"];

const HERO_MAX = 138; // 만원

const TRUST = [
  { icon: "bolt", label: "설치 후 1시간 내 입금" },
  { icon: "shield", label: "차액 200% 보상" },
  { icon: "users", label: "누적 상담 3만명+" },
] as const;

/* 히어로 오른쪽(모바일은 아래)에서 흐르는 혜택 카드 */
type HeroItem = { kind: "card"; label: string; amount: string; art: string } | { kind: "tile"; art: string; tone: "blue" | "sky" };
const HERO_CARDS: HeroItem[] = [
  { kind: "card", label: "인터넷+TV", amount: "47만원", art: "3d/router.webp" },
  { kind: "tile", art: "3d/gift.webp", tone: "sky" },
  { kind: "card", label: "휴대폰 개통", amount: "50만원", art: "3d/phone.webp" },
  { kind: "card", label: "총 지원금", amount: "138만원", art: "3d/moneybag.webp" },
  { kind: "tile", art: "3d/trophy.webp", tone: "blue" },
  { kind: "card", label: "차액 보상", amount: "200%", art: "3d/coins.webp" },
  { kind: "card", label: "지급 시점", amount: "1시간 내", art: "3d/calendar.webp" },
  { kind: "tile", art: "3d/router.webp", tone: "blue" },
  { kind: "card", label: "비밀지원금", amount: "상담 시 공개", art: "3d/magnifier.webp" },
];

/* 금액 구성 (예시 수치 - 실제 운영 기준으로 교체) */

/* 타사 비교 (타사 수치는 자사 조사 기준) */
type IconName = "wifi" | "phone" | "lock" | "bolt" | "shield" | "wallet" | "users" | "check" | "chat" | "call" | "gift";
type CmpRow = { emoji: string; key: string; other: string; ours: string; sub?: string; hl?: boolean; secret?: boolean; otherSmall?: boolean };
const COMPARE: CmpRow[] = [
  { emoji: "🌐", key: "인터넷+TV", other: "35만원", ours: "최대 47만원", sub: "통신사별 상이" },
  { emoji: "📱", key: "휴대폰 개통", other: "40만원", ours: "50만원", sub: "USIM 개통 기준" },
  { emoji: "🔒", key: "비밀지원금", other: "20만원", ours: "상담 시 공개", sub: "추가 지원금 별도 안내", hl: true, secret: true },
  { emoji: "⚡", key: "지급 시점", other: "오후 마감 전\n설치 시 당일", otherSmall: true, ours: "1시간 내 입금", sub: "설치 완료 후 당일", hl: true },
  { emoji: "🛡️", key: "차액 보상", other: "120~130%", ours: "200% 보상", sub: "차액의 2배", hl: true },
];
const COMPARE_TOTAL = { emoji: "💰", key: "총 지원금액", other: "95만원", ours: `최대 ${HERO_MAX}만원` };
const COMPARE_BRAND = "싹딜"; // 이미지 시안처럼 "자사"로 표기하려면 여기만 바꾸면 됩니다
const COMPARE_NOTES = [
  "인터넷+TV 사은품은 통신사·상품별로 다릅니다 (SK 40만원 / KT 45만원 / LG U+ 47만원)",
  "타사업체 수치는 자사 조사 기준이며, 지급 조건 및 차액 보상 세부 기준은 상담 시 안내드립니다",
];

/* 싹딜을 선택하는 이유 */
const WHY: { n: string; title: string; body: string; note?: string; img: string; badge: string; icon: IconName }[] = [
  {
    n: "01",
    title: "설치 당일 1시간 이내 입금",
    body: "설치가 끝나면 1시간 안에 고객님 계좌로 바로 입금해 드려요.",
    note: "설치 완료 당일 기준",
    img: "why/why-01.webp",
    badge: "설치 완료 → 1시간 이내 입금",
    icon: "bolt",
  },
  {
    n: "02",
    title: "차액 200% 보장",
    body: "다른 곳에서 더 받으셨다면 그 차액의 2배를 돌려드려요.",
    note: "동일 날짜 / 동일 통신사 / 동일 요금제 기준",
    img: "why/why-02.webp",
    badge: "더 받은 곳이 있다면 차액 2배",
    icon: "shield",
  },
  {
    n: "03",
    title: "최고의 조건으로 싹-딜",
    body: "통신사별 조건을 모두 비교해 가장 많이 받는 조합으로 안내해요.",
    img: "why/why-03.webp",
    badge: "통신사별 조건 전부 비교",
    icon: "check",
  },
  {
    n: "04",
    title: "내게 맞는 혜택 찾기",
    body: "사용 패턴과 가구원 수에 맞춰 꼭 필요한 상품만 정확하게 추천해요.",
    img: "why/why-04.webp",
    badge: "가구원 수 · 사용 패턴 맞춤",
    icon: "users",
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

const STATS = [
  { label: "누적 상담 고객", value: 33000, suffix: "명+" },
  { label: "상담 후기", value: 20000, suffix: "건+" },
];

const REVIEWS = [
  { tag: "재약정 대신 신규", who: "문*환", text: "처음에는 그냥 재약정하려다가 이것저것 비교해 보고 신규로 바꿨어요. 설치까지 생각보다 간단해서 만족해요!" },
  { tag: "설명이 깔끔", who: "심*혁", text: "인터넷 가입 알아보면서 여기저기 문의했는데 설명이 깔끔해서 좋았습니다. 사은품도 빵빵합니다." },
  { tag: "맞춤 추천", who: "박*하", text: "500메가랑 1기가 중에 고민했는데 사용 패턴에 맞춰서 알려주시더라고요. 괜히 비싼 걸로 안 해도 돼서 좋았어요." },
  { tag: "빠른 설치", who: "문*희", text: "약정 끝나서 새로 가입했어요. 상담도 빠르고 설치 일정도 바로 잡혀서 생각보다 금방 끝났네요." },
  { tag: "조건 비교", who: "하*석", text: "인터넷 어디서 해야 하나 한참 찾아봤는데 조건 비교해서 설명해 주셔서 결정하기 편했어요." },
  { tag: "가족 결합", who: "홍*기", text: "가족 결합 때문에 어떤 게 나은지 헷갈렸는데 비교해서 알려주셔서 도움 됐어요." },
];

const STEPS = [
  { n: "01", title: "상담", body: "현금·사은품 금액을 가입 전에 확정해요", art: "3d/clipboard.webp" },
  { n: "02", title: "설치", body: "원하는 날짜에 기사님이 방문해요", art: "3d/calendar.webp" },
  { n: "03", title: "입금", body: "설치 완료 후 1시간 내 계좌로 입금해요", art: "3d/moneybag.webp" },
];

const FAQS = [
  {
    q: `최대 ${HERO_MAX}만원은 누구나 받나요?`,
    a: "인터넷 + TV + 휴대폰 결합 기준 최대 금액이에요. 인터넷만 가입하셔도 현금 지원금은 받으실 수 있고, 내 조건의 정확한 금액은 상담에서 가입 전에 먼저 안내해 드려요.",
  },
  { q: "지원금은 언제 들어오나요?", a: "설치가 완료되면 당일, 1시간 내에 고객님 계좌로 입금해 드려요." },
  {
    q: "차액 200% 보상은 어떻게 받나요?",
    a: "동일 날짜·동일 통신사·동일 요금제 기준으로 다른 업체가 더 높은 혜택을 제공하면, 그 차액의 200%를 추가로 보상해 드려요.",
  },
  { q: "통신사나 속도는 제가 골라야 하나요?", a: "아니요. 사용 패턴과 가구원 수를 듣고 상담사가 맞는 조건을 추천해 드려요." },
  { q: "상담만 받고 가입 안 해도 되나요?", a: "물론이에요. 다른 곳과 충분히 비교해 보시고 결정하셔도 괜찮아요." },
];

const PRODUCTS: { value: string; icon: IconName }[] = [
  { value: "인터넷", icon: "wifi" },
  { value: "인터넷 + TV", icon: "gift" },
  { value: "휴대폰 결합", icon: "phone" },
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
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

/** 미디어 쿼리 일치 여부 (반응형 슬라이더 등에 사용) */
function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
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
 * 아이콘 (인라인 SVG, 1.75px 라인)
 * ===================================================================== */
const ICON_PATHS: Record<IconName, ReactNode> = {
  wifi: (
    <>
      <path d="M2.5 8.8a14 14 0 0 1 19 0" />
      <path d="M5.8 12.3a9.2 9.2 0 0 1 12.4 0" />
      <path d="M9.1 15.8a4.5 4.5 0 0 1 5.8 0" />
      <circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  phone: (
    <>
      <rect height="19" rx="3" width="12" x="6" y="2.5" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  lock: (
    <>
      <rect height="10.5" rx="2.5" width="15" x="4.5" y="10.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path d="M12 14.5v2.5" />
    </>
  ),
  bolt: <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8z" />,
  shield: (
    <>
      <path d="M12 2.8 4.5 5.6v5.6c0 4.7 3.2 8.6 7.5 10 4.3-1.4 7.5-5.3 7.5-10V5.6z" />
      <path d="m8.8 12 2.2 2.2 4.4-4.4" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5h14.5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5.5A2 2 0 0 1 3.5 18.5V6a2.5 2.5 0 0 1 2.5-2.5h10" />
      <path d="M16 14h1.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0" />
      <path d="M15.5 4.8a3.5 3.5 0 0 1 0 6.4M17.5 14.3A6.2 6.2 0 0 1 21.2 20" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  chat: <path d="M12 3.5c-5 0-9 3.2-9 7.2 0 2.5 1.6 4.7 4 6l-.8 3.6 4-2.5c.6.1 1.2.1 1.8.1 5 0 9-3.2 9-7.2S17 3.5 12 3.5z" />,
  call: (
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
  ),
  gift: (
    <>
      <rect height="13" rx="1.5" width="17" x="3.5" y="8" />
      <path d="M2.5 8h19M12 8v13M12 8S10.5 3.5 8 3.5 5.5 6.5 8 8M12 8s1.5-4.5 4-4.5 2.5 3 0 4.5" />
    </>
  ),
};

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const filled = name === "chat" || name === "call";
  return (
    <svg
      aria-hidden="true"
      className={`sk-icon ${className}`}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* =====================================================================
 * 작은 공용 컴포넌트
 * ===================================================================== */
type AssetFn = (path: string) => string;

function Art({ src, size, className = "", eager = false }: { src: string; size: number; className?: string; eager?: boolean }) {
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

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div className={`sk-reveal ${inView ? "is-in" : ""} ${className}`} ref={ref} style={{ "--d": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

function CountUp({ to, run, duration }: { to: number; run: boolean; duration?: number }) {
  const v = useCountUp(to, run, duration);
  return <>{Math.round(v).toLocaleString("ko-KR")}</>;
}

function SecHead({
  kicker,
  title,
  lead,
  align = "center",
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={`sk-head sk-head--${align}`}>
      <p className="sk-kicker">{kicker}</p>
      <h2 className="sk-h2">{title}</h2>
      {lead ? <p className="sk-lead">{lead}</p> : null}
    </Reveal>
  );
}

function Arrow() {
  return (
    <svg aria-hidden="true" className="sk-arrow" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** 높이 애니메이션이 있는 펼침 영역 (grid-template-rows 0fr → 1fr) */
function Collapse({ open, id, children }: { open: boolean; id: string; children: ReactNode }) {
  return (
    <div aria-hidden={!open} className={`sk-collapse ${open ? "is-open" : ""}`} id={id} inert={!open}>
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
 * 상단 진행 바 + 문구 띠
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

/** 맨 위 검은 띠. 문구가 3.5초마다 위로 바뀝니다 */
function Strip() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % STRIP.length), 3500);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="sk-strip">
      <p aria-live="off" className="sk-strip__text" key={i}>
        {STRIP[i]}
      </p>
    </div>
  );
}

/* =====================================================================
 * 1. 히어로 (랜딩형: 광고 문구 + 흐르는 혜택 카드)
 * ===================================================================== */
function HeroCard({ item, asset }: { item: HeroItem; asset: AssetFn }) {
  if (item.kind === "tile") {
    return (
      <div className={`sk-hcard sk-hcard--tile sk-hcard--${item.tone}`}>
        <Art eager size={140} src={asset(item.art)} />
      </div>
    );
  }
  return (
    <div className="sk-hcard">
      <p className="sk-hcard__label">{item.label}</p>
      <p className={`sk-hcard__amount ${item.amount.length > 5 ? "sk-hcard__amount--sm" : ""}`}>{item.amount}</p>
      <span className="sk-hcard__art">
        <Art eager size={96} src={asset(item.art)} />
      </span>
    </div>
  );
}

function Hero({ asset, onConsult }: { asset: AssetFn; onConsult: (from: string) => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  const cols = [0, 1, 2].map((c) => HERO_CARDS.filter((_, i) => i % 3 === c));
  const rowCards = HERO_CARDS.filter((c) => c.kind === "card");

  return (
    <section className={`sk-lhero ${mounted ? "is-in" : ""}`} id="hero">
      <div className="sk-wrap sk-lhero__layout">
        <div className="sk-lhero__copy">
          <img alt={SITE.name} className="sk-lhero__logo" height={30} src={asset("brand/logo-white.webp")} width={60} />
          <p className="sk-lhero__eyebrow">
            인터넷 · TV · 휴대폰 가입할 때
            <span className="sk-lhero__mascot">
              <Art eager size={44} src={asset("brand/ssak-03.webp")} />
            </span>
          </p>
          <h1 className="sk-lhero__title">
            <span className="sk-lhero__line">인터넷 바꾸고,</span>
            <span className="sk-lhero__line sk-lhero__line--glow">
              최대 <CountUp duration={1500} run={mounted} to={HERO_MAX} />
              만원 싹-!
            </span>
          </h1>
          <p className="sk-lhero__sub">
            정확한 요금 설계부터 숨은 비밀지원금까지
            <br />
            싹딜이 한 번에, 끝까지 책임집니다.
          </p>

          <div aria-hidden="true" className="sk-lhero__row">
            <div className="sk-lhero__row-track">
              {[0, 1].map((k) => (
                <div className="sk-lhero__row-set" key={k}>
                  {rowCards.map((c, i) => (
                    <HeroCard asset={asset} item={c} key={i} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <button className="sk-btn sk-btn--primary sk-btn--lg sk-lhero__cta" onClick={() => onConsult("hero")} type="button">
            최대 지원금 받기
            <Arrow />
          </button>
          <ul className="sk-lhero__trust">
            {TRUST.map((t) => (
              <li key={t.label}>
                <Icon name={t.icon} />
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden="true" className="sk-lhero__wall">
          {cols.map((col, c) => (
            <div className={`sk-lhero__col sk-lhero__col--${c + 1}`} key={c}>
              <div className="sk-lhero__col-track">
                {[...col, ...col].map((item, i) => (
                  <HeroCard asset={asset} item={item} key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
 * 3. 비교 (좌우 등장 + 아이콘 팝 + 타사 열 흐려짐)
 * ===================================================================== */
/** 문자열 속 숫자 하나를 카운트업 ("최대 47만원" → 최대 0…47만원). 숫자가 없거나 둘 이상이면 그대로 표시 */
function CountText({ text, run }: { text: string; run: boolean }) {
  const m = /^(\D*)(\d+)(\D*)$/.exec(text);
  const v = useCountUp(m ? Number(m[2]) : 0, run && !!m, 1300);
  if (!m) return <>{text}</>;
  return (
    <>
      {m[1]}
      {Math.round(v)}
      {m[3]}
    </>
  );
}

function Compare({ onConsult }: { onConsult: (from: string) => void }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });
  const [hover, setHover] = useState(-1);
  const total = COMPARE.length;
  const cell = (base: string, i: number) => `${base} ${hover === i ? "is-hover" : ""}`;
  const enter = (i: number) => () => setHover(i);

  return (
    <section aria-labelledby="compare-title" className="sk-sec sk-vs" id="compare">
      <div className="sk-wrap sk-vs__wrap">
        <Reveal className="sk-vs__head">
          <h2 className="sk-vs__title" id="compare-title">
            타사와 <span>비교표</span>
          </h2>
          <p className="sk-vs__sub">통신사 요금은 같고, 차이는 대리점이 정하는 지원금뿐이에요</p>
        </Reveal>

        {/* 화면 읽기용 표 (보이는 보드는 장식용으로 숨김) */}
        <table className="sk-sr">
          <caption>타사업체와 {COMPARE_BRAND} 지원금 비교</caption>
          <thead>
            <tr>
              <th scope="col">항목</th>
              <th scope="col">타사업체</th>
              <th scope="col">{COMPARE_BRAND}</th>
            </tr>
          </thead>
          <tbody>
            {[...COMPARE, COMPARE_TOTAL].map((r) => (
              <tr key={r.key}>
                <th scope="row">{r.key}</th>
                <td>{r.other.replace("\n", " ")}</td>
                <td>
                  {r.ours}
                  {"sub" in r && r.sub ? ` (${r.sub})` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div aria-hidden="true" className={`sk-vs__board ${inView ? "is-in" : ""}`} onMouseLeave={() => setHover(-1)} ref={ref}>
          <div className="sk-vs__col sk-vs__col--other">
            <div className="sk-vs__h">타사업체</div>
            {COMPARE.map((r, i) => (
              <div className={cell("sk-vs__cell", i)} key={r.key} onMouseEnter={enter(i)} style={{ "--i": i } as CSSProperties}>
                <span className={`sk-vs__other ${r.otherSmall ? "sk-vs__other--small" : ""}`}>
                  <CountText run={inView} text={r.other} />
                </span>
              </div>
            ))}
            <div className={cell("sk-vs__cell sk-vs__cell--total", total)} onMouseEnter={enter(total)} style={{ "--i": total } as CSSProperties}>
              <span className="sk-vs__other sk-vs__other--total">
                <CountText run={inView} text={COMPARE_TOTAL.other} />
              </span>
            </div>
          </div>

          <div className="sk-vs__col sk-vs__col--key">
            <div className="sk-vs__h" />
            {[...COMPARE, COMPARE_TOTAL].map((r, i) => (
              <div
                className={cell(`sk-vs__cell ${i === total ? "sk-vs__cell--total" : ""}`, i)}
                key={r.key}
                onMouseEnter={enter(i)}
                style={{ "--i": i } as CSSProperties}
              >
                <span className="sk-vs__emoji">{r.emoji}</span>
                <span className="sk-vs__key">{r.key}</span>
              </div>
            ))}
          </div>

          <div className="sk-vs__col sk-vs__col--ours">
            <span className="sk-vs__badge">혜택 최고 보장</span>
            <div className="sk-vs__h">
              <span className="sk-vs__eng">OUR BENEFIT</span>
              <strong className="sk-vs__brand">{COMPARE_BRAND}</strong>
            </div>
            {COMPARE.map((r, i) => (
              <div
                className={cell(`sk-vs__cell ${r.secret ? "sk-vs__cell--secret" : ""}`, i)}
                key={r.key}
                onMouseEnter={enter(i)}
                style={{ "--i": i } as CSSProperties}
              >
                <strong className={`sk-vs__val ${r.hl ? "sk-vs__val--hl" : ""}`}>
                  <CountText run={inView} text={r.ours} />
                </strong>
                {r.sub ? <span className="sk-vs__subtxt">{r.sub}</span> : null}
              </div>
            ))}
            <div className={cell("sk-vs__cell sk-vs__cell--total", total)} onMouseEnter={enter(total)} style={{ "--i": total } as CSSProperties}>
              <strong className="sk-vs__val sk-vs__val--total">
                <CountText run={inView} text={COMPARE_TOTAL.ours} />
              </strong>
            </div>
          </div>
        </div>

        <Reveal className="sk-vs__promise">
          <span aria-hidden="true" className="sk-vs__promise-icon">
            <Icon name="shield" />
          </span>
          <div className="sk-vs__promise-body">
            <p className="sk-vs__promise-text">
              더 받은 곳이 있다면? <br className="sk-vs__br" />
              <em>차액의 2배</em>로 돌려드립니다
            </p>
            <ul className="sk-vs__promise-tags">
              <li>동일 날짜</li>
              <li>동일 통신사</li>
              <li>동일 요금제 기준</li>
            </ul>
          </div>
          <span aria-hidden="true" className="sk-vs__promise-shine" />
        </Reveal>
        <ul className="sk-vs__notes">
          {COMPARE_NOTES.map((n) => (
            <li key={n}>※ {n}</li>
          ))}
        </ul>
        <div className="sk-vs__cta">
          <button className="sk-btn sk-btn--primary sk-btn--lg" onClick={() => onConsult("compare")} type="button">
            내 지원금 먼저 확인하기
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
 * 4. 싹딜을 선택하는 이유 (카드 4개, 화면에 들어오면 각 그림이 움직임)
 * ===================================================================== */
/** 힉스필드로 만든 고해상도 이미지 + 코드로 얹은 핵심 문구 배지 (글자는 코드라 선명하게 유지) */
function WhyVisual({ item, asset }: { item: (typeof WHY)[number]; asset: AssetFn }) {
  return (
    <>
      <img alt="" className="sk-why__img" decoding="async" height={791} loading="lazy" src={asset(item.img)} width={1400} />
      <span aria-hidden="true" className="sk-why__shine" />
      <span className="sk-why__badge">
        <Icon name={item.icon} />
        {item.badge}
      </span>
    </>
  );
}

function Why({ asset, onConsult }: { asset: AssetFn; onConsult: (from: string) => void }) {
  return (
    <section aria-labelledby="why-title" className="sk-sec sk-sec--dark sk-why" id="why">
      <div className="sk-wrap">
        <SecHead
          kicker="싹딜을 선택하는 이유"
          lead={
            <>
              같은 통신사, 같은 요금제라도 어디서 가입하느냐에 따라 받는 돈이 달라져요.
              <br className="sk-hide-m" /> 싹딜은 확실한 기준으로 답을 드립니다.
            </>
          }
          title={<span id="why-title">왜 싹딜이어야 할까요?</span>}
        />
        <ul className="sk-why__grid">
          {WHY.map((w, i) => (
            <li key={w.n}>
              <WhyCard asset={asset} delay={i * 90} item={w} />
            </li>
          ))}
        </ul>
        <div className="sk-center">
          <button className="sk-btn sk-btn--primary sk-btn--lg sk-why__cta" onClick={() => onConsult("why")} type="button">
            내 조건으로 상담받기
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}

function WhyCard({ item, asset, delay }: { item: (typeof WHY)[number]; asset: AssetFn; delay: number }) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.35 });
  return (
    <article className={`sk-why__card ${inView ? "is-in" : ""}`} ref={ref} style={{ "--d": `${delay}ms` } as CSSProperties}>
      <div aria-hidden="true" className="sk-why__media">
        <WhyVisual asset={asset} item={item} />
      </div>
      <div className="sk-why__body">
        <span className="sk-why__num">{item.n}</span>
        <h3 className="sk-why__title">{item.title}</h3>
        <p className="sk-why__text">{item.body}</p>
        {item.note ? <p className="sk-why__note">({item.note})</p> : null}
      </div>
    </article>
  );
}

/* =====================================================================
 * 5. 사은품 (마우스 틸트 + 전체 보기 시트)
 * ===================================================================== */
function tilt(e: ReactPointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
  el.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
}
function untilt(e: ReactPointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty("--ry", "0deg");
  e.currentTarget.style.setProperty("--rx", "0deg");
}

function Gifts({ asset, onOpenAll }: { asset: AssetFn; onOpenAll: () => void }) {
  return (
    <section aria-labelledby="gifts-title" className="sk-sec sk-sec--surface" id="gifts">
      <div className="sk-wrap">
        <SecHead kicker="사은품" lead="가입하면 아래 중 1개를 무료로 드려요." title={<span id="gifts-title">사은품도 내가 골라요</span>} />
        <ul className="sk-gifts">
          {GIFTS.map((g, i) => (
            <li key={g.name}>
              <Reveal className="sk-gift" delay={i * 80}>
                <div className="sk-gift__card" onPointerLeave={untilt} onPointerMove={tilt}>
                  <div className="sk-gift__media">
                    <img alt="" className="sk-gift__img" height={240} loading="lazy" src={asset(g.img)} width={240} />
                  </div>
                  <p className="sk-gift__brand">{g.brand}</p>
                  <p className="sk-gift__name">{g.name}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="sk-center">
          <button className="sk-btn sk-btn--outline" onClick={onOpenAll} type="button">
            사은품 전체 보기 <span className="sk-hl-d">+{GIFTS_MORE.length}종</span>
          </button>
          <p className="sk-fine sk-fine--center">가입 통신사에 따라 선택 가능한 사은품이 다를 수 있어요</p>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
 * 6. 후기 (자동 슬라이드 + 스와이프 + 점 내비게이션, 화면 폭에 따라 1/2/3장)
 * ===================================================================== */
function Stat({ label, value, suffix, run }: { label: string; value: number; suffix: string; run: boolean }) {
  return (
    <div className="sk-stat">
      <p className="sk-stat__value">
        <CountUp duration={1600} run={run} to={value} />
        <span>{suffix}</span>
      </p>
      <p className="sk-stat__label">{label}</p>
    </div>
  );
}

function Reviews({ asset }: { asset: AssetFn }) {
  const n = REVIEWS.length;
  const tablet = useMedia("(min-width: 768px)");
  const desktop = useMedia("(min-width: 1024px)");
  const perView = desktop ? 3 : tablet ? 2 : 1;
  const pages = n - perView + 1;

  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const [dragX, setDragX] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3, once: false });
  const [statRef, statIn] = useInView<HTMLDivElement>({ threshold: 0.4 });

  const go = useCallback((i: number) => setIndex(((i % pages) + pages) % pages), [pages]);
  useEffect(() => {
    setIndex((i) => Math.min(i, pages - 1));
  }, [pages]);

  useEffect(() => {
    if (hold || !inView || prefersReducedMotion()) return;
    const t = window.setInterval(() => setIndex((v) => (v + 1) % pages), 4000);
    return () => window.clearInterval(t);
  }, [hold, inView, pages]);

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
    <section aria-labelledby="reviews-title" className="sk-sec sk-sec--dark" id="reviews">
      <div className="sk-wrap">
        <SecHead kicker="고객 후기" lead="싹딜에서 가입한 고객님들이 직접 남긴 후기예요." title={<span id="reviews-title">먼저 바꾼 분들의 이야기</span>} />

        <div className="sk-stats" ref={statRef}>
          {STATS.map((s) => (
            <Stat key={s.label} run={statIn} {...s} />
          ))}
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
            <ul className="sk-slider__track" style={{ "--idx": index, "--drag": `${dragX}px` } as CSSProperties}>
              {REVIEWS.map((r, i) => {
                const visible = i >= index && i < index + perView;
                return (
                  <li
                    aria-hidden={!visible}
                    aria-label={`${n}개 중 ${i + 1}번째 후기`}
                    aria-roledescription="slide"
                    className={`sk-review ${visible ? "is-active" : ""}`}
                    key={r.who + r.tag}
                  >
                    <div className="sk-review__head">
                      <span aria-label="별점 5점" className="sk-review__stars" role="img">
                        ★★★★★
                      </span>
                      <span className="sk-review__tag">{r.tag}</span>
                    </div>
                    <p className="sk-review__text">{r.text}</p>
                    <div className="sk-review__who">
                      <Art size={32} src={asset("brand/ssak-03.webp")} />
                      {r.who} 고객님
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="sk-slider__nav">
            <button aria-label="이전 후기" className="sk-slider__arrow" onClick={() => go(index - 1)} type="button">
              <Arrow />
            </button>
            <div className="sk-slider__dots">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  aria-current={i === index}
                  aria-label={`${i + 1}번째 후기로 이동`}
                  className={`sk-slider__dot ${i === index ? "is-active" : ""}`}
                  key={i}
                  onClick={() => go(i)}
                  type="button"
                />
              ))}
            </div>
            <button aria-label="다음 후기" className="sk-slider__arrow sk-slider__arrow--next" onClick={() => go(index + 1)} type="button">
              <Arrow />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
 * 7. 진행 과정 3단계 (연결선이 차오름 - 모바일 세로, 데스크톱 가로)
 * ===================================================================== */
function Steps({ asset }: { asset: AssetFn }) {
  const [ref, inView] = useInView<HTMLOListElement>({ threshold: 0.3 });
  return (
    <section aria-labelledby="steps-title" className="sk-sec sk-sec--light" id="steps">
      <div className="sk-wrap">
        <SecHead kicker="진행 과정" title={<span id="steps-title">신청부터 입금까지, 딱 3단계</span>} />
        <ol className={`sk-steps ${inView ? "is-in" : ""}`} ref={ref}>
          <span aria-hidden="true" className="sk-steps__line" />
          {STEPS.map((s, i) => (
            <li className={`sk-step ${i === STEPS.length - 1 ? "sk-step--last" : ""}`} key={s.n} style={{ "--i": i } as CSSProperties}>
              <span className="sk-step__node">{s.n}</span>
              <div className="sk-step__card">
                <Art size={88} src={asset(s.art)} />
                <div>
                  <h3 className="sk-step__title">{s.title}</h3>
                  <p className="sk-step__text">{s.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
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
    <section aria-labelledby="faq-title" className="sk-sec sk-sec--surface" id="faq">
      <div className="sk-wrap sk-split sk-split--faq">
        <div className="sk-split__side">
          <Reveal className="sk-head sk-head--left">
            <p className="sk-kicker">자주 묻는 질문</p>
            <h2 className="sk-h2" id="faq-title">
              신청 전에
              <br />
              궁금한 점
            </h2>
            <p className="sk-lead">찾는 답이 없다면 편하게 물어보세요.</p>
          </Reveal>
        </div>
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
                    <span className="sk-faq__qt">{f.q}</span>
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
      </div>
    </section>
  );
}

/* =====================================================================
 * 상담 신청 폼 (페이지 하단 + 시트 공용)
 * ===================================================================== */
const PHONE_RE = /^01[016789]-\d{3,4}-\d{4}$/;
function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length < 11) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function LeadForm({ asset, plan = "", from = "page" }: { asset: AssetFn; plan?: string; from?: string }) {
  const uid = useId();
  const [product, setProduct] = useState(PRODUCTS[0].value);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [error, setError] = useState<{ field: "name" | "phone" | "agree" | "send"; text: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    if (name.trim().length < 2) return setError({ field: "name", text: "이름을 2자 이상 입력해 주세요." });
    if (!PHONE_RE.test(phone)) return setError({ field: "phone", text: "휴대폰 번호를 010-1234-5678 형식으로 입력해 주세요." });
    if (!agree) return setError({ field: "agree", text: "개인정보 수집·이용에 동의해 주세요." });
    setError(null);
    setStatus("sending");
    try {
      await submitLead({ product, name: name.trim(), phone, plan, from });
      setStatus("done");
    } catch {
      setStatus("idle");
      setError({ field: "send", text: "신청을 보내지 못했어요. 잠시 후 다시 시도하거나 전화로 문의해 주세요." });
    }
  };

  if (status === "done") {
    return (
      <div aria-live="polite" className="sk-form__done">
        <Art size={88} src={asset("brand/ssak-03.webp")} />
        <p className="sk-form__done-title">신청이 접수됐어요</p>
        <p className="sk-form__done-text">곧 상담사가 내 조건 지원금을 안내해 드릴게요.</p>
        <button
          className="sk-linkbtn"
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
          선택한 조건 <strong>{plan}</strong>
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
              <Icon className="sk-tile__icon" name={p.icon} />
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
            <input checked={agree} className="sk-consent__check" onChange={(e) => setAgree(e.target.checked)} type="checkbox" />
            <span className="sk-consent__box" aria-hidden="true">
              <Icon name="check" />
            </span>
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
            수집 항목은 이름, 휴대폰 번호, 관심 상품이에요. 상담 안내 목적으로만 사용하고 상담이 끝난 날부터 1년 뒤 파기해요.
          </p>
        </Collapse>
      </div>

      {error ? (
        <p className="sk-form__error" role="alert">
          {error.text}
        </p>
      ) : null}
      <button className="sk-btn sk-btn--primary sk-btn--lg" disabled={status === "sending"} type="submit">
        {status === "sending" ? "접수 중..." : "무료 상담 신청하기"}
        {status === "sending" ? null : <Arrow />}
      </button>
      <p className="sk-fine sk-fine--center">영업일 기준 순서대로 전화드려요</p>
    </form>
  );
}

/* =====================================================================
 * 9. 마지막 CTA + 폼
 * ===================================================================== */
function Apply({ asset, sectionRef }: { asset: AssetFn; sectionRef: RefObject<HTMLElement | null> }) {
  return (
    <section aria-labelledby="apply-title" className="sk-sec sk-sec--dark sk-apply" id="apply" ref={sectionRef}>
      <div className="sk-wrap sk-split sk-split--apply">
        <div className="sk-split__side">
          <Reveal className="sk-head sk-head--left">
            <p className="sk-kicker">상담 신청</p>
            <h2 className="sk-h2" id="apply-title">
              비교는 다 해 보세요.
              <br />
              마지막에 <span className="sk-hl">싹딜</span>에 물어보세요.
            </h2>
          </Reveal>
          <ul className="sk-apply__points">
            <li>
              <Icon name="check" />
              가입 전에 내 조건 실수령액부터 안내
            </li>
            <li>
              <Icon name="check" />
              설치 완료 후 1시간 내 계좌 입금
            </li>
            <li>
              <Icon name="check" />
              더 받은 곳이 있으면 차액의 2배 보상
            </li>
          </ul>
          <a className="sk-apply__tel" href={`tel:${SITE.phoneTel}`}>
            <span className="sk-apply__tel-icon">
              <Icon name="call" />
            </span>
            <span>
              <small>전화 상담 · {SITE.hours}</small>
              {SITE.phone}
            </span>
          </a>
        </div>
        <Reveal className="sk-card sk-apply__card" delay={120}>
          <p className="sk-apply__card-title">1분 만에 내 지원금 확인</p>
          <LeadForm asset={asset} from="apply" />
        </Reveal>
      </div>
    </section>
  );
}

function Footer({ asset }: { asset: AssetFn }) {
  return (
    <footer className="sk-foot">
      <div className="sk-wrap sk-foot__inner">
        <img alt={SITE.name} className="sk-foot__logo" height={26} loading="lazy" src={asset("brand/logo-white.webp")} width={52} />
        <div className="sk-foot__info">
          <p>회사명: 싹딜 (오픈 전 입력) | 대표자: 오픈 전 입력</p>
          <p>사업자번호: 오픈 전 입력 | 주소: 오픈 전 입력</p>
          <p>
            대표번호 {SITE.phone} | {SITE.hours}
          </p>
          <p className="sk-foot__notice">
            표시된 금액은 가입 통신사·상품·결합 조건에 따라 달라질 수 있습니다. 상담 시 실제 지급 금액을 안내해 드립니다.
          </p>
          <p className="sk-foot__copy">© 2026 {SITE.name}. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}

/* =====================================================================
 * 시트 모달 (모바일: 아래에서 올라옴 / 태블릿 이상: 가운데 창)
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
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
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
      <button aria-label="닫기" className="sk-sheet__dim" onClick={onClose} tabIndex={-1} type="button" />
      <div aria-labelledby={titleId} aria-modal="true" className="sk-sheet__panel" onKeyDown={trap} ref={panel} role="dialog" tabIndex={-1}>
        <span aria-hidden="true" className="sk-sheet__grab" />
        <div className="sk-sheet__head">
          <div>
            <h3 className="sk-sheet__title" id={titleId}>
              {title}
            </h3>
            {sub ? <p className="sk-sheet__sub">{sub}</p> : null}
          </div>
          <button aria-label="닫기" className="sk-sheet__close" onClick={onClose} type="button">
            <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="sk-sheet__body">{children}</div>
      </div>
    </div>
  );
}

/* =====================================================================
 * 하단 고정 상담 바 (최싸몰형: 상품·이름·연락처·동의를 바로 입력) + 맨 위로
 * ===================================================================== */
function LeadBar({ asset }: { asset: AssetFn }) {
  const [product, setProduct] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string; id: number } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const say = (ok: boolean, text: string) => setToast({ ok, text, id: Date.now() });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    if (!product) return say(false, "관심 상품을 선택해 주세요.");
    if (name.trim().length < 2) return say(false, "성함을 2자 이상 입력해 주세요.");
    if (!PHONE_RE.test(phone)) return say(false, "연락처를 010-1234-5678 형식으로 입력해 주세요.");
    if (!agree) return say(false, "개인정보 수집·이용에 동의해 주세요.");
    setSending(true);
    try {
      await submitLead({ product, name: name.trim(), phone, plan: "", from: "bar" });
      say(true, "상담 신청이 접수됐어요. 곧 연락드릴게요!");
      setProduct("");
      setName("");
      setPhone("");
      setAgree(false);
    } catch {
      say(false, "신청을 보내지 못했어요. 전화로 문의해 주세요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form aria-label="빠른 상담 신청" className="sk-bar" noValidate onSubmit={onSubmit}>
      <p
        aria-live="polite"
        className={`sk-bar__toast ${toast ? "is-show" : ""} ${toast?.ok ? "is-ok" : ""}`}
        key={toast?.id ?? 0}
        role="status"
      >
        {toast?.text}
      </p>
      <div className="sk-bar__inner">
        <Art className="sk-bar__art" size={110} src={asset("3d/phone.webp")} />
        <a className="sk-bar__tel" href={`tel:${SITE.phoneTel}`}>
          <Icon name="call" />
          {SITE.phone}
        </a>
        <label className="sk-bar__agree">
          <input checked={agree} className="sk-bar__check" onChange={(e) => setAgree(e.target.checked)} type="checkbox" />
          <span aria-hidden="true" className="sk-bar__box">
            <Icon name="check" />
          </span>
          <span className="sk-bar__agree-text">개인정보 수집·이용 동의</span>
        </label>
        <div className="sk-bar__fields">
          <select aria-label="관심 상품" className="sk-bar__input sk-bar__select" onChange={(e) => setProduct(e.target.value)} value={product}>
            <option value="">상품 선택</option>
            {PRODUCTS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.value}
              </option>
            ))}
          </select>
          <input
            aria-label="성함"
            autoComplete="name"
            className="sk-bar__input"
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="성함"
            value={name}
          />
          <input
            aria-label="연락처"
            autoComplete="tel"
            className="sk-bar__input"
            inputMode="numeric"
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="연락처"
            type="tel"
            value={phone}
          />
          <button className="sk-bar__submit" disabled={sending} type="submit">
            {sending ? "접수 중" : "상담신청"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ToTop() {
  const show = useScrolledPast(900);
  return (
    <button
      aria-label="맨 위로"
      className={`sk-totop ${show ? "is-show" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}
      tabIndex={show ? 0 : -1}
      type="button"
    >
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} viewBox="0 0 24 24">
        <path d="M12 19V5M6 11l6-6 6 6" />
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
  const applyRef = useRef<HTMLElement>(null);

  const openConsult = useCallback((from: string, plan = "") => {
    setGiftsOpen(false);
    setSheet({ open: true, from, plan });
  }, []);
  const closeConsult = useCallback(() => setSheet((s) => ({ ...s, open: false })), []);
  const closeGifts = useCallback(() => setGiftsOpen(false), []);

  return (
    <div className="sk" id="top">
      <ScrollProgress />
      <Strip />
      <main>
        <Hero asset={asset} onConsult={openConsult} />
        <Compare onConsult={openConsult} />
        <Why asset={asset} onConsult={openConsult} />
        <Gifts asset={asset} onOpenAll={() => setGiftsOpen(true)} />
        <Reviews asset={asset} />
        <Steps asset={asset} />
        <Faq />
        <Apply asset={asset} sectionRef={applyRef} />
      </main>
      <Footer asset={asset} />

      <LeadBar asset={asset} />
      <ToTop />

      <Sheet onClose={closeConsult} open={sheet.open} sub="상담사가 내 조건 실수령액을 알려 드려요" title="내 지원금 확인하기">
        <LeadForm asset={asset} from={sheet.from} key={`${sheet.from}-${sheet.plan}`} plan={sheet.plan} />
      </Sheet>

      <Sheet onClose={closeGifts} open={giftsOpen} sub="가입하면 1개를 무료로 골라요" title="사은품 전체">
        <ul className="sk-giftlist">
          {[...GIFTS.map((g) => ({ cat: "대형가전", name: `${g.brand} ${g.name}` })), ...GIFTS_MORE].map((g) => (
            <li key={g.name}>
              <span>{g.name}</span>
              <small>{g.cat}</small>
            </li>
          ))}
        </ul>
        <p className="sk-fine">전체 목록은 예시입니다. 실제 사은품 목록으로 교체해 주세요.</p>
        <button className="sk-btn sk-btn--primary" onClick={() => openConsult("gift-sheet")} type="button">
          이 중에서 골라 상담받기
          <Arrow />
        </button>
      </Sheet>
    </div>
  );
}
