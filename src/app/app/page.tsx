"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  SoftDonut,
  SoftGroupedBars,
  SoftHBars,
  SoftLineChart,
} from "@/components/overview/soft-charts";
import { PageHeader, StatCard, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBoard } from "@/hooks/use-board";
import {
  activeCards,
  blocksForDirection,
  formatBoardMoney,
  type DealCard,
} from "@/lib/board";
import {
  DEMO_DIRECTION_SHARE,
  DEMO_FUNNEL,
  DEMO_KPI,
  DEMO_LOAD,
  DEMO_LOST,
  DEMO_REVENUE_MLN,
  DEMO_WEEKS,
  DEMO_WON,
} from "@/lib/overview-demo";
import { tasks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const board = useBoard();
  const live = useMemo(() => activeCards(board.state.cards), [board.state.cards]);
  const [openDirections, setOpenDirections] = useState<Record<string, boolean>>(
    {},
  );
  const [openStages, setOpenStages] = useState<Record<string, boolean>>({});

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

  const loadItems = useMemo(() => {
    if (live.length === 0) return [...DEMO_LOAD];
    const map = new Map<string, number>();
    for (const deal of live) {
      map.set(deal.owner, (map.get(deal.owner) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [live]);

  const directionShare = useMemo(() => {
    if (live.length === 0) return [...DEMO_DIRECTION_SHARE];
    const total = live.length || 1;
    const colors: Record<string, string> = {
      sales: "#0b6b56",
      fulfillment: "#6a9e8d",
      warranty: "#9a7b4f",
    };
    return board.state.directions.map((d) => ({
      label: d.short,
      value: Math.round(
        (live.filter((c) => c.directionId === d.id).length / total) * 100,
      ),
      color: colors[d.id] ?? "#0b6b56",
    }));
  }, [board.state.directions, live]);

  const overdueAll =
    live.length === 0
      ? DEMO_KPI.overdue
      : live.filter((d) => d.flags.includes("overdue")).length;
  const hotTasks = tasks.filter((t) => t.status !== "done");
  const openTasksCount =
    live.length === 0 ? DEMO_KPI.openTasks : hotTasks.length;

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
        description="Спокойная аналитика салона: деньги, воронка, нагрузка и направления."
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

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Выручка месяца"
          value={DEMO_KPI.revenueLabel}
          hint="Демо · закрытые успехи"
        />
        <StatCard
          label="Конверсия КП→сделка"
          value={DEMO_KPI.conversionLabel}
          hint="Демо · за 6 недель"
        />
        <StatCard
          label="Просрочек"
          value={String(overdueAll)}
          hint={live.length ? "По флагам на досках" : "Демо · сигналы"}
        />
        <StatCard
          label="Открытых задач"
          value={String(openTasksCount)}
          hint="По команде"
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Surface className="p-4 sm:p-5">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-base">
              Выручка по неделям
            </h2>
            <span className="text-[11px] text-muted-foreground">млн ₽ · демо</span>
          </div>
          <SoftLineChart values={DEMO_REVENUE_MLN} labels={DEMO_WEEKS} />
        </Surface>
        <Surface className="p-4 sm:p-5">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-base">
              Успех / отказ
            </h2>
            <span className="text-[11px] text-muted-foreground">шт. · демо</span>
          </div>
          <SoftGroupedBars
            won={DEMO_WON}
            lost={DEMO_LOST}
            labels={DEMO_WEEKS}
          />
        </Surface>
      </div>

      <div className="mb-2 flex items-end justify-between gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-base">
          Воронка продажи
        </h2>
        <span className="text-[11px] text-muted-foreground">путь клиента · демо</span>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {DEMO_FUNNEL.map((step, i) => (
          <Surface
            key={step.label}
            className="p-4 pult-chart-rise"
            style={{ animationDelay: `${i * 70}ms` } as React.CSSProperties}
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
                  width: `${(step.value / DEMO_FUNNEL[0].value) * 100}%`,
                  opacity: 0.55 + (i / DEMO_FUNNEL.length) * 0.45,
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
            <span className="text-[11px] text-muted-foreground">
              {live.length ? "с доски" : "демо"} · сделок
            </span>
          </div>
          <SoftHBars items={loadItems} />
        </Surface>
        <Surface className="p-4 sm:p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-base">
              Доля направлений
            </h2>
            <span className="text-[11px] text-muted-foreground">
              {live.length ? "с доски" : "демо"}
            </span>
          </div>
          <SoftDonut slices={directionShare} />
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
