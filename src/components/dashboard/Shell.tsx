import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, PieChart, Users, Armchair, Leaf, Menu, X, RefreshCw, Pause, Play, FlaskConical } from "lucide-react";
import { useDashboard } from "./DashboardContext";
import { PERIOD_LABEL, TURNO_LABEL, type Period, type Turno } from "@/data/mock";

const NAV = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard },
  { to: "/mix", label: "Mix do prato", icon: PieChart },
  { to: "/filas", label: "Filas", icon: Users },
  { to: "/mesas", label: "Mesas", icon: Armchair },
  { to: "/qualidade", label: "Qualidade e sobras", icon: Leaf },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { period, setPeriod, turno, setTurno, refresh, auto, setAuto, updatedAt } = useDashboard();
  return (
    <div className="bi-app">
      <a href="#conteudo" className="bi-skip">Pular para o conteúdo</a>
      <aside className={`bi-sidebar ${open ? "is-open" : ""}`} aria-label="Navegação principal">
        <div className="bi-brand">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--gold)" /><path d="M7 10c2 0 3 2 5 2h8c2 0 3-2 5-2-1 3-2 4-4 5v4c0 3-2 5-5 5s-5-2-5-5v-4c-2-1-3-2-4-5z" fill="var(--background)" /></svg>
          <div><strong>Bovinus</strong><span>Intelligence</span></div>
          <button className="bi-icon-btn bi-close" onClick={() => setOpen(false)} aria-label="Fechar menu"><X size={18} /></button>
        </div>
        <nav>
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setOpen(false)} className={`bi-nav ${path === n.to ? "is-active" : ""}`} aria-current={path === n.to ? "page" : undefined}>
                  <n.icon size={18} aria-hidden="true" /> {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="bi-unit">
          <small>Unidade</small><strong>Augusta · São Paulo</strong>
          <small>Hackathon FMU TECH</small>
        </div>
      </aside>
      {open && <div className="bi-overlay" onClick={() => setOpen(false)} aria-hidden="true" />}
      <div className="bi-main">
        <div className="bi-sim" role="note"><FlaskConical size={14} aria-hidden="true" /> Dados simulados — protótipo. Nenhuma câmera ou visão computacional real está conectada.</div>
        <header className="bi-topbar">
          <button className="bi-icon-btn bi-menu" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div className="bi-filters">
            <label>Período
              <select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
                {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => <option key={p} value={p}>{PERIOD_LABEL[p]}</option>)}
              </select>
            </label>
            <label>Turno
              <select value={turno} onChange={(e) => setTurno(e.target.value as Turno)}>
                {(Object.keys(TURNO_LABEL) as Turno[]).map((t) => <option key={t} value={t}>{TURNO_LABEL[t]}</option>)}
              </select>
            </label>
          </div>
          <div className="bi-actions">
            <span className="bi-updated" aria-live="polite">Atualizado {updatedAt}</span>
            <button className="bi-btn" onClick={refresh}><RefreshCw size={16} aria-hidden="true" /> Atualizar</button>
            <button className="bi-btn bi-btn-ghost" onClick={() => setAuto(!auto)} aria-pressed={auto}>
              {auto ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />} {auto ? "Pausar ao vivo" : "Ao vivo (10s)"}
            </button>
          </div>
        </header>
        <main id="conteudo" className="bi-content">{children}</main>
      </div>
    </div>
  );
}
