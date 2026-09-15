"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, ArrowUpRight, CircleDollarSign, Layers3 } from "lucide-react";
import { PageHeader, StatCard, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FLAG_LABELS,
  KANBAN_COLUMNS,
  KANBAN_DIRECTIONS,
  formatKanbanMoney,
  kanbanDeals,
} from "@/lib/kanban";
import {
  doorCatalog,
  doorInstallJobs,
  doorMeasurements,
  doorOrders,
  formatDoorMoney,
} from "@/lib/doors";
import { clients, tasks } from "@/lib/mock-data";

export default function ReportsPage() {
  const byDirection = useMemo(() => {
    return KANBAN_DIRECTIONS.map((dir) => {
      const deals = kanbanDeals.filter((d) => d.direction === dir.id);
      const amount = deals.reduce((sum, d) => sum + d.amount, 0);
      const overdue = deals.filter((d) => d.flags.includes("overdue")).length;
      const urgent = deals.filter((d) => d.flags.includes("urgent")).length;
      const columns = KANBAN_COLUMNS[dir.id].map((col) => {
        const columnDeals = deals.filter((d) => d.columnId === col.id);
        return {
          ...col,
          count: columnDeals.length,
          amount: columnDeals.reduce((sum, d) => sum + d.amount, 0),
        };
      });
      return { ...dir, deals, amount, overdue, urgent, columns };
    });
  }, []);

  const totalDeals = kanbanDeals.length;
  const totalAmount = kanbanDeals.reduce((sum, d) => sum + d.amount, 0);
  const overdueAll = kanbanDeals.filter((d) => d.flags.includes("overdue")).length;
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const doorPipeline = doorOrders
    .filter((o) => o.status !== "done" && o.status !== "lost")
    .reduce((sum, o) => sum + o.amount, 0);

  const topOwners = useMemo(() => {
    const map = new Map<string, { name: string; count: number; amount: number }>();
    for (const deal of kanbanDeals) {
      const prev = map.get(deal.owner) ?? { name: deal.owner, count: 0, amount: 0 };
      prev.count += 1;
      prev.amount += deal.amount;
      map.set(deal.owner, prev);
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, []);

  const flagStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const deal of kanbanDeals) {
      for (const flag of deal.flags) {
        map.set(flag, (map.get(flag) ?? 0) + 1);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <div>
      <PageHeader
        title="Общий отчёт"
        description="Сводка по трём направлениям сделок, салону дверей и операционному контуру."
        actions={
          <Button
            className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
            render={<Link href="/app/pipeline" />}
          >
            К сделкам
            <ArrowUpRight className="size-4" />
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Сделок на досках" value={String(totalDeals)} hint="Все направления" />
        <StatCard label="Сумма контура" value={formatKanbanMoney(totalAmount)} hint="По карточкам канбана" />
        <StatCard label="Просрочено" value={String(overdueAll)} hint="Флаг на сделках" />
        <StatCard label="Заказы дверей" value={formatDoorMoney(doorPipeline)} hint="Активный pipeline салона" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {byDirection.map((dir) => (
          <Surface key={dir.id} className="overflow-hidden p-0">
            <div className="border-b border-[var(--pult-line)] bg-[linear-gradient(135deg,rgba(11,107,86,0.08),rgba(154,123,79,0.08),rgba(255,255,255,0.9))] px-5 py-4">
              <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                Направление
              </div>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl tracking-tight">
                {dir.short}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">{dir.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {dir.deals.length} сделок
                </Badge>
                <Badge className="rounded-full bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]">
                  {formatKanbanMoney(dir.amount)}
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
            </div>
            <div className="space-y-2 p-4">
              {dir.columns.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[var(--pult-canvas)]/70 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: col.accent }}
                    />
                    <span className="truncate text-xs font-medium">{col.title}</span>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <div className="font-medium">{col.count}</div>
                    <div className="text-muted-foreground">{formatKanbanMoney(col.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Surface className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <CircleDollarSign className="size-4 text-[var(--pult-gold)]" />
            <h2 className="font-[family-name:var(--font-display)] text-lg">Нагрузка по ответственным</h2>
          </div>
          <div className="space-y-3">
            {topOwners.map((owner, index) => (
              <div
                key={owner.name}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--pult-line)] bg-white/80 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--pult-accent-soft)] text-xs font-semibold text-[var(--pult-accent)]">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{owner.name}</div>
                    <div className="text-xs text-muted-foreground">{owner.count} сделок</div>
                  </div>
                </div>
                <div className="font-[family-name:var(--font-display)] text-sm">
                  {formatKanbanMoney(owner.amount)}
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <div className="space-y-4">
          <Surface className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="size-4 text-[var(--pult-warm)]" />
              <h2 className="font-[family-name:var(--font-display)] text-lg">Сигналы по флагам</h2>
            </div>
            <div className="space-y-2">
              {flagStats.map(([flag, count]) => (
                <div
                  key={flag}
                  className="flex items-center justify-between rounded-xl bg-[var(--pult-canvas)]/80 px-3 py-2 text-sm"
                >
                  <span>{FLAG_LABELS[flag as keyof typeof FLAG_LABELS]}</span>
                  <Badge variant="secondary" className="rounded-full">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Layers3 className="size-4 text-[var(--pult-accent)]" />
              <h2 className="font-[family-name:var(--font-display)] text-lg">Салон и операции</h2>
            </div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Клиенты</dt>
                <dd className="font-medium">{clients.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Открытые задачи</dt>
                <dd className="font-medium">{openTasks}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Моделей на витрине</dt>
                <dd className="font-medium">{doorCatalog.filter((d) => d.inShowroom).length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Замеры</dt>
                <dd className="font-medium">{doorMeasurements.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Слоты монтажа</dt>
                <dd className="font-medium">{doorInstallJobs.length}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-[var(--pult-line)] pt-2.5">
                <dt className="text-muted-foreground">Активные заказы дверей</dt>
                <dd className="font-medium">{formatDoorMoney(doorPipeline)}</dd>
              </div>
            </dl>
          </Surface>
        </div>
      </div>
    </div>
  );
}
