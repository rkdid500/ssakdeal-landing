import { LogoMark } from "@/components/brand/logo";
import { SITE } from "@/lib/site-config";

import { LeadForm } from "./lead-form";
import { ART } from "./shared";

function Art({ src, size = 120, className = "", eager = false }: { src: string; size?: number; className?: string; eager?: boolean }) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={`art ${className}`}
      decoding="async"
      height={size}
      loading={eager ? "eager" : "lazy"}
      src={src}
      width={size}
    />
  );
}

function Num({ n }: { n: string }) {
  return <span className="num-badge">{n}</span>;
}

/* 1. Hero ------------------------------------------------------------- */
const HERO_CARDS = [
  { label: "인터넷", amount: "50만원", art: ART.router, tilt: "l" },
  { label: "휴대폰", amount: "52만원", art: ART.phone, tilt: "r" },
  { label: "결합 할인", amount: "추가 혜택", art: ART.coins, tilt: "r" },
  { label: "합산 최대", amount: "102만원", art: ART.gift, tilt: "l", gold: true },
];

export function Hero() {
  return (
    <section className="hero" id="top">
      <p className="hero__strip">합리적인 요금, 끝까지 챙기는 혜택</p>
      <div className="hero__head">
        <a aria-label={`${SITE.name} 처음으로`} className="brand" href="/">
          <LogoMark size={26} />
          <span>{SITE.name}</span>
        </a>
        <Art className="hero__mascot float" eager size={84} src={ART.mascot} />
      </div>
      <p className="hero__kicker">인터넷과 휴대폰을 한 번에</p>
      <h1 className="hero__title">
        <span className="hero__line">딱 맞게 바꾸고</span>
        <span className="hero__line hero__line--gold">최대 혜택으로</span>
      </h1>
      <p className="hero__sub">
        정확한 요금 설계부터 보이지 않던 혜택까지
        <br />
        딱맞춤이 한 번에, 끝까지 챙겨드려요.
      </p>
      <ul className="hero__cards">
        {HERO_CARDS.map((c) => (
          <li className={`pcard pcard--${c.tilt}${c.gold ? " pcard--gold" : ""}`} key={c.label}>
            <span className="pcard__label">{c.label}</span>
            <strong className="pcard__amount">{c.amount}</strong>
            <Art className="pcard__art" eager size={96} src={c.art} />
          </li>
        ))}
      </ul>
      <a className="btn-glow" href="#consult">
        최대 지원금 받기
        <span aria-hidden="true" className="chev" />
      </a>
    </section>
  );
}

/* 2. Trust stats -------------------------------------------------------- */
export function Trust() {
  return (
    <section className="sec sec--dark trust">
      <p className="sec__eyebrow">같은 가입, 다른 혜택</p>
      <h2 className="sec__title">
        숫자로 증명된 선택
        <br />
        <span className="txt-gold">딱맞춤</span>
      </h2>
      <div className="trust__badge">
        <span aria-hidden="true" className="trust__laurel trust__laurel--l" />
        <Art className="trust__mascot float" size={150} src={ART.mascot} />
        <span aria-hidden="true" className="trust__laurel trust__laurel--r" />
      </div>
      <div className="stat-stack">
        <div className="stat">
          <span className="stat__label">제휴 판매점</span>
          <strong className="stat__value">40곳+</strong>
        </div>
        <div className="stat">
          <span className="stat__label">누적 상담 고객 수</span>
          <strong className="stat__value">3만명+</strong>
        </div>
      </div>
      <p className="sec__note">
        상담이 많을수록 조건 비교는 더 정확해져요.
        <br />
        그 차이가 실제 혜택의 차이가 됩니다.
      </p>
    </section>
  );
}

/* 3. Compare -------------------------------------------------------------- */
const COMPARE = [
  { key: "인터넷 가입", other: "35만원", ours: "50만원" },
  { key: "결합 할인", other: "없음", ours: "추가 적용" },
  { key: "휴대폰 개통", other: "35만원", ours: "52만원" },
  { key: "총 혜택", other: "70만원", ours: "102만원" },
];

