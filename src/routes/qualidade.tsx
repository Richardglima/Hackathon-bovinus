import { createFileRoute } from "@tanstack/react-router";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { EmptyState, PageHeader, Panel, Kpi, fmt } from "@/components/dashboard/ui";
import { HBars } from "@/components/dashboard/Charts";

export const Route = createFileRoute("/qualidade")({
  head: () => ({ meta: [
    { title: "Qualidade e sobras · Bovinus Intelligence" },
    { name: "description", content: "Sobras simuladas por alimento, itens de baixa saída e recomendações." },
    { property: "og:title", content: "Qualidade e sobras · Bovinus Intelligence" },
    { property: "og:description", content: "Sobras por alimento e recomendações." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Qualidade,
});

function Qualidade() {
  const { data } = useDashboard();
  const sorted = [...data.leftovers].sort((a, b) => b.sobraKg - a.sobraKg);
  const total = data.leftovers.reduce((a, b) => a + b.sobraKg, 0);
  const baixa = data.leftovers.filter((l) => l.saida < 85);
  return (
    <>
      <PageHeader title="Qualidade e sobras" subtitle="Desperdício por alimento e itens de baixa saída" csvName="sobras" csvRows={data.leftovers.map((l) => ({ alimento: l.alimento, produzido_kg: l.produzidoKg, sobra_kg: l.sobraKg, saida_pct: l.saida, recomendacao: l.recomendacao }))} />
      {data.vazio ? <EmptyState /> : <>
        <div className="bi-kpis">
          <Kpi label="Sobra total" value={`${fmt(total, 1)} kg`} />
          <Kpi label="Desperdício" value={`${fmt(data.kpis.desperdicioPct, 1)}%`} tone={data.kpis.desperdicioPct > 12 ? "bad" : "warn"} />
          <Kpi label="Itens com baixa saída" value={String(baixa.length)} hint="saída abaixo de 85%" />
        </div>
        <div className="bi-grid-2">
          <Panel title="Sobra por alimento (kg)"><HBars unit=" kg" items={sorted.map((l) => ({ label: l.alimento, value: l.sobraKg, color: l.saida < 80 ? "var(--ember)" : "var(--gold)" }))} /></Panel>
          <Panel title="Recomendações">
            <div className="bi-table-wrap">
              <table className="bi-data">
                <thead><tr><th scope="col">Alimento</th><th scope="col">Saída</th><th scope="col">Recomendação</th></tr></thead>
                <tbody>{[...data.leftovers].sort((a, b) => a.saida - b.saida).map((l) => (
                  <tr key={l.alimento}><td>{l.alimento}</td><td className={l.saida < 80 ? "is-bad" : l.saida < 88 ? "is-warn" : "is-ok"}>{l.saida}%</td><td>{l.recomendacao}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </Panel>
        </div>
      </>}
    </>
  );
}
