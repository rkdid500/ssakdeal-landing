import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Split the text nodes of `el` into word spans (keeps <br>, <strong> etc.). */
function splitWords(el: HTMLElement) {
  if (el.dataset.split) return [...el.querySelectorAll<HTMLElement>(".w")];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const frag = document.createDocumentFragment();
    node.textContent!.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) frag.append(part);
      else {
        const s = document.createElement("span");
        s.className = "w";
        s.textContent = part;
        frag.append(s);
      }
    });
    node.replaceWith(frag);
  }
  el.dataset.split = "1";
  return [...el.querySelectorAll<HTMLElement>(".w")];
}

/** Count the leading number of an element's text up from 0 ("33,000명+" keeps its suffix). */
function countUp(el: HTMLElement, trigger?: Element | null) {
  el.dataset.text ??= el.textContent ?? "";
  const m = el.dataset.text.match(/^(\D*)([\d,]+)(.*)$/);
  if (!m) return;
  const [, pre, raw, suf] = m;
  const to = Number(raw.replace(/,/g, ""));
  const comma = raw.includes(",");
  const o = { v: 0 };
  const fmt = (v: number) => (comma ? Math.round(v).toLocaleString("ko-KR") : String(Math.round(v)));
  el.textContent = pre + fmt(0) + suf;
  gsap.to(o, {
    v: to,
    duration: 1.4,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = pre + fmt(o.v) + suf;
    },
    scrollTrigger: trigger === null ? undefined : { trigger: trigger ?? el, start: "top 90%", once: true },
  });
}

const reveal = (targets: gsap.TweenTarget, vars: gsap.TweenVars = {}) =>
  gsap.utils.toArray<HTMLElement>(targets).forEach((el) =>
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      ...vars,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    }),
  );

/** All scroll and entrance motion for the landing page. Returns a cleanup function. */
export function initMotion() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  document.documentElement.classList.add("motion");

  // CSS smooth scroll breaks ScrollTrigger measuring: keep smooth anchor jumps in JS instead.
  document.documentElement.style.scrollBehavior = "auto";
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const id = a?.getAttribute("href");
    if (!a || !id || id.length < 2) return;
    const t = document.querySelector(id);
    if (t) {
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth" });
    }
  };
  document.addEventListener("click", onClick);

  const ctx = gsap.context(() => {
    /* 1. hero: lines rise, price cards drop in, amounts count up */
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from(".hero__kicker, .hero__line, .hero__sub", { y: 40, opacity: 0, duration: 0.9, stagger: 0.1 })
      .from(".pcard", { y: 70, opacity: 0, scale: 0.9, duration: 0.9, stagger: 0.09, ease: "back.out(1.5)" }, 0.35)
      .from(".hero .btn-glow", { y: 30, opacity: 0, duration: 0.8 }, 0.7);
    document.querySelectorAll<HTMLElement>(".pcard__amount").forEach((el) => countUp(el, null));

    /* section headings everywhere */
    reveal(".sec__eyebrow, .sec__title, .sec__lead, .sec__note, .num-badge, .worry__big, .moments__lead, .reviews__big");

    /* 2. trust: stats slide in from the side and count */
    gsap.utils.toArray<HTMLElement>(".stat").forEach((el, i) =>
      gsap.from(el, { x: i % 2 ? 60 : -60, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } }),
    );
    document.querySelectorAll<HTMLElement>(".stat__value, .rcard__hero").forEach((el) => countUp(el));

    /* 3. compare: rows fly in from both sides, our column lights up, total counts */
    const cmp = document.querySelector(".cmp");
    if (cmp) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: cmp, start: "top 80%", once: true } });
      tl.from(".cmp__h", { y: -20, opacity: 0, duration: 0.5, stagger: 0.1 })
        .from(".cmp tbody tr .cmp__other", { x: -50, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }, 0.2)
        .from(".cmp tbody tr .cmp__key", { opacity: 0, duration: 0.6, stagger: 0.12 }, 0.2)
        .from(".cmp tbody tr .cmp__ours", { x: 50, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" }, 0.3)
        .add(() => cmp.classList.add("is-lit"), ">-0.1");
    }
    gsap.from(".pill", { scale: 0.6, opacity: 0, duration: 0.7, stagger: 0.12, ease: "back.out(2)", scrollTrigger: { trigger: ".pills", start: "top 88%", once: true } });
    document.querySelectorAll<HTMLElement>(".cmp__ours, .compare__sum strong").forEach((el) => countUp(el, el.closest(".cmp") ?? el));

    /* 4. customers: bars grow from the floor */
    const bars = document.querySelector(".bars");
    if (bars) {
      gsap.from(".bars__bar", { height: 0, duration: 1.3, stagger: 0.25, ease: "power3.out", scrollTrigger: { trigger: bars, start: "top 80%", once: true } });
      gsap.from(".bars__times", { scale: 0, opacity: 0, duration: 0.6, delay: 0.9, ease: "back.out(2.5)", scrollTrigger: { trigger: bars, start: "top 80%", once: true } });
      document.querySelectorAll<HTMLElement>(".bars__bar span").forEach((el) => countUp(el, bars));
    }

    /* 5. consult form */
    reveal(".consult .lf, .consult form", { y: 50 });

    /* 6. worry: bubbles pop (CSS), text lights up word by word while scrolling */
    const cloud = document.querySelector(".worry__cloud");
    if (cloud) ScrollTrigger.create({ trigger: cloud, start: "top 85%", once: true, onEnter: () => cloud.classList.add("is-in") });
    const worry = document.querySelector<HTMLElement>(".worry__text");
    if (worry) {
      const words = splitWords(worry);
      gsap.set(words, { opacity: 0.18 });
      gsap.to(words, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: worry, start: "top 85%", end: "bottom 50%", scrub: true } });
    }
    gsap.from(".worry__line", { scaleY: 0, transformOrigin: "top", duration: 0.9, scrollTrigger: { trigger: ".worry__line", start: "top 85%", once: true } });

    /* 7. reasons: stacking cards, the one underneath shrinks and dims */
    const cards = gsap.utils.toArray<HTMLElement>(".rcard");
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      gsap.to(c, {
        scale: 0.92,
        filter: "brightness(0.8)",
        ease: "none",
        scrollTrigger: { trigger: cards[i + 1], start: "top 85%", end: "top 25%", scrub: true },
      });
    });

    /* 8. moments: chat bubbles pop in turn */
    gsap.utils.toArray<HTMLElement>(".chat__b").forEach((el, i) =>
      gsap.from(el, { x: i % 2 ? 40 : -40, y: 20, scale: 0.85, opacity: 0, duration: 0.7, ease: "back.out(1.8)", delay: i * 0.15, scrollTrigger: { trigger: ".chat", start: "top 80%", once: true } }),
    );

    /* 9. steps: cards scale in one after another */
    gsap.utils.toArray<HTMLElement>(".scard").forEach((el) =>
      gsap.from(el, { scale: 0.86, y: 40, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
    );

    /* 11. final card */
    reveal(".final__card", { y: 60, scale: 0.95 });
  });

  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener("load", refresh);
  document.fonts?.ready.then(refresh);

  return () => {
    ctx.revert();
    document.removeEventListener("click", onClick);
    window.removeEventListener("load", refresh);
    document.documentElement.classList.remove("motion");
    document.documentElement.style.scrollBehavior = "";
  };
}
