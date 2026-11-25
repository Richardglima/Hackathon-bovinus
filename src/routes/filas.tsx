import { createFileRoute } from "@tanstack/react-router";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { EmptyState, PageHeader, Panel, Kpi, fmt } from "@/components/dashboard/ui";
import { LineChart } from "@/components/dashboard/Charts";

export const Route = createFileRoute("/filas")({
  head: () => ({ meta: [
    { title: "Filas · Bovinus Intelligence" },
    { name: "description", content: "Espera, gargalos e abandono simulados na entrada e na churrasqueira." },
    { property: "og:title", content: "Filas · Bovinus Intelligence" },
    { property: "og:description", content: "Espera, gargalos e abandono simulados." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Filas,
});

function Filas() {
  const { data } = useDashboard();
  return (
    <>
      <PageHeader title="Filas" subtitle="Entrada/escada e churrasqueira" csvName="filas" csvRows={data.queues.map((q) => ({ local: q.local, espera_media_min: q.esperaMedia, espera_pico_min: q.esperaPico, pessoas_agora: q.pessoasAgora, abandono_pct: q.abandono, gargalo: q.gargalo }))} />
      {data.vazio ? <EmptyState /> : <>
        <div className="bi-grid-2">
          {data.queues.map((q) => (
            <Panel key={q.local} title={q.local}>
              <div className="bi-kpis bi-kpis-sm">
                <Kpi label="Espera média" value={`${fmt(q.esperaMedia, 1)} min`} />
                <Kpi label="Pico" value={`${fmt(q.esperaPico, 1)} min`} tone={q.esperaPico > 12 ? "bad" : "warn"} />
                <Kpi label="Na fila agora" value={String(q.pessoasAgora)} />
                <Kpi label="Abandono (sim.)" value={`${fmt(q.abandono, 1)}%`} tone={q.abandono > 6 ? "bad" : "ok"} />
              </div>
              <p className="bi-bottleneck"><b>Gargalo:</b> {q.gargalo}</p>
            </Panel>
          ))}
        </div>
        <Panel title="Espera ao longo do dia (min)">
          <LineChart labels={data.hourly.map((h) => h.hora)} unit=" min" series={[
            { name: "Entrada / escada", values: data.hourly.map((h) => h.esperaEntrada), color: "var(--gold)" },
            { name: "Churrasqueira", values: data.hourly.map((h) => h.esperaChurrasqueira), color: "var(--ember)" },
          ]} />
        </Panel>
      </>}
    </>
  );
}
