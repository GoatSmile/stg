// Visual companion to HindsightCard — the same hindsight.json items drawn on one
// shared time axis, so you can SEE the lead time and where "today" falls (the bars
// to the left of the today line have already landed; a bar extending past it is the
// runway still ahead). Pure server-rendered SVG: no client JS, no chart lib. The
// axis domain is computed from the data, so adding an event to hindsight.json just
// slots in and the whole timeline rescales to fit — see HindsightCard for the fields.

type TimelineItem = {
  eventId: string;
  label: string;
  shortLabel?: string;
  signalDate: string;
  effectDate: string;
  status: string;
};

// "2025-09-05" → ms; a bare year ("2028") is treated as 1 Jan of that year.
function parseDate(d: string): number {
  const s = d.trim();
  const iso = /^\d{4}$/.test(s) ? `${s}-01-01` : s;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : Date.parse(`${s.slice(0, 4)}-01-01`);
}

const isProposed = (status: string) => /propos/i.test(status);

export function HindsightTimeline({ items }: { items: TimelineItem[] }) {
  if (!items?.length) return null;

  const rows = items.map((it) => ({
    ...it,
    signalT: parseDate(it.signalDate),
    effectT: parseDate(it.effectDate),
  }));

  const minT = Math.min(...rows.map((r) => r.signalT));
  const maxT = Math.max(...rows.map((r) => r.effectT));
  const pad = Math.max(maxT - minT, 1) * 0.03;
  const domMin = minT - pad;
  const domMax = maxT + pad;

  // Geometry. viewBox width ~matches the card's desktop inner width so text renders
  // close to 1:1; width="100%" scales it to whatever the card actually is.
  const W = 1000;
  const padL = 140;
  const padR = 24;
  const plotW = W - padL - padR;
  const x = (t: number) => padL + ((t - domMin) / (domMax - domMin)) * plotW;

  const yTop = 32;
  const rowH = 32;
  const barH = 16;
  const axisY = yTop + rows.length * rowH + 10;
  const H = axisY + 52;

  const now = Date.now();
  const showToday = now >= domMin && now <= domMax;
  const todayX = x(now);
  const todayAnchor = todayX < padL + 34 ? "start" : todayX > W - padR - 34 ? "end" : "middle";

  // Year gridlines: 1 Jan of each year that falls inside the visible domain.
  const ticks: { x: number; label: string }[] = [];
  for (let y = new Date(domMin).getUTCFullYear(); y <= new Date(domMax).getUTCFullYear(); y++) {
    const t = Date.UTC(y, 0, 1);
    if (t >= domMin && t <= domMax) ticks.push({ x: x(t), label: String(y) });
  }

  const shortOf = (it: TimelineItem) => {
    const s = it.shortLabel ?? it.label;
    return s.length > 18 ? `${s.slice(0, 17)}…` : s;
  };

  const muted = "var(--muted-foreground)";
  const border = "var(--border)";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Timeline of regulatory events from first public signal to the date each takes effect, with a marker for today."
      className="overflow-visible"
    >
      <title>Regulatory lead-time timeline</title>
      <desc>
        Each bar runs from when a measure first entered the public record to when it takes effect.
        Bars ending left of the &quot;today&quot; line are already in force; a bar extending past it is
        the runway still ahead.
      </desc>

      {/* year gridlines + labels */}
      {ticks.map((tk) => (
        <g key={tk.label}>
          <line x1={tk.x} y1={yTop - 8} x2={tk.x} y2={axisY} stroke={border} strokeWidth={1} />
          <text x={tk.x} y={axisY + 18} textAnchor="middle" fontSize={12} fill={muted}>
            {tk.label}
          </text>
        </g>
      ))}

      {/* baseline */}
      <line x1={padL} y1={axisY} x2={W - padR} y2={axisY} stroke={border} strokeWidth={1} />

      {/* event bars + left labels */}
      {rows.map((r, i) => {
        const barTop = yTop + i * rowH;
        const x1 = x(r.signalT);
        const x2 = x(r.effectT);
        const w = Math.max(x2 - x1, 3);
        const fill = isProposed(r.status) ? "var(--threat-medium)" : "var(--primary)";
        return (
          <g key={r.eventId}>
            <text x={padL - 12} y={barTop + barH / 2} textAnchor="end" dominantBaseline="central" fontSize={13} fill="var(--foreground)">
              {shortOf(r)}
            </text>
            <rect x={x1} y={barTop} width={w} height={barH} rx={3} fill={fill} />
          </g>
        );
      })}

      {/* today marker */}
      {showToday && (
        <g>
          <line x1={todayX} y1={yTop - 16} x2={todayX} y2={axisY} stroke={muted} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={todayX} y={yTop - 21} textAnchor={todayAnchor} fontSize={12} fill={muted}>
            today
          </text>
        </g>
      )}

      {/* legend */}
      <g>
        <rect x={padL} y={axisY + 30} width={12} height={12} rx={3} fill="var(--primary)" />
        <text x={padL + 18} y={axisY + 40} fontSize={12} fill={muted}>
          in force
        </text>
        <rect x={padL + 92} y={axisY + 30} width={12} height={12} rx={3} fill="var(--threat-medium)" />
        <text x={padL + 110} y={axisY + 40} fontSize={12} fill={muted}>
          proposed
        </text>
        <text x={W - padR} y={axisY + 40} textAnchor="end" fontSize={12} fill={muted}>
          left = first signal · right = takes effect
        </text>
      </g>
    </svg>
  );
}
