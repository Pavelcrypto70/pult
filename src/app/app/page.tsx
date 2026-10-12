"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Archive, CircleDollarSign, Layers3 } from "lucide-react";
import { PageHeader, StatCard, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBoard } from "@/hooks/use-board";
import {
  FLAG_LABELS,
  activeCards,
  availableArchiveMonths,
  blocksForDirection,
  formatBoardMoney,
  monthLabel,
  statsForMonth,
  winRate,
  type CardFlag,
} from "@/lib/board";
import { activity, tasks } from "@/lib/mock-data";
import { STATUS_LABELS } from "@/lib/types";

export default function DashboardPage() {
  const board = useBoard();
  const live = useMemo(() => activeCards(board.state.cards), [board.state.cards]);
  const months = useMemo(
    () => availableArchiveMonths(board.state.cards),
    [board.state.cards],
  );
  const [statsMonth, setStatsMonth] = useState<string>("");
  const selectedMonth =
    statsMonth || months[0] || new Date().toISOString().slice(0, 7);
  const monthStats = useMemo(
    () => statsForMonth(board.state.cards, selectedMonth),
    [board.state.cards, selectedMonth],
  );
  const conversion = winRate(monthStats);

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
        };
      });
      return { ...dir, deals: dirDeals, amount, overdue, urgent, columns };
    });
  }, [board.state.directions, board.state.blocks, live]);

  const totalDeals = live.length;
  const totalAmount = live.reduce((sum, d) => sum + d.amount, 0);
  const overdueAll = live.filter((d) => d.flags.includes("overdue")).length;
  const hotTasks = tasks.filter((t) => t.status !== "done");

  const topOwners = useMemo(() => {
    const map = new Map<string, { name: string; count: number; amount: number }>();
    for (const deal of live) {
      const prev = map.get(deal.owner) ?? { name: deal.owner, count: 0, amount: 0 };
      prev.count += 1;
      prev.amount += deal.amount;
      map.set(deal.owner, prev);
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [live]);

  const flagStats = useMemo(() => {
    const map = new Map<CardFlag, number>();
    for (const deal of live) {
      for (const flag of deal.flags) {
        map.set(flag, (map.get(flag) ?? 0) + 1);
      }
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [live]);

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
        description="Общий срез салона: направления сделок, деньги, флаги и нагрузка команды."
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

      <Surface className="mb-6 p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Archive className="size-4 text-[var(--pult-accent)]" />
            <h2 className="font-[family-name:var(--font-display)] text-lg">
              Закрытые за месяц
            </h2>
          </div>
          <select
            className="h-9 rounded-xl border border-[var(--pult-line)] bg-white px-3 text-sm"
            value={selectedMonth}
            onChange={(e) => setStatsMonth(e.target.value)}
          >
            {(months.length ? months : [selectedMonth]).map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Выручка"
            value={formatBoardMoney(monthStats.wonAmount)}
            hint={`${monthStats.wonCount} успехов`}
          />
          <StatCard
            label="Потеряно"
            value={formatBoardMoney(monthStats.lostAmount)}
            hint={`${monthStats.lostCount + monthStats.cancelledCount} отказов`}
          />
          <StatCard
            label="Конверсия"
            value={conversion == null ? "—" : `${conversion}%`}
            hint="won / (won+lost+cancelled)"
          />
          <StatCard
            label="Раннее закрытие"
            value={String(monthStats.earlyCloseCount)}
            hint="Отказы и отмены"
          />
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            render={<Link href="/app/archive" />}
          >
            Открыть архив
          </Button>
        </div>
      </Surface>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Сделок на досках" value={String(totalDeals)} hint="Активные, без архива" />
        <StatCard label="Сумма контура" value={formatBoardMoney(totalAmount)} hint="По карточкам канбана" />
        <StatCard label="Просрочено" value={String(overdueAll)} hint="Флаги на сделках" />
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
                      style={{ background: col.color }}
                    />
                    <span className="truncate text-xs font-medium">{col.title}</span>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <div className="font-medium">{col.count}</div>
                    <div className="text-muted-foreground">{formatBoardMoney(col.amount)}</div>
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
                  {formatBoardMoney(owner.amount)}
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
                  <span>{FLAG_LABELS[flag]}</span>
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
