import { asset } from "@/lib/asset";

export type Product = "internet" | "mobile";

export const ART = {
  router: asset("/assets/3d/router.webp"),
  phone: asset("/assets/3d/phone.webp"),
  gift: asset("/assets/3d/gift.webp"),
  magnifier: asset("/assets/3d/magnifier.webp"),
  moneybag: asset("/assets/3d/moneybag.webp"),
  calendar: asset("/assets/3d/calendar.webp"),
  clipboard: asset("/assets/3d/clipboard.webp"),
  trophy: asset("/assets/3d/trophy.webp"),
  ssakSearch: asset("/assets/brand/ssak-00.webp"),
  ssakCheck: asset("/assets/brand/ssak-01.webp"),
  ssakWave: asset("/assets/brand/ssak-02.webp"),
  ssakHappy: asset("/assets/brand/ssak-03.webp"),
  ssakLook: asset("/assets/brand/ssak-04.webp"),
  coins: asset("/assets/3d/coins.webp"),
  chat: asset("/assets/3d/chat.webp"),
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
