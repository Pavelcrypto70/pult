"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle, CircleDollarSign, Layers3 } from "lucide-react";
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
import { activity, tasks } from "@/lib/mock-data";
import { STATUS_LABELS } from "@/lib/types";

export default function DashboardPage() {
  const byDirection = useMemo(() => {
    return KANBAN_DIRECTIONS.map((dir) => {
      const dirDeals = kanbanDeals.filter((d) => d.direction === dir.id);
      const amount = dirDeals.reduce((sum, d) => sum + d.amount, 0);
      const overdue = dirDeals.filter((d) => d.flags.includes("overdue")).length;
      const urgent = dirDeals.filter((d) => d.flags.includes("urgent")).length;
      const columns = KANBAN_COLUMNS[dir.id].map((col) => {
        const columnDeals = dirDeals.filter((d) => d.columnId === col.id);
        return {
          ...col,
          count: columnDeals.length,
          amount: columnDeals.reduce((sum, d) => sum + d.amount, 0),
        };
      });
      return { ...dir, deals: dirDeals, amount, overdue, urgent, columns };
    });
  }, []);

  const totalDeals = kanbanDeals.length;
  const totalAmount = kanbanDeals.reduce((sum, d) => sum + d.amount, 0);
  const overdueAll = kanbanDeals.filter((d) => d.flags.includes("overdue")).length;
  const hotTasks = tasks.filter((t) => t.status !== "done");
  const doorPipeline = doorOrders
    .filter((o) => o.status !== "done" && o.status !== "lost")
    .reduce((sum, o) => sum + o.amount, 0);
  const measuresSoon = doorMeasurements.filter((m) => m.status === "scheduled").length;
  const installsSoon = doorInstallJobs.filter((j) => j.status === "planned").length;

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
        title="Обзор"
        description="Общий срез салона: направления сделок, деньги, флаги, замеры и монтаж."
        actions={
          <Button
            className="rounded-full bg-[var(--pult-ink)] px-5 text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
            render={<Link href="/app/pipeline" />}
          >
            К сделкам
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Сделок на досках" value={String(totalDeals)} hint="Все направления" />
        <StatCard label="Сумма контура" value={formatKanbanMoney(totalAmount)} hint="По карточкам канбана" />
        <StatCard label="Просрочено" value={String(overdueAll)} hint="Флаги на сделках" />
        <StatCard label="Заказы дверей" value={formatDoorMoney(doorPipeline)} hint="Активный pipeline" />
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Замеры" value={String(measuresSoon)} hint="Ближайшие выезды" />
        <StatCard label="Слоты монтажа" value={String(installsSoon)} hint="Бригады впереди" />
        <StatCard
          label="На витрине"
          value={String(doorCatalog.filter((d) => d.inShowroom).length)}
          hint="Моделей в салоне"
        />
        <StatCard label="Открытые задачи" value={String(hotTasks.length)} hint="По команде" />
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
            <h2 className="font-[family-name:var(--font-display)] text-lg">
              Нагрузка по ответственным
            </h2>
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
              <h2 className="font-[family-name:var(--font-display)] text-lg">Лента и задачи</h2>
            </div>
            <ul className="mb-4 space-y-3">
              {activity.slice(0, 3).map((item) => (
                <li key={item.id} className="border-b border-[var(--pult-line)] pb-3 last:border-0">
                  <p className="text-sm leading-relaxed">{item.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              {hotTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {STATUS_LABELS[task.status]} · до {task.dueDate}
                    </div>
                  </div>
                  {task.priority === "high" ? (
                    <Badge className="bg-[var(--pult-warm)] text-white">High</Badge>
                  ) : null}
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
