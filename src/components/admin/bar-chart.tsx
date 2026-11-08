// Bar chart in the Figma style (docs/specs/admin/04.md): lilac bars, the last one pink, 5 grid lines.
// Plain SVG, no chart library. Values must be real counts; the caller shows an empty state if all are 0.

function niceMax(v: number) {
  if (v <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 4, 5, 10]) if (m * step >= v) return m * step;
  return 10 * step;
}

export function BarChart({ values, labels, label, width = 728 }: { values: number[]; labels: string[]; label: string; width?: number }) {
  const W = width;
  const H = 234;
  const plotLeft = 48;
  const plotRight = W - 8;
  const top = 14;
  const bottom = 186;
  const max = niceMax(Math.max(...values, 1));
  const step = (plotRight - plotLeft) / values.length;
  const barW = Math.min(29.12, step * 0.6);
  const grid = [0, 1, 2, 3, 4].map((i) => ({ y: top + ((bottom - top) * i) / 4, v: Math.round(max - (max * i) / 4) }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label} className="block">
      {grid.map((g) => (
        <g key={g.y}>
          <line x1={plotLeft} x2={plotRight} y1={g.y} y2={g.y} stroke="var(--bf-border)" strokeWidth={1} />
          <text x={38} y={g.y + 4} textAnchor="end" fill="var(--bf-muted)" fontSize={12}>
            {g.v}
          </text>
        </g>
      ))}
      {values.map((v, i) => {
        const h = ((bottom - top) * v) / max;
        const x = plotLeft + step * i + (step - barW) / 2;
        return (
          <g key={i}>
            <title>{`${labels[i]}: ${v}`}</title>
            <rect x={x} y={bottom - h} width={barW} height={Math.max(h, 0)} rx={Math.min(8, h / 2)} fill={i === values.length - 1 ? "var(--bf-chart)" : "var(--bf-primary)"} />
          </g>
        );
      })}
      {values.map((_, i) =>
        i % Math.ceil(values.length / 6) === 0 || i === values.length - 1 ? (
          <text key={i} x={plotLeft + step * i + step / 2} y={214} textAnchor="middle" fill="var(--bf-muted)" fontSize={12}>
            {labels[i]}
          </text>
        ) : null,
      )}
    </svg>
  );
}
