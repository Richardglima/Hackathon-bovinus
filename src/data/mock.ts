/**
 * Dados SIMULADOS para o protótipo Bovinus Intelligence.
 * Isolado para ser substituído por chamadas à futura API Java Spring Boot
 * (ver README → "Integração futura"). Nenhum dado vem de câmeras reais.
 */
export type Period = "hoje" | "7d" | "30d";
export type Turno = "todos" | "almoco" | "jantar" | "madrugada";

export interface HourPoint { hora: string; clientes: number; esperaEntrada: number; esperaChurrasqueira: number; ocupacao: number; }
export interface MixItem { nome: string; categoria: "Carne nobre" | "Acompanhamento"; percentual: number; }
export interface QueueStat { local: string; esperaMedia: number; esperaPico: number; pessoasAgora: number; abandono: number; gargalo: string; }
export type TableStatus = "livre" | "ocupada" | "limpeza";
export interface TableInfo { id: number; setor: string; lugares: number; status: TableStatus; minutos: number; }
export interface Leftover { alimento: string; produzidoKg: number; sobraKg: number; saida: number; recomendacao: string; }
export interface Alert { nivel: "critico" | "atencao" | "info"; texto: string; }
export interface Dataset {
  vazio: boolean;
  hourly: HourPoint[];
  kpis: { clientes: number; ticketMedio: number; esperaMedia: number; ocupacao: number; giro: number; desperdicioPct: number; };
  alerts: Alert[];
  mix: MixItem[];
  queues: QueueStat[];
  tables: TableInfo[];
  limpezaMedia: number;
  leftovers: Leftover[];
}

export const PERIOD_LABEL: Record<Period, string> = { hoje: "Hoje", "7d": "Últimos 7 dias", "30d": "Últimos 30 dias" };
export const TURNO_LABEL: Record<Turno, string> = { todos: "Todos os turnos", almoco: "Almoço (11h–15h)", jantar: "Jantar (18h–23h)", madrugada: "Madrugada (fechado)" };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d;

const HOURS: Record<Exclude<Turno, "madrugada">, number[]> = {
  todos: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  almoco: [11, 12, 13, 14, 15],
  jantar: [18, 19, 20, 21, 22, 23],
};
// Perfil de movimento típico de rodízio: pico no almoço e no jantar.
const PROFILE: Record<number, number> = { 11: 0.35, 12: 0.85, 13: 1, 14: 0.7, 15: 0.35, 16: 0.15, 17: 0.2, 18: 0.45, 19: 0.75, 20: 0.95, 21: 0.9, 22: 0.6, 23: 0.3 };
const PERIOD_FACTOR: Record<Period, number> = { hoje: 1, "7d": 1.08, "30d": 1.03 };
const PERIOD_SEED: Record<Period, number> = { hoje: 11, "7d": 77, "30d": 303 };

