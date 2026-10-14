/** Demo analytics for Overview — visual only, not board truth. */

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
