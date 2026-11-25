import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { bindings } from "../bindings.server";

const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

const leadSchema = z.object({
  name: z.string().trim().min(2).max(20),
  phone: z.string().trim().regex(PHONE_RE),
  products: z.array(z.enum(["internet", "mobile", "purifier"])).min(1).max(3),
  contactTime: z.enum(["any", "morning", "afternoon", "evening"]),
  consent: z.literal(true),
  consentThird: z.boolean().optional(),
  marketing: z.boolean().optional(),
  source: z.enum(["form", "bar"]).optional(),
  /** Honeypot: humans never fill this hidden field. */
  website: z.string().max(200).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const submitLead = createServerFn({ method: "POST" })
  .validator(leadSchema)
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    const { DB } = bindings();
    if (!DB) throw new Error("DB binding missing");
    const products = Array.from(new Set(data.products)).join(",");
    await DB.prepare(
      "INSERT INTO leads (name, phone, products, contact_time, consent_at, marketing, source) VALUES (?, ?, ?, ?, datetime('now'), ?, ?)",
    )
      .bind(
        data.name,
        data.phone.replace(/\D/g, ""),
        products,
        data.contactTime,
        data.marketing ? 1 : 0,
        data.source ?? "form",
      )
      .run();
    return { ok: true as const };
  });

export interface LeadRow {
  id: number;
  name: string;
  phone: string;
  products: string;
  contact_time: string;
  marketing: number;
  source: string;
  created_at: string;
}

function sameSecret(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

type AdminResult =
  | { ok: true; leads: LeadRow[] }
  | { ok: false; reason: string };

export const listLeads = createServerFn({ method: "POST" })
  .validator(z.object({ key: z.string().min(1).max(200) }))
  .handler(async ({ data }): Promise<AdminResult> => {
    const env = bindings();
    if (!env.ADMIN_KEY) {
      return { ok: false, reason: "관리자 키가 아직 설정되지 않았어요. npx wrangler secret put ADMIN_KEY 로 등록해 주세요." };
    }
    if (!sameSecret(data.key, env.ADMIN_KEY)) {
      return { ok: false, reason: "관리자 키가 맞지 않아요. 다시 입력해 주세요." };
    }
    if (!env.DB) return { ok: false, reason: "데이터베이스가 연결되지 않았어요." };
    const { results } = await env.DB.prepare(
      "SELECT id, name, phone, products, contact_time, marketing, source, created_at FROM leads ORDER BY id DESC LIMIT 300",
    ).all<LeadRow>();
    return { ok: true, leads: results ?? [] };
  });
