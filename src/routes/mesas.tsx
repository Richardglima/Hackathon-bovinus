import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { EmptyState, PageHeader, Panel, Kpi, fmt } from "@/components/dashboard/ui";
import type { TableStatus } from "@/data/mock";

export const Route = createFileRoute("/mesas")({
  head: () => ({ meta: [
    { title: "Mesas · Bovinus Intelligence" },
    { name: "description", content: "Mapa simulado de mesas: livres, ocupadas e aguardando limpeza." },
    { property: "og:title", content: "Mesas · Bovinus Intelligence" },
    { property: "og:description", content: "Mapa simulado de status das mesas." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Mesas,
});

const LABEL: Record<TableStatus, string> = { livre: "Livre", ocupada: "Ocupada", limpeza: "Aguardando limpeza" };

function Mesas() {
  const { data } = useDashboard();
  const [filtro, setFiltro] = useState<TableStatus | "todas">("todas");
  const count = (s: TableStatus) => data.tables.filter((t) => t.status === s).length;
  const setores = [...new Set(data.tables.map((t) => t.setor))];
  const visible = data.tables.filter((t) => filtro === "todas" || t.status === filtro);
  return (
    <>
      <PageHeader title="Mesas" subtitle="Mapa de status, limpeza e giro" csvName="mesas" csvRows={data.tables.map((t) => ({ mesa: t.id, setor: t.setor, lugares: t.lugares, status: LABEL[t.status], minutos_no_status: t.minutos }))} />
      {data.vazio ? <EmptyState /> : <>
        <div className="bi-kpis">
          <Kpi label="Livres" value={String(count("livre"))} tone="ok" />
          <Kpi label="Ocupadas" value={String(count("ocupada"))} />
          <Kpi label="Aguardando limpeza" value={String(count("limpeza"))} tone={count("limpeza") >= 4 ? "bad" : "warn"} />
          <Kpi label="Tempo médio de limpeza" value={`${fmt(data.limpezaMedia, 1)} min`} />
          <Kpi label="Giro por mesa / dia" value={fmt(data.kpis.giro, 1)} />
        </div>
        <div className="bi-chips" role="group" aria-label="Filtrar mesas por status">
          {(["todas", "livre", "ocupada", "limpeza"] as const).map((s) => (
            <button key={s} className={`bi-chip ${filtro === s ? "is-active" : ""}`} aria-pressed={filtro === s} onClick={() => setFiltro(s)}>{s === "todas" ? "Todas" : LABEL[s]}</button>
          ))}
        </div>
        {visible.length === 0 ? <div className="bi-empty" role="status"><h2>Nenhuma mesa com este status</h2><p>Escolha outro filtro.</p></div> :
          setores.map((s) => {
            const ts = visible.filter((t) => t.setor === s);
            if (ts.length === 0) return null;
            return (
              <Panel key={s} title={s}>
                <ul className="bi-tables">
                  {ts.map((t) => (
                    <li key={t.id} className={`bi-table is-${t.status}`} aria-label={`Mesa ${t.id}, ${t.lugares} lugares, ${LABEL[t.status]}${t.minutos ? `, há ${t.minutos} min` : ""}`}>
                      <strong>{String(t.id).padStart(2, "0")}</strong>
                      <span>{t.lugares} lug.</span>
                      <small>{LABEL[t.status]}{t.minutos ? ` · ${t.minutos}m` : ""}</small>
                    </li>
                  ))}
                </ul>
              </Panel>
            );
          })}
      </>}
    </>
  );
}