export function Compare() {
  return (
    <section aria-labelledby="compare-title" className="sec sec--dark compare">
      <Num n="01" />
      <h2 className="sec__title" id="compare-title">혜택 비교</h2>
      <table className="cmp">
        <caption className="sr-only">타업체와 딱맞춤 혜택 금액 비교 (예시)</caption>
        <thead>
          <tr>
            <th className="cmp__h cmp__h--other" scope="col">타업체</th>
            <td className="cmp__h cmp__h--mid" />
            <th className="cmp__h cmp__h--ours" scope="col">딱맞춤</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE.map((row, i) => (
            <tr className={i === COMPARE.length - 1 ? "cmp__total" : undefined} key={row.key}>
              <td className="cmp__other">{row.other}</td>
              <th className="cmp__key" scope="row">{row.key}</th>
              <td className="cmp__ours">{row.ours}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="pills">
        <li className="pill"><Art size={44} src={ART.router} />인터넷 50만원</li>
        <li className="pill"><Art size={44} src={ART.coins} />결합 추가 할인</li>
        <li className="pill"><Art size={44} src={ART.phone} />휴대폰 52만원</li>
      </ul>
      <p className="compare__sum">
        최대 <strong>102만원</strong>
      </p>
      <span aria-hidden="true" className="plus-dot" />
      <Art className="compare__gift float" size={120} src={ART.gift} />
    </section>
  );
}

/* 4. Customers bar chart ------------------------------------------------ */
export function Customers() {
  return (
    <section aria-labelledby="cust-title" className="sec sec--dark customers">
      <Num n="02" />
      <h2 className="sec__title" id="cust-title">누적 상담 고객</h2>
      <div aria-label="타업체 8,000명, 딱맞춤 33,000명 (예시)" className="bars" role="img">
        <div className="bars__col">
          <div className="bars__bar bars__bar--other">
            <span>8,000명</span>
          </div>
          <span className="bars__name">타업체</span>
        </div>
        <span className="bars__times">
          약<br />4배
        </span>
        <div className="bars__col">
          <div className="bars__bar bars__bar--ours">
            <span>33,000명+</span>
          </div>
          <span className="bars__name">딱맞춤</span>
        </div>
      </div>
    </section>
  );
}

/* 5. Consult form -------------------------------------------------------- */
export function Consult() {
  return (
    <section aria-labelledby="consult-title" className="sec sec--light consult" id="consult">
      <Art className="consult__mascot float" size={96} src={ART.mascot} />
      <h2 className="sec__title sec__title--ink" id="consult-title">
        놓치고 있던 <span className="txt-blue">혜택</span>까지
        <br />
        딱맞춤이 찾아드려요!
      </h2>
      <LeadForm />
    </section>
  );
}

/* 6. Worry ------------------------------------------------------------------ */
export function Worry() {
  return (
    <section aria-labelledby="worry-title" className="sec sec--deep worry">
      <p className="worry__big">
        최대
        <br />
        <span className="txt-gold">102만원 혜택</span>
      </p>
      <div aria-hidden="true" className="worry__cloud">
        <span className="bubble bubble--a">A업체</span>
        <span className="bubble bubble--b">B업체</span>
        <span className="bubble bubble--c">C업체</span>
        <span className="bubble bubble--d">D업체</span>
      </div>
      <h2 className="sec__title" id="worry-title">
        어디서 가입해야 할지
        <br />
        고민되시나요?
      </h2>
      <span aria-hidden="true" className="worry__line" />
      <p className="worry__text">
        수많은 업체 속에서
        <br />
        조건은 비슷해 보여도 결과는 달라요.
        <br />
        <strong>딱맞춤이 확실한 기준으로 답을 드릴게요.</strong>
      </p>
    </section>
  );
}

/* 7. Why us -------------------------------------------------------------- */
const REASONS = [
  {
    n: "01",
    title: "차액 130% 보상",
    body: "다른 곳보다 혜택이 적으면 차액을 보상해 드려요.",
    note: "동일 날짜, 동일 통신사, 동일 요금제 기준",
    art: ART.coins,
    tone: "navy",
    hero: "차액\n130% 보상",
  },
  {
    n: "02",
    title: "맞춤형 추천 시스템",
    body: "고객님의 시간을 낭비하지 않도록 꼭 맞는 상품만 정확하게 안내해요.",
    art: ART.magnifier,
    tone: "sky",
  },
  {
    n: "03",
    title: "더 큰 혜택, 확실한 관리",
    body: "가격은 합리적으로, 혜택은 최대로. 가입 이후 관리까지 책임져요.",
    art: ART.gift,
    tone: "sky",
    hero: "합리적인 가격\n최대한의 혜택",
  },
  {
    n: "04",
    title: "결과로 증명하는 선택",
    body: "고객 맞춤 조건 설계로 실질적인 차이를 만들어요.",
    art: ART.trophy,
    tone: "navy",
    hero: "33,000명",
  },
];

export function Reasons() {
  return (
    <section aria-labelledby="why-title" className="sec sec--mist reasons">
      <h2 className="sec__title sec__title--ink" id="why-title">
        딱맞춤을 선택하는 이유
      </h2>
      <ul className="reasons__list">
        {REASONS.map((r) => (
          <li className="rcard" key={r.n}>
            <div className={`rcard__visual rcard__visual--${r.tone}`}>
              {r.hero ? <p className="rcard__hero">{r.hero}</p> : null}
              <Art className="rcard__art float" size={150} src={r.art} />
            </div>
            <div className="rcard__body">
              <Num n={r.n} />
              <h3 className="rcard__title">{r.title}</h3>
              <p className="rcard__text">{r.body}</p>
              {r.note ? <p className="rcard__note">({r.note})</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* 8. Moments ------------------------------------------------------------- */
export function Moments() {
  return (
    <section aria-labelledby="moments-title" className="sec sec--dark moments">
      <div className="chat">
        <p className="chat__b chat__b--1">
          3년 뒤 재가입을 고민할 때
          <span aria-hidden="true" className="chat__check" />
        </p>
        <p className="chat__b chat__b--2">지인을 추천하고 싶을 때</p>
        <p className="chat__b chat__b--3">요금이 갑자기 올랐을 때</p>
      </div>
      <p className="moments__lead">가장 먼저 떠오르는 곳.</p>
      <h2 className="sec__title" id="moments-title">
        그것이 딱맞춤이
        <br />
        지키는 <span className="txt-gold">기준</span>입니다.
      </h2>
    </section>
  );
}

/* 9. Steps --------------------------------------------------------------- */
const STEPS = [
  { n: "01", title: "접수 신청", body: "온라인 상담 또는 전화로 간편 접수", art: ART.clipboard },
  { n: "02", title: "일정 조율", body: "인터넷 설치, 휴대폰 개통 날짜를 편하게 조율", art: ART.calendar },
  { n: "03", title: "설치·개통", body: "인터넷 방문 설치와 휴대폰 개통을 한 번에", art: ART.phone },
  { n: "04", title: "혜택 지급", body: "설치 완료 후 약속한 사은품 지급", art: ART.moneybag },
];

export function Steps() {
  return (
    <section aria-labelledby="steps-title" className="sec sec--light steps">
      <h2 className="sec__title sec__title--ink" id="steps-title">
        딱맞춤만의
        <br />
        초간단 가입 절차
      </h2>
      <ol className="steps__list">
        {STEPS.map((s) => (
          <li className="scard" key={s.n}>
            <Num n={s.n} />
            <div className="scard__art">
              <Art size={132} src={s.art} />
            </div>
            <h3 className="scard__title">{s.title}</h3>
            <p className="scard__text">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* 10. Reviews ------------------------------------------------------------ */
const REVIEWS = [
  { who: "김*희", what: "인터넷+TV", text: "인터넷이랑 TV를 묶었더니 매달 요금이 꽤 줄었어요. 사은품도 약속한 날 정확히 들어왔어요." },
  { who: "박*준", what: "휴대폰 번호이동", text: "2년 총액으로 비교해 주니까 어디가 진짜 싼지 바로 보였어요. 설명이 깔끔했어요." },
  { who: "이*연", what: "인터넷+휴대폰 결합", text: "가족 휴대폰이랑 인터넷을 묶었더니 결합 할인이 생각보다 컸어요. 설치도 빨랐어요." },
];

export function Reviews() {
  return (
    <section aria-labelledby="reviews-title" className="sec reviews">
      <div className="reviews__top">
        <Art className="reviews__trophy float" size={170} src={ART.trophy} />
        <p className="reviews__big">
          상담 후기
          <br />
          <span className="txt-gold">2만 개 돌파</span>
        </p>
      </div>
      <div className="reviews__body">
        <h2 className="sec__title sec__title--ink" id="reviews-title">
          숫자가 증명하는
          <br />
          딱맞춤의 기준
        </h2>
        <p className="sec__lead sec__lead--ink">지금 이 순간에도 후기는 계속 쌓이고 있어요.</p>
        <ul className="reviews__list">
          {REVIEWS.map((r) => (
            <li className="review" key={r.who}>
              <Art className="review__icon" size={56} src={ART.chat} />
              <div>
                <p className="review__stars" aria-label="별점 5점">★★★★★</p>
                <p className="review__text">{r.text}</p>
                <p className="review__who">
                  {r.who}, {r.what}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="reviews__sample">시안용 예시 후기입니다.</p>
      </div>
    </section>
  );
}

/* 11. Final CTA + footer ----------------------------------------------- */
export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="sec sec--dark final">
      <div className="final__card">
        <h2 className="sec__title" id="final-title">
          사은품의 기준은
          <br />
          딱맞춤에서
        </h2>
        <a className="final__phone" href={`tel:${SITE.phoneTel}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
          </svg>
          {SITE.phone}
        </a>
        <p className="final__text">
          어디서 가입할지 고민된다면 혜택부터 비교해 보세요.
          <br />
          최대 혜택의 정점은 딱맞춤이에요.
        </p>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot__brand">
        <LogoMark size={30} />
        <span>{SITE.name}</span>
      </div>
      <p>회사명: 딱맞춤 (오픈 전 입력) | 대표자: 오픈 전 입력</p>
      <p>사업자번호: 오픈 전 입력 | 주소: 오픈 전 입력</p>
      <p>
        대표번호 {SITE.phone} | {SITE.hours}
      </p>
      <p className="foot__notice">표시된 혜택 금액은 최대 기준이며 통신사, 요금제, 가입 조건에 따라 달라질 수 있어요.</p>
      <details className="foot__policy">
        <summary>개인정보 처리방침</summary>
        <p>
          수집 항목은 이름, 휴대폰 번호, 관심 상품이에요. 상담 안내 목적으로만 사용하고 상담이 끝난 날부터 1년 뒤 파기해요.
        </p>
      </details>
      <p className="foot__copy">© 2026 {SITE.name}. ALL RIGHTS RESERVED.</p>
    </footer>
  );
}
