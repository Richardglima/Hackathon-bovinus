/** Gráficos SVG leves, sem dependências. */
export interface Series { name: string; values: number[]; color: string; }

export function LineChart({ labels, series, unit = "", height = 220 }: { labels: string[]; series: Series[]; unit?: string; height?: number }) {
  const w = 640, h = height, p = 32;
  const max = Math.max(1, ...series.flatMap((s) => s.values)) * 1.1;
  const x = (i: number) => p + (i * (w - p * 2)) / Math.max(1, labels.length - 1);
  const y = (v: number) => h - p - (v / max) * (h - p * 2);
  const desc = series.map((s) => `${s.name}: ${s.values.map((v, i) => `${labels[i]} ${v}${unit}`).join(", ")}`).join(". ");
  return (
    <figure className="bi-chart">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={desc}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => <g key={t}><line x1={p} x2={w - p} y1={y(max * t)} y2={y(max * t)} className="bi-grid" /><text x={4} y={y(max * t) + 4} className="bi-axis">{Math.round(max * t)}</text></g>)}
        {labels.map((l, i) => <text key={l} x={x(i)} y={h - 8} textAnchor="middle" className="bi-axis">{l}</text>)}
        {series.map((s) => (
          <g key={s.name}>
            <polyline fill="none" stroke={s.color} strokeWidth={2.5} points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
            {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill={s.color}><title>{`${s.name} · ${labels[i]}: ${v}${unit}`}</title></circle>)}
          </g>
        ))}
      </svg>
      <figcaption className="bi-legend">{series.map((s) => <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>)}</figcaption>
    </figure>
  );
}

export function BarChart({ labels, values, color = "var(--gold)", unit = "", height = 220 }: { labels: string[]; values: number[]; color?: string; unit?: string; height?: number }) {
  const w = 640, h = height, p = 32;
  const max = Math.max(1, ...values) * 1.1;
  const bw = (w - p * 2) / Math.max(1, values.length);
  return (
    <figure className="bi-chart">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={labels.map((l, i) => `${l}: ${values[i]}${unit}`).join(", ")}>
        {[0, 0.5, 1].map((t) => <line key={t} x1={p} x2={w - p} y1={h - p - t * (h - p * 2)} y2={h - p - t * (h - p * 2)} className="bi-grid" />)}
        {values.map((v, i) => {
          const bh = (v / max) * (h - p * 2);
          return <g key={i}><rect x={p + i * bw + bw * 0.15} y={h - p - bh} width={bw * 0.7} height={bh} rx={4} fill={color}><title>{`${labels[i]}: ${v}${unit}`}</title></rect><text x={p + i * bw + bw / 2} y={h - 8} textAnchor="middle" className="bi-axis">{labels[i]}</text></g>;
        })}
      </svg>
    </figure>
  );
}

export function HBars({ items, unit = "%", max }: { items: { label: string; value: number; color?: string }[]; unit?: string; max?: number }) {
  const m = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="bi-hbars">
      {items.map((it) => (
        <li key={it.label}>
          <span className="bi-hbar-label">{it.label}</span>
          <span className="bi-hbar-track" aria-hidden="true"><span style={{ width: `${(it.value / m) * 100}%`, background: it.color ?? "var(--gold)" }} /></span>
          <span className="bi-hbar-val">{it.value.toLocaleString("pt-BR")}{unit}</span>
        </li>
      ))}
    </ul>
  );
}

export function Donut({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((a, b) => a + b.value, 0) || 1;
  let acc = 0;
  const r = 60, c = 2 * Math.PI * r;
  return (
    <figure className="bi-donut">
      <svg viewBox="0 0 160 160" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(", ")}>
        {parts.map((p) => { const len = (p.value / total) * c; const el = <circle key={p.label} cx={80} cy={80} r={r} fill="none" stroke={p.color} strokeWidth={22} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} transform="rotate(-90 80 80)" />; acc += len; return el; })}
      </svg>
      <figcaption className="bi-legend">{parts.map((p) => <span key={p.label}><i style={{ background: p.color }} />{p.label} · {Math.round((p.value / total) * 100)}%</span>)}</figcaption>
    </figure>
  );
}