export function getDataset(period: Period, turno: Turno, tick: number): Dataset {
  const r = rng(PERIOD_SEED[period] * 1000 + tick * 7 + turno.length);
  const empty: Dataset = { vazio: true, hourly: [], kpis: { clientes: 0, ticketMedio: 0, esperaMedia: 0, ocupacao: 0, giro: 0, desperdicioPct: 0 }, alerts: [], mix: [], queues: [], tables: [], limpezaMedia: 0, leftovers: [] };
  if (turno === "madrugada") return empty;

  const f = PERIOD_FACTOR[period];
  const hourly: HourPoint[] = HOURS[turno].map((h) => {
    const p = PROFILE[h] ?? 0.3;
    const noise = 0.9 + r() * 0.2;
    const clientes = Math.round(70 * p * f * noise);
    return {
      hora: `${h}h`,
      clientes,
      esperaEntrada: round(2 + p * 14 * noise, 1),
      esperaChurrasqueira: round(1 + p * 6 * (0.85 + r() * 0.3), 1),
      ocupacao: Math.min(100, Math.round(20 + p * 78 * noise)),
    };
  });
  const days = period === "hoje" ? 1 : period === "7d" ? 7 : 30;
  const clientesDia = hourly.reduce((a, b) => a + b.clientes, 0);
  const esperaMedia = round(hourly.reduce((a, b) => a + b.esperaEntrada, 0) / hourly.length, 1);
  const ocupacao = Math.round(hourly.reduce((a, b) => a + b.ocupacao, 0) / hourly.length);

  const nobres = ["Picanha", "Fraldinha", "Costela", "Cordeiro", "Alcatra", "Maminha"];
  const acomp = ["Arroz", "Farofa", "Saladas", "Pão de queijo", "Batata frita", "Legumes grelhados"];
  const baseN = [24, 15, 12, 6, 10, 8], baseA = [18, 10, 30, 14, 16, 12];
  const mixN = nobres.map((n, i) => ({ nome: n, categoria: "Carne nobre" as const, v: (baseN[i] ?? 5) * (0.85 + r() * 0.3) }));
  const mixA = acomp.map((n, i) => ({ nome: n, categoria: "Acompanhamento" as const, v: (baseA[i] ?? 5) * (0.85 + r() * 0.3) * 0.62 }));
  const all = [...mixN, ...mixA];
  const total = all.reduce((a, b) => a + b.v, 0);
  const mix: MixItem[] = all.map((m) => ({ nome: m.nome, categoria: m.categoria, percentual: round((m.v / total) * 100, 1) }));

  const peak = Math.max(...hourly.map((h) => h.esperaEntrada));
  const peakG = Math.max(...hourly.map((h) => h.esperaChurrasqueira));
  const peakHour = hourly.find((h) => h.esperaEntrada === peak)?.hora ?? "-";
  const queues: QueueStat[] = [
    { local: "Entrada / escada", esperaMedia: esperaMedia, esperaPico: peak, pessoasAgora: Math.round(4 + r() * 14), abandono: round(2 + peak * 0.45 + r(), 1), gargalo: `Pico às ${peakHour}: recepção única na escada` },
    { local: "Churrasqueira", esperaMedia: round(hourly.reduce((a, b) => a + b.esperaChurrasqueira, 0) / hourly.length, 1), esperaPico: peakG, pessoasAgora: Math.round(2 + r() * 8), abandono: round(1 + peakG * 0.4 + r(), 1), gargalo: "Reposição de picanha abaixo da demanda no pico" },
  ];

  const setores = ["Salão A", "Salão B", "Varanda"];
  const occP = ocupacao / 100;
  const tables: TableInfo[] = Array.from({ length: 36 }, (_, i) => {
    const x = r();
    const status: TableStatus = x < occP * 0.85 ? "ocupada" : x < occP * 0.85 + 0.12 ? "limpeza" : "livre";
    return { id: i + 1, setor: setores[Math.floor(i / 12)] ?? "Salão A", lugares: [2, 4, 4, 6][i % 4] ?? 4, status, minutos: status === "ocupada" ? Math.round(10 + r() * 80) : status === "limpeza" ? Math.round(1 + r() * 12) : 0 };
  });
  const limpezaMedia = round(4 + r() * 3 + occP * 2, 1);
  const giro = round((clientesDia / 3.1 / 36) * (turno === "todos" ? 1 : 0.55), 1);

  const foods: [string, number][] = [["Picanha", 0.04], ["Costela", 0.12], ["Cordeiro", 0.22], ["Arroz", 0.15], ["Farofa", 0.09], ["Saladas", 0.18], ["Pão de queijo", 0.07], ["Legumes grelhados", 0.27], ["Batata frita", 0.1]];
  const leftovers: Leftover[] = foods.map(([alimento, base]) => {
    const produzidoKg = round((8 + r() * 22) * days * (turno === "todos" ? 1 : 0.55), 1);
    const pct = Math.min(0.45, base * (0.8 + r() * 0.4));
    const saida = Math.round((1 - pct) * 100);
    return {
      alimento, produzidoKg, sobraKg: round(produzidoKg * pct, 1), saida,
      recomendacao: pct > 0.2 ? "Reduzir produção em ~20% e preparar em lotes menores" : pct > 0.12 ? "Ajustar reposição ao horário de pico" : "Manter produção atual",
    };
  });
  const prod = leftovers.reduce((a, b) => a + b.produzidoKg, 0);
  const sobra = leftovers.reduce((a, b) => a + b.sobraKg, 0);

  const alerts: Alert[] = [];
  if (peak > 12) alerts.push({ nivel: "critico", texto: `Espera na entrada chegou a ${peak} min às ${peakHour}.` });
  const lim = tables.filter((t) => t.status === "limpeza").length;
  if (lim >= 4) alerts.push({ nivel: "atencao", texto: `${lim} mesas aguardando limpeza agora.` });
  const worst = [...leftovers].sort((a, b) => a.saida - b.saida)[0];
  if (worst) alerts.push({ nivel: "atencao", texto: `${worst.alimento} com baixa saída (${worst.saida}%).` });
  alerts.push({ nivel: "info", texto: `Ocupação média de ${ocupacao}% no período.` });

  return {
    vazio: false, hourly, mix, queues, tables, limpezaMedia, leftovers, alerts,
    kpis: { clientes: clientesDia * days, ticketMedio: round(129.9 + r() * 12, 2), esperaMedia, ocupacao, giro, desperdicioPct: round((sobra / prod) * 100, 1) },
  };
}
