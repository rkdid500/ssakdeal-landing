export type Product = "internet" | "mobile";

export const ART = {
  router: "/assets/3d/router.webp",
  phone: "/assets/3d/phone.webp",
  gift: "/assets/3d/gift.webp",
  magnifier: "/assets/3d/magnifier.webp",
  moneybag: "/assets/3d/moneybag.webp",
  calendar: "/assets/3d/calendar.webp",
  clipboard: "/assets/3d/clipboard.webp",
  trophy: "/assets/3d/trophy.webp",
  ssakSearch: "/assets/brand/ssak-00.webp",
  ssakCheck: "/assets/brand/ssak-01.webp",
  ssakWave: "/assets/brand/ssak-02.webp",
  ssakHappy: "/assets/brand/ssak-03.webp",
  ssakLook: "/assets/brand/ssak-04.webp",
  coins: "/assets/3d/coins.webp",
  chat: "/assets/3d/chat.webp",
} as const;

export const PRODUCTS: { value: Product; label: string; art: string }[] = [
  { value: "internet", label: "인터넷", art: ART.router },
  { value: "mobile", label: "휴대폰", art: ART.phone },
];

export const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

export function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length < 11) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
