"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  MessageCircle,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FLAG_LABELS,
  KANBAN_COLUMNS,
  KANBAN_DIRECTIONS,
  formatKanbanMoney,
  kanbanDeals,
  type KanbanDirectionId,
  type KanbanFlag,
} from "@/lib/kanban";
import { cn } from "@/lib/utils";

const flagClass: Record<KanbanFlag, string> = {
  overdue: "bg-[#fde8e4] text-[#9b3a2c]",
  viewed: "bg-[#e7f0ff] text-[#2f6fed]",
  deadline_changed: "bg-[#fff3d6] text-[#8a6a1a]",
  fields_filled: "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]",
  urgent: "bg-[#ffe8d6] text-[var(--pult-warm)]",
};

export default function PipelinePage() {
  const [direction, setDirection] = useState<KanbanDirectionId>("fulfillment");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const active = KANBAN_DIRECTIONS.find((d) => d.id === direction)!;
  const columns = KANBAN_COLUMNS[direction];

  const deals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return kanbanDeals.filter((deal) => {
      if (deal.direction !== direction) return false;
      if (!q) return true;
      return (
        deal.number.toLowerCase().includes(q) ||
        deal.client.toLowerCase().includes(q) ||
        deal.owner.toLowerCase().includes(q) ||
        deal.manufacturer.toLowerCase().includes(q) ||
        deal.workType.toLowerCase().includes(q)
      );
    });
  }, [direction, query]);

  const boardTotal = deals.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <PageHeader
        title="Сделки"
        description="Три направления салона: продажа, поставка/монтаж и постгарантийный сервис. Столбцы можно будет уточнить."
        actions={
          <Button className="rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90">
            <Plus className="size-4" />
            Создать
          </Button>
        }
      />

      <Surface className="mb-5 overflow-visible p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex min-h-11 w-full items-center gap-2 rounded-full border border-[var(--pult-line)] bg-[linear-gradient(135deg,rgba(11,107,86,0.12),rgba(154,123,79,0.1),rgba(255,255,255,0.95))] px-4 py-2.5 text-left transition-shadow hover:shadow-[var(--pult-shadow)] sm:min-w-[320px]"
            >
              <SlidersHorizontal className="size-4 shrink-0 text-[var(--pult-accent)]" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-wide uppercase">
                {active.label}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  menuOpen && "rotate-180",
                )}
              />
            </button>

            {menuOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Закрыть меню направлений"
                  className="fixed inset-0 z-20 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute top-[calc(100%+8px)] left-0 z-30 w-[min(100vw-2rem,360px)] overflow-hidden rounded-[1.25rem] border border-[var(--pult-line)] bg-white shadow-[var(--pult-shadow-lg)]">
                {KANBAN_DIRECTIONS.map((item) => {
                  const count = kanbanDeals.filter((d) => d.direction === item.id).length;
                  const selected = item.id === direction;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDirection(item.id);
                        setMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm transition-colors",
                        selected
                          ? "bg-[var(--pult-accent-soft)]/70 font-medium text-[var(--pult-ink)]"
                          : "text-[var(--pult-ink-soft)] hover:bg-[var(--pult-canvas)]",
                      )}
                    >
                      <span className="tracking-[0.04em] uppercase">{item.label}</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full",
                          selected && "bg-white text-[var(--pult-accent)]",
                        )}
                      >
                        {count}
                      </Badge>
                    </button>
                  );
                })}
                </div>
              </>
            ) : null}
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-2 lg:justify-end">
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск сделки, клиента, артикула…"
                className="rounded-full bg-white pl-9"
              />
            </div>
            <div className="rounded-full bg-[var(--pult-canvas)] px-3 py-2 text-xs text-muted-foreground">
              В направлении{" "}
              <span className="font-medium text-[var(--pult-ink)]">{deals.length}</span>
              {" · "}
              <span className="font-medium text-[var(--pult-ink)]">
                {formatKanbanMoney(boardTotal)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {KANBAN_DIRECTIONS.map((item) => {
            const selected = item.id === direction;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDirection(item.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs tracking-[0.08em] uppercase transition-all",
                  selected
                    ? "bg-[var(--pult-ink)] text-[var(--pult-paper)] shadow-[var(--pult-shadow)]"
                    : "bg-white text-muted-foreground hover:text-[var(--pult-ink)]",
                )}
              >
                {item.short}
              </button>
            );
          })}
        </div>
      </Surface>

      <div
        key={direction}
        className="animate-in fade-in slide-in-from-bottom-2 flex gap-3 overflow-x-auto pb-4 duration-300"
      >
        {columns.map((column) => {
          const columnDeals = deals.filter((d) => d.columnId === column.id);
          const sum = columnDeals.reduce((acc, d) => acc + d.amount, 0);

          return (
            <section
              key={column.id}
              className="flex min-w-[280px] max-w-[300px] flex-1 flex-col"
            >
              <div
                className="rounded-t-2xl px-3 py-2.5 text-white shadow-[var(--pult-shadow)]"
                style={{ background: column.accent }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[11px] leading-snug font-semibold tracking-[0.08em] uppercase">
                    {column.title}
                  </h2>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium">
                    {columnDeals.length}
                  </span>
                </div>
                <div className="mt-1 text-xs text-white/85">{formatKanbanMoney(sum)}</div>
              </div>

              <div className="flex flex-1 flex-col gap-2 rounded-b-2xl border border-t-0 border-[var(--pult-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(235,239,236,0.55))] p-2 backdrop-blur-sm">
                <button
                  type="button"
                  className="rounded-xl border border-dashed border-[var(--pult-line)] bg-white/70 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-[var(--pult-accent)]/40 hover:text-[var(--pult-ink)]"
                >
                  + Быстрая сделка
                </button>

                {columnDeals.map((deal) => (
                  <article
                    key={deal.id}
                    className="group rounded-2xl border border-[var(--pult-line)] bg-white p-3.5 shadow-[0_1px_0_rgba(12,18,16,0.03)] transition-all hover:-translate-y-0.5 hover:border-[var(--pult-gold)]/35 hover:shadow-[var(--pult-shadow)]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                        {deal.number}
                      </div>
                      <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--pult-canvas)] text-[var(--pult-ink-soft)]">
                          <Phone className="size-3" />
                        </span>
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--pult-canvas)] text-[var(--pult-ink-soft)]">
                          <MessageCircle className="size-3" />
                        </span>
                      </div>
                    </div>

                    <div className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                      {formatKanbanMoney(deal.amount)}
                    </div>
                    <div className="mt-1 text-sm font-medium leading-snug">{deal.client}</div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--pult-accent-soft)] text-[10px] font-semibold text-[var(--pult-accent)]">
                        {deal.ownerInitials}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                          Ответственный
                        </div>
                        <div className="truncate text-xs">{deal.owner}</div>
                      </div>
                    </div>

                    <dl className="mt-3 space-y-1.5 border-t border-[var(--pult-line)] pt-3 text-xs">
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Вид работ</dt>
                        <dd className="text-right font-medium">{deal.workType}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Кол-во</dt>
                        <dd className="font-medium">{deal.quantity}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Крайний срок</dt>
                        <dd className="font-medium">{deal.deadline}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Производитель</dt>
                        <dd className="text-right font-medium">{deal.manufacturer}</dd>
                      </div>
                    </dl>

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {deal.note}
                    </p>

                    {deal.flags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {deal.flags.map((flag) => (
                          <span
                            key={flag}
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium",
                              flagClass[flag],
                            )}
                          >
                            {FLAG_LABELS[flag]}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className="mt-3 text-xs font-medium text-[var(--pult-accent)] hover:underline"
                    >
                      + Дело
                    </button>
                  </article>
                ))}

                {columnDeals.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--pult-line)] bg-white/50 px-3 py-10 text-center text-xs text-muted-foreground">
                    Пусто
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
