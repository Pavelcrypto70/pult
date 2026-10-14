"use client";

import { cn } from "@/lib/utils";

export function SoftLineChart({
  values,
  labels,
  className,
}: {
  values: number[];
  labels: readonly string[];
  className?: string;
}) {
  const w = 360;
  const h = 160;
  const pad = { l: 8, r: 8, t: 16, b: 28 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.1);
  const pts = values.map((v, i) => {
    const x = pad.l + (pw * i) / Math.max(values.length - 1, 1);
    const y = pad.t + ph - ((v - min) / span) * ph * 0.85 - ph * 0.05;
    return { x, y };
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${pad.t + ph} L${pts[0].x},${pad.t + ph} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-[160px] w-full overflow-visible", className)}
      role="img"
      aria-label="График выручки по неделям"
    >
      {[0, 1, 2, 3].map((i) => {
        const y = pad.t + (ph * i) / 3;
        return (
          <line
            key={i}
            x1={pad.l}
            x2={w - pad.r}
            y1={y}
            y2={y}
            stroke="rgba(12,18,16,0.06)"
            strokeWidth="1"
          />
        );
      })}
      <path d={area} fill="rgba(11,107,86,0.12)" className="pult-chart-rise" />
      <path
        d={line}
        fill="none"
        stroke="#0b6b56"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pult-chart-rise"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.2"
          fill="#fff"
          stroke="#0b6b56"
          strokeWidth="1.6"
          className="pult-chart-rise"
          style={{ animationDelay: `${80 + i * 40}ms` }}
        />
      ))}
      {labels.map((label, i) => (
        <text
          key={label}
          x={pts[i]?.x ?? 0}
          y={h - 8}
          textAnchor="middle"
          className="fill-[var(--muted-foreground)]"
          style={{ fontSize: 9 }}
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

export function SoftGroupedBars({
  won,
  lost,
  labels,
  className,
}: {
  won: number[];
  lost: number[];
  labels: readonly string[];
  className?: string;
}) {
  const w = 320;
  const h = 160;
  const pad = { l: 8, r: 8, t: 20, b: 28 };
  const pw = w - pad.l - pad.r;
  const ph = h - pad.t - pad.b;
  const max = Math.max(...won, ...lost, 1);
  const group = pw / won.length;
  const bw = group * 0.28;

  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-0 right-0 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-[var(--pult-accent)]" /> Успех
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-[#c5cdc8]" /> Отказ
        </span>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-[160px] w-full"
        role="img"
        aria-label="Успех и отказ по неделям"
      >
        {[0, 1, 2, 3].map((i) => {
          const y = pad.t + (ph * i) / 3;
          return (
            <line
              key={i}
              x1={pad.l}
              x2={w - pad.r}
              y1={y}
              y2={y}
              stroke="rgba(12,18,16,0.06)"
              strokeWidth="1"
            />
          );
        })}
        {won.map((v, i) => {
          const gx = pad.l + i * group + group * 0.22;
          const ha = (v / max) * ph * 0.9;
          const hb = (lost[i] / max) * ph * 0.9;
          return (
            <g key={labels[i]} className="pult-chart-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <rect
                x={gx}
                y={pad.t + ph - ha}
                width={bw}
                height={ha}
                rx="3"
                fill="#0b6b56"
              />
              <rect
                x={gx + bw + 3}
                y={pad.t + ph - hb}
                width={bw}
                height={hb}
                rx="3"
                fill="#c5cdc8"
              />
              <text
                x={pad.l + i * group + group * 0.5}
                y={h - 8}
                textAnchor="middle"
                className="fill-[var(--muted-foreground)]"
                style={{ fontSize: 9 }}
              >
                {labels[i].replace("Нед ", "Н")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SoftHBars({
  items,
  className,
}: {
  items: readonly { name: string; count: number }[];
  className?: string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  const colors = ["#0b6b56", "#4a8f7c", "#9a7b4f", "#7a8f88"];
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, i) => (
        <div key={item.name} className="pult-chart-rise" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-[var(--pult-ink-soft)]">{item.name}</span>
            <span className="text-muted-foreground">{item.count}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--pult-canvas)]">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${(item.count / max) * 100}%`,
                background: colors[i % colors.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SoftDonut({
  slices,
  className,
}: {
  slices: readonly { label: string; value: number; color: string }[];
  className?: string;
}) {
  const size = 148;
  const cx = size / 2;
  const cy = size / 2;
  const r = 54;
  const stroke = 18;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={cn("flex flex-col items-center gap-4 sm:flex-row sm:items-center", className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="size-[148px] shrink-0 pult-chart-rise"
        role="img"
        aria-label="Доля направлений"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(12,18,16,0.05)"
          strokeWidth={stroke}
        />
        {slices.map((slice) => {
          const len = (slice.value / total) * circ;
          const el = (
            <circle
              key={slice.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += len;
          return el;
        })}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-[var(--pult-ink)]"
          style={{ fontSize: 14, fontWeight: 700 }}
        >
          100%
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-[var(--muted-foreground)]"
          style={{ fontSize: 9 }}
        >
          активные
        </text>
      </svg>
      <ul className="w-full space-y-2 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[var(--pult-ink-soft)]">
              <span
                className="size-2.5 rounded-full"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
            <span className="font-medium">{s.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
