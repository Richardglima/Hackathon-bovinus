import { createFileRoute } from "@tanstack/react-router";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { EmptyState, Kpi, PageHeader, Panel, fmt } from "@/components/dashboard/ui";
import { BarChart, LineChart } from "@/components/dashboard/Charts";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Visão geral · Bovinus Intelligence" },
    { name: "description", content: "Painel operacional simulado da unidade Augusta: KPIs, movimento por hora e alertas." },
    { property: "og:title", content: "Visão geral · Bovinus Intelligence" },
    { property: "og:description", content: "Painel operacional simulado da unidade Augusta." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Overview,
});

function Overview() {
  const { data } = useDashboard();
  const k = data.kpis;
  const rows = data.hourly.map((h) => ({ hora: h.hora, clientes: h.clientes, espera_entrada_min: h.esperaEntrada, espera_churrasqueira_min: h.esperaChurrasqueira, ocupacao_pct: h.ocupacao }));
  return (
    <>
      <PageHeader title="Visão geral" subtitle="Indicadores consolidados da operação" csvName="visao-geral" csvRows={rows} />
      {data.vazio ? <EmptyState /> : <>
        <div className="bi-kpis">
          <Kpi label="Clientes atendidos" value={fmt(k.clientes)} />
          <Kpi label="Ticket médio" value={`R$ ${fmt(k.ticketMedio, 2)}`} />
          <Kpi label="Espera média (entrada)" value={`${fmt(k.esperaMedia, 1)} min`} tone={k.esperaMedia > 8 ? "bad" : k.esperaMedia > 5 ? "warn" : "ok"} />
          <Kpi label="Ocupação média" value={`${k.ocupacao}%`} tone={k.ocupacao > 85 ? "warn" : "ok"} />
          <Kpi label="Giro de mesas / dia" value={fmt(k.giro, 1)} />
          <Kpi label="Desperdício" value={`${fmt(k.desperdicioPct, 1)}%`} tone={k.desperdicioPct > 12 ? "bad" : "warn"} />
        </div>
        <div className="bi-grid-2">
          <Panel title="Clientes por hora"><BarChart labels={data.hourly.map((h) => h.hora)} values={data.hourly.map((h) => h.clientes)} /></Panel>
          <Panel title="Tempo de espera por hora (min)"><LineChart labels={data.hourly.map((h) => h.hora)} unit=" min" series={[
            { name: "Entrada / escada", values: data.hourly.map((h) => h.esperaEntrada), color: "var(--gold)" },
            { name: "Churrasqueira", values: data.hourly.map((h) => h.esperaChurrasqueira), color: "var(--ember)" },
          ]} /></Panel>
        </div>
        <Panel title="Alertas operacionais">
          <ul className="bi-alerts">{data.alerts.map((a) => <li key={a.texto} className={`is-${a.nivel}`}><b>{a.nivel === "critico" ? "Crítico" : a.nivel === "atencao" ? "Atenção" : "Info"}</b>{a.texto}</li>)}</ul>
        </Panel>
      </>}
    </>
  );
}
