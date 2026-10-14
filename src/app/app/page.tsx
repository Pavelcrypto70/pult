"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarRange, ChevronDown } from "lucide-react";
import {
  SoftDonut,
  SoftGroupedBars,
  SoftHBars,
  SoftLineChart,
} from "@/components/overview/soft-charts";
import { PageHeader, StatCard, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBoard } from "@/hooks/use-board";
import {
  activeCards,
  blocksForDirection,
  formatBoardMoney,
  type DealCard,
} from "@/lib/board";
import {
  formatRangeLabel,
  getDemoStatsForRange,
  parseInputDate,
  rangeForPreset,
  toInputDate,
  type PeriodPreset,
} from "@/lib/overview-demo";
import { cn } from "@/lib/utils";

const PERIODS: { id: PeriodPreset; label: string }[] = [
  { id: "today", label: "Сегодня" },
  { id: "week", label: "Неделя" },
  { id: "month", label: "Месяц" },
  { id: "custom", label: "Период" },
];

export default function DashboardPage() {
  const board = useBoard();
  const live = useMemo(() => activeCards(board.state.cards), [board.state.cards]);
  const [openDirections, setOpenDirections] = useState<Record<string, boolean>>(
    {},
  );
  const [openStages, setOpenStages] = useState<Record<string, boolean>>({});
  const [period, setPeriod] = useState<PeriodPreset>("month");
  const [customFrom, setCustomFrom] = useState(() =>
    toInputDate(rangeForPreset("month").from),
  );
  const [customTo, setCustomTo] = useState(() =>
    toInputDate(rangeForPreset("month").to),
  );

  const range = useMemo(() => {
    if (period !== "custom") return rangeForPreset(period);
    const from = parseInputDate(customFrom);
    const to = parseInputDate(customTo);
    return rangeForPreset("custom", {
      from: from ?? rangeForPreset("month").from,
      to: to ?? rangeForPreset("month").to,
    });
  }, [period, customFrom, customTo]);

  const demo = useMemo(() => getDemoStatsForRange(range), [range]);

  const byDirection = useMemo(() => {
    return board.state.directions.map((dir) => {
      const dirDeals = live.filter((d) => d.directionId === dir.id);
      const amount = dirDeals.reduce((sum, d) => sum + d.amount, 0);
      const overdue = dirDeals.filter((d) => d.flags.includes("overdue")).length;
      const urgent = dirDeals.filter((d) => d.flags.includes("urgent")).length;
      const columns = blocksForDirection(board.state.blocks, dir.id).map((col) => {
        const columnDeals = dirDeals.filter((d) => d.blockId === col.id);
        return {
          ...col,
          count: columnDeals.length,
          amount: columnDeals.reduce((sum, d) => sum + d.amount, 0),
          deals: columnDeals as DealCard[],
        };
      });
      return { ...dir, deals: dirDeals, amount, overdue, urgent, columns };
    });
  }, [board.state.directions, board.state.blocks, live]);

  function toggleDirection(id: string) {
    setOpenDirections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleStage(key: string) {
    setOpenStages((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (!board.ready) {
    return (
      <div className="rounded-2xl border border-[var(--pult-line)] bg-white/70 px-4 py-16 text-center text-sm text-muted-foreground">
        Загружаем обзор…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Обзор"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              render={<Link href="/app/archive" />}
            >
              Архив
            </Button>
            <Button
              className="rounded-full bg-[var(--pult-ink)] px-5 text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
              render={<Link href="/app/pipeline" />}
            >
              К сделкам
            </Button>
          </div>
        }
      />

      <Surface className="mb-5 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--pult-ink-soft)]">
            <CalendarRange className="size-4 text-[var(--pult-accent)]" />
            <span className="font-medium">Период статистики</span>
            <span className="text-xs text-muted-foreground">
              {formatRangeLabel(range)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPeriod(p.id);
                  if (p.id !== "custom") {
                    const r = rangeForPreset(p.id);
                    setCustomFrom(toInputDate(r.from));
                    setCustomTo(toInputDate(r.to));
                  }
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors",
                  period === p.id
                    ? "bg-[var(--pult-ink)] text-[var(--pult-paper)]"
                    : "bg-[var(--pult-canvas)] text-muted-foreground hover:text-[var(--pult-ink)]",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {period === "custom" ? (
          <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-[var(--pult-line)] pt-3">
            <label className="grid gap-1 text-xs text-muted-foreground">
              С
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-9 w-[160px] rounded-xl bg-white"
              />
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              По
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-9 w-[160px] rounded-xl bg-white"
              />
            </label>
            <p className="pb-2 text-[11px] text-muted-foreground">
              Дашборд пересчитает цифры и графики по выбранным датам
            </p>
          </div>
        ) : null}
      </Surface>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Выручка периода"
          value={demo.kpi.revenueLabel}
          hint={`Демо · ${formatRangeLabel(range)}`}
        />
        <StatCard
          label="Конверсия КП→сделка"
          value={demo.kpi.conversionLabel}
          hint="Демо · по закрытиям периода"
        />
        <StatCard
          label="Просрочек"
          value={String(demo.kpi.overdue)}
          hint="Демо · сигналы периода"
        />
        <StatCard
          label="Открытых задач"
          value={String(demo.kpi.openTasks)}
          hint="Демо · по команде"
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Surface className="p-4 sm:p-5">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-base">
              Выручка
            </h2>
            <span className="text-[11px] text-muted-foreground">
              млн ₽ · {demo.chartHint}
            </span>
          </div>
          <SoftLineChart values={demo.revenueMln} labels={demo.labels} />
        </Surface>
        <Surface className="p-4 sm:p-5">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-base">
              Успех / отказ
            </h2>
            <span className="text-[11px] text-muted-foreground">
              шт. · {demo.chartHint}
            </span>
          </div>
          <SoftGroupedBars
            won={demo.won}
            lost={demo.lost}
            labels={demo.labels}
          />
        </Surface>
      </div>

      <div className="mb-2 flex items-end justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-base">
          Воронка продажи
        </h2>
        <span className="text-[11px] text-muted-foreground">
          путь клиента · {formatRangeLabel(range)}
        </span>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {demo.funnel.map((step, i) => (
          <Surface
            key={step.label}
            className="p-4 pult-chart-rise"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              {i + 1}. {step.label}
            </div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">
              {step.value}
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--pult-canvas)]">
              <div
                className="h-full rounded-full bg-[var(--pult-accent)] transition-[width] duration-700"
                style={{
                  width: `${(step.value / demo.funnel[0].value) * 100}%`,
                  opacity: 0.55 + (i / demo.funnel.length) * 0.45,
                }}
              />
            </div>
          </Surface>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Surface className="p-4 sm:p-5">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-base">
              Нагрузка по ответственным
            </h2>
            <span className="text-[11px] text-muted-foreground">демо · сделок</span>
          </div>
          <SoftHBars items={demo.load} />
        </Surface>
        <Surface className="p-4 sm:p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-base">
              Доля направлений
            </h2>
            <span className="text-[11px] text-muted-foreground">демо</span>
          </div>
          <SoftDonut slices={demo.directionShare} />
        </Surface>
      </div>

      <div className="mb-3 flex items-end justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-base">
          Направления
        </h2>
        <span className="text-[11px] text-muted-foreground">
          нажмите, чтобы раскрыть этапы
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {byDirection.map((dir) => {
          const dirOpen = Boolean(openDirections[dir.id]);
          return (
            <Surface key={dir.id} className="overflow-hidden p-0">
              <button
                type="button"
                aria-expanded={dirOpen}
                onClick={() => toggleDirection(dir.id)}
                className={cn(
                  "w-full bg-[linear-gradient(135deg,rgba(11,107,86,0.08),rgba(154,123,79,0.08),rgba(255,255,255,0.9))] px-5 py-4 text-left transition-colors hover:brightness-[0.99]",
                  dirOpen && "border-b border-[var(--pult-line)]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                      Направление
                    </div>
                    <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl tracking-tight">
                      {dir.short}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dir.label}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      dirOpen && "rotate-180",
                    )}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {dir.deals.length} сделок
                  </Badge>
                  <Badge className="rounded-full bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]">
                    {formatBoardMoney(dir.amount)}
                  </Badge>
                  {dir.overdue > 0 ? (
                    <Badge className="rounded-full bg-[#fde8e4] text-[#9b3a2c]">
                      {dir.overdue} просроч.
                    </Badge>
                  ) : null}
                  {dir.urgent > 0 ? (
                    <Badge className="rounded-full bg-[#ffe8d6] text-[var(--pult-warm)]">
                      {dir.urgent} срочно
                    </Badge>
                  ) : null}
                </div>
              </button>
              {dirOpen ? (
                <div className="space-y-2 p-4">
                  {dir.columns.map((col) => {
                    const stageKey = `${dir.id}:${col.id}`;
                    const open = Boolean(openStages[stageKey]);
                    return (
                      <div
                        key={col.id}
                        className="overflow-hidden rounded-xl bg-[var(--pult-canvas)]/70"
                      >
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => toggleStage(stageKey)}
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-black/[0.03]"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="size-2.5 shrink-0 rounded-full"
                              style={{ background: col.color }}
                            />
                            <span className="truncate text-xs font-medium">
                              {col.title}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 text-xs">
                            <div className="text-right">
                              <div className="font-medium">{col.count}</div>
                              <div className="text-muted-foreground">
                                {formatBoardMoney(col.amount)}
                              </div>
                            </div>
                            <ChevronDown
                              className={cn(
                                "size-3.5 text-muted-foreground transition-transform duration-200",
                                open && "rotate-180",
                              )}
                            />
                          </div>
                        </button>
                        {open ? (
                          <div className="border-t border-[var(--pult-line)]/80 px-3 py-2">
                            {col.deals.length === 0 ? (
                              <p className="py-1 text-xs text-muted-foreground">
                                Нет сделок в этапе
                              </p>
                            ) : (
                              <ul className="space-y-1.5">
                                {col.deals.map((deal) => (
                                  <li key={deal.id}>
                                    <Link
                                      href="/app/pipeline"
                                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/80"
                                    >
                                      <span className="min-w-0 truncate">
                                        <span className="font-medium text-[var(--pult-ink)]">
                                          {deal.number}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {" "}
                                          · {deal.client}
                                        </span>
                                      </span>
                                      <span className="shrink-0 text-muted-foreground">
                                        {formatBoardMoney(deal.amount)}
                                      </span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </Surface>
          );
        })}
      </div>
    </div>
  );
}
