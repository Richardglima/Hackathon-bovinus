import { createFileRoute } from "@tanstack/react-router";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { EmptyState, PageHeader, Panel, Kpi, fmt } from "@/components/dashboard/ui";
import { Donut, HBars } from "@/components/dashboard/Charts";

export const Route = createFileRoute("/mix")({
  head: () => ({ meta: [
    { title: "Mix do prato · Bovinus Intelligence" },
    { name: "description", content: "Proporções estimadas (simuladas) de carnes nobres e acompanhamentos." },
    { property: "og:title", content: "Mix do prato · Bovinus Intelligence" },
    { property: "og:description", content: "Proporções estimadas de carnes nobres e acompanhamentos." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Mix,
});

function Mix() {
  const { data } = useDashboard();
  const nobres = data.mix.filter((m) => m.categoria === "Carne nobre");
  const acomp = data.mix.filter((m) => m.categoria === "Acompanhamento");
  const pn = nobres.reduce((a, b) => a + b.percentual, 0);
  const top = [...nobres].sort((a, b) => b.percentual - a.percentual)[0];
  return (
    <>
      <PageHeader title="Mix do prato" subtitle="Proporção estimada do que vai ao prato" csvName="mix" csvRows={data.mix.map((m) => ({ item: m.nome, categoria: m.categoria, percentual: m.percentual }))} />
      {data.vazio ? <EmptyState /> : <>
        <div className="bi-kpis">
          <Kpi label="Carnes nobres" value={`${fmt(pn, 1)}%`} />
          <Kpi label="Acompanhamentos" value={`${fmt(100 - pn, 1)}%`} />
          <Kpi label="Carne mais servida" value={top?.nome ?? "-"} hint={top ? `${fmt(top.percentual, 1)}% do prato` : ""} />
        </div>
        <div className="bi-grid-3">
          <Panel title="Carnes x acompanhamentos"><Donut parts={[{ label: "Carnes nobres", value: pn, color: "var(--gold)" }, { label: "Acompanhamentos", value: 100 - pn, color: "var(--sage)" }]} /></Panel>
          <Panel title="Carnes nobres"><HBars items={nobres.map((m) => ({ label: m.nome, value: m.percentual }))} /></Panel>
          <Panel title="Acompanhamentos"><HBars items={acomp.map((m) => ({ label: m.nome, value: m.percentual, color: "var(--sage)" }))} /></Panel>
        </div>
        <p className="bi-note">Estimativa simulada para demonstração. Em produção, viria de amostragem ou pesagem integrada à API.</p>
      </>}
    </>
  );
}
