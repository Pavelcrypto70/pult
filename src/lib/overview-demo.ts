/** Demo analytics for Overview — visual only, not board truth. */

export type PeriodPreset = "today" | "week" | "month" | "custom";

export type DateRange = { from: Date; to: Date };

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function toInputDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseInputDate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export function rangeForPreset(preset: PeriodPreset, custom?: DateRange): DateRange {
  const now = new Date();
  if (preset === "today") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }
  if (preset === "week") {
    return { from: startOfDay(addDays(now, -6)), to: endOfDay(now) };
  }
  if (preset === "month") {
    return { from: startOfDay(addDays(now, -29)), to: endOfDay(now) };
  }
  const from = custom?.from ? startOfDay(custom.from) : startOfDay(addDays(now, -29));
  const to = custom?.to ? endOfDay(custom.to) : endOfDay(now);
  return from <= to ? { from, to } : { from: to, to: from };
}

export function formatRangeLabel(range: DateRange) {
  const fmt = (d: Date) =>
    d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
  const sameDay =
    range.from.getFullYear() === range.to.getFullYear() &&
    range.from.getMonth() === range.to.getMonth() &&
    range.from.getDate() === range.to.getDate();
  if (sameDay) return fmt(range.from);
  return `${fmt(range.from)} — ${fmt(range.to)}`;
}

function dayCount(range: DateRange) {
  const ms = endOfDay(range.to).getTime() - startOfDay(range.from).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/** Deterministic pseudo-random 0..1 from seed */
function rnd(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function bucketLabels(range: DateRange): string[] {
  const days = dayCount(range);
  if (days <= 1) {
    return ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
  }
  if (days <= 10) {
    const labels: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = addDays(startOfDay(range.from), i);
      labels.push(
        d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
      );
    }
    return labels;
  }
  // weeks inside range
  const weeks = Math.min(8, Math.ceil(days / 7));
  return Array.from({ length: weeks }, (_, i) => `Нед ${i + 1}`);
}

export type OverviewDemoStats = {
  labels: string[];
  revenueMln: number[];
  won: number[];
  lost: number[];
  funnel: { label: string; value: number }[];
  load: { name: string; count: number }[];
  directionShare: { label: string; value: number; color: string }[];
  kpi: {
    revenueLabel: string;
    conversionLabel: string;
    overdue: number;
    openTasks: number;
  };
  chartHint: string;
};

export function getDemoStatsForRange(range: DateRange): OverviewDemoStats {
  const days = dayCount(range);
  const labels = bucketLabels(range);
  const n = labels.length;
  const scale = days <= 1 ? 0.12 : days <= 10 ? days / 30 : 1;

  const revenueMln = labels.map((_, i) => {
    const base = 0.35 + rnd(days * 10 + i) * 0.55;
    return Math.round(base * scale * (days <= 1 ? 2.2 : 3.2) * 100) / 100;
  });
  const won = labels.map((_, i) =>
    Math.max(0, Math.round((2 + rnd(days * 3 + i) * 6) * scale * (days <= 1 ? 1.4 : 2))),
  );
  const lost = labels.map((_, i) =>
    Math.max(0, Math.round((0.5 + rnd(days * 5 + i + 2) * 2.5) * scale * 1.5)),
  );

  const revenueSum = revenueMln.reduce((a, b) => a + b, 0);
  const wonSum = won.reduce((a, b) => a + b, 0);
  const lostSum = lost.reduce((a, b) => a + b, 0);
  const conv =
    wonSum + lostSum === 0
      ? 0
      : Math.round((wonSum / (wonSum + lostSum)) * 100);

  const leads = Math.max(8, Math.round(48 * scale));
  const kp = Math.max(4, Math.round(leads * (0.55 + rnd(days) * 0.15)));
  const measure = Math.max(2, Math.round(kp * (0.5 + rnd(days + 1) * 0.2)));
  const deals = Math.max(1, Math.round(measure * (0.45 + rnd(days + 2) * 0.2)));

  const loadBase = [
    { name: "Илья", w: 1.25 },
    { name: "Мария", w: 1.05 },
    { name: "Президент", w: 0.85 },
    { name: "Ксения", w: 0.7 },
  ];
  const loadTotal = Math.max(6, Math.round(41 * scale));
  const load = loadBase.map((p, i) => ({
    name: p.name,
    count: Math.max(
      1,
      Math.round((loadTotal * p.w) / 3.85 + rnd(days + i) * 2 - 1),
    ),
  }));

  const directionShare = [
    {
      label: "Продажа",
      value: 38 + Math.round(rnd(days + 9) * 10),
      color: "#0b6b56",
    },
    {
      label: "Поставка",
      value: 0,
      color: "#6a9e8d",
    },
    {
      label: "Сервис",
      value: 0,
      color: "#9a7b4f",
    },
  ];
  directionShare[1].value = 30 + Math.round(rnd(days + 10) * 12);
  directionShare[2].value = Math.max(
    8,
    100 - directionShare[0].value - directionShare[1].value,
  );

  const revenueLabel =
    revenueSum >= 1
      ? `${revenueSum.toFixed(1).replace(".", ",")} млн ₽`
      : `${Math.round(revenueSum * 1000)} тыс ₽`;

  let chartHint = "по дням";
  if (days <= 1) chartHint = "по часам · сегодня";
  else if (days > 10) chartHint = "по неделям";

  return {
    labels,
    revenueMln,
    won,
    lost,
    funnel: [
      { label: "Заявки", value: leads },
      { label: "КП", value: kp },
      { label: "Замер", value: measure },
      { label: "Сделка", value: deals },
    ],
    load,
    directionShare,
    kpi: {
      revenueLabel,
      conversionLabel: `${conv}%`,
      overdue: Math.max(1, Math.round(7 * scale)),
      openTasks: Math.max(3, Math.round(18 * scale)),
    },
    chartHint,
  };
}

/** @deprecated kept for imports — prefer getDemoStatsForRange */
export const DEMO_WEEKS = ["Нед 1", "Нед 2", "Нед 3", "Нед 4", "Нед 5", "Нед 6"] as const;
export const DEMO_REVENUE_MLN = [2.1, 2.4, 1.9, 2.8, 3.1, 2.6];
export const DEMO_WON = [8, 11, 7, 14, 12, 10];
export const DEMO_LOST = [3, 2, 4, 3, 2, 3];
export const DEMO_FUNNEL = [
  { label: "Заявки", value: 48 },
  { label: "КП", value: 31 },
  { label: "Замер", value: 19 },
  { label: "Сделка", value: 12 },
] as const;
export const DEMO_LOAD = [
  { name: "Илья", count: 14 },
  { name: "Мария", count: 11 },
  { name: "Президент", count: 9 },
  { name: "Ксения", count: 7 },
] as const;
export const DEMO_DIRECTION_SHARE = [
  { label: "Продажа", value: 42, color: "#0b6b56" },
  { label: "Поставка", value: 38, color: "#6a9e8d" },
  { label: "Сервис", value: 20, color: "#9a7b4f" },
] as const;
export const DEMO_KPI = {
  revenueLabel: "2,6 млн ₽",
  conversionLabel: "41%",
  overdue: 7,
  openTasks: 18,
} as const;
