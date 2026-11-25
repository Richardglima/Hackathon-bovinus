import type { ReactNode } from "react";
import { Download, Inbox } from "lucide-react";
import { downloadCsv } from "@/lib/csv";
import { useDashboard } from "./DashboardContext";
import { PERIOD_LABEL, TURNO_LABEL } from "@/data/mock";

export function PageHeader({ title, subtitle, csvName, csvRows }: { title: string; subtitle: string; csvName: string; csvRows: Record<string, string | number>[] }) {
  const { period, turno } = useDashboard();
  return (
    <div className="bi-page-head">
      <div>
        <h1>{title}</h1>
        <p>{subtitle} · <span className="bi-tag">{PERIOD_LABEL[period]} · {TURNO_LABEL[turno]}</span></p>
      </div>
      <button className="bi-btn" disabled={csvRows.length === 0} onClick={() => downloadCsv(`bovinus-${csvName}-${period}-${turno}.csv`, csvRows)}>
        <Download size={16} aria-hidden="true" /> Exportar CSV
      </button>
    </div>
  );
}
export function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return <section className={`bi-panel ${className}`} aria-label={title}><h2>{title}</h2>{children}</section>;
}
export function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "ok" | "warn" | "bad" }) {
  return <div className={`bi-kpi ${tone ? `is-${tone}` : ""}`}><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div>;
}
export function EmptyState() {
  const { setTurno } = useDashboard();
  return (
    <div className="bi-empty" role="status">
      <Inbox size={40} aria-hidden="true" />
      <h2>Sem dados para este filtro</h2>
      <p>A unidade não opera neste turno, então não há registros simulados.</p>
      <button className="bi-btn" onClick={() => setTurno("todos")}>Ver todos os turnos</button>
    </div>
  );
}
export const fmt = (n: number, d = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
