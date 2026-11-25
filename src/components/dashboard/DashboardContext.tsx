import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getDataset, type Dataset, type Period, type Turno } from "@/data/mock";

interface Ctx { period: Period; setPeriod: (p: Period) => void; turno: Turno; setTurno: (t: Turno) => void; data: Dataset; refresh: () => void; auto: boolean; setAuto: (a: boolean) => void; updatedAt: string; }
const DashboardCtx = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>("hoje");
  const [turno, setTurno] = useState<Turno>("todos");
  const [tick, setTick] = useState(0);
  const [auto, setAuto] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("—");
  const data = useMemo(() => getDataset(period, turno, tick), [period, turno, tick]);
  useEffect(() => { setUpdatedAt(new Date().toLocaleTimeString("pt-BR")); }, [data]);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, [auto]);
  return <DashboardCtx.Provider value={{ period, setPeriod, turno, setTurno, data, refresh: () => setTick((t) => t + 1), auto, setAuto, updatedAt }}>{children}</DashboardCtx.Provider>;
}
export function useDashboard() {
  const c = useContext(DashboardCtx);
  if (!c) throw new Error("useDashboard fora do DashboardProvider");
  return c;
}
