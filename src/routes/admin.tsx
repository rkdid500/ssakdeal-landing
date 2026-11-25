import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { LogoMark } from "@/components/brand/logo";
import { listLeads, type LeadRow } from "@/lib/api/leads.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "상담 신청 관리" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

const PRODUCT_LABEL: Record<string, string> = { internet: "인터넷", mobile: "휴대폰", purifier: "정수기" };
const TIME_LABEL: Record<string, string> = { any: "아무 때나", morning: "오전", afternoon: "오후", evening: "저녁" };

function prettyPhone(p: string) {
  if (p.length === 11) return `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`;
  if (p.length === 10) return `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`;
  return p;
}

function AdminPage() {
  const [key, setKey] = useState("");
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!key.trim()) {
      setMessage("관리자 키를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await listLeads({ data: { key: key.trim() } });
      if (res.ok) {
        setLeads(res.leads);
      } else {
        setLeads(null);
        setMessage(res.reason);
      }
    } catch {
      setMessage("목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin">
      <div className="admin__inner">
        <a className="site-header__brand" href="/">
          <LogoMark />
          <span className="site-header__word">딱맞춤</span>
        </a>
        <h1 className="admin__title">상담 신청 관리</h1>
        <form className="admin__form" onSubmit={load}>
          <label className="field__label" htmlFor="admin-key">관리자 키</label>
          <div className="admin__row">
            <input
              autoComplete="current-password"
              className="field__input"
              id="admin-key"
              onChange={(e) => setKey(e.target.value)}
              type="password"
              value={key}
            />
            <button className="admin__load" disabled={loading} type="submit">
              {loading ? "불러오는 중" : "목록 불러오기"}
            </button>
          </div>
          {message ? <p className="field__error" role="alert">{message}</p> : null}
        </form>

        {leads ? (
          leads.length === 0 ? (
            <p className="admin__empty">아직 들어온 상담 신청이 없어요. 신청이 들어오면 여기에 최신순으로 표시돼요.</p>
          ) : (
            <div className="admin__scroll">
              <table className="admin__table">
                <caption className="sr-only">상담 신청 목록, 최신순</caption>
                <thead>
                  <tr>
                    <th scope="col">신청 시각 (UTC)</th>
                    <th scope="col">이름</th>
                    <th scope="col">연락처</th>
                    <th scope="col">관심 상품</th>
                    <th scope="col">희망 시간</th>
                    <th scope="col">마케팅 동의</th>
                    <th scope="col">접수 경로</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.created_at}</td>
                      <td>{lead.name}</td>
                      <td><a href={`tel:${lead.phone}`}>{prettyPhone(lead.phone)}</a></td>
                      <td>{lead.products.split(",").map((p) => PRODUCT_LABEL[p] ?? p).join(", ")}</td>
                      <td>{TIME_LABEL[lead.contact_time] ?? lead.contact_time}</td>
                      <td>{lead.marketing ? "동의" : "미동의"}</td>
                      <td>{lead.source === "bar" ? "하단 바" : "신청 폼"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}
      </div>
    </main>
  );
}
