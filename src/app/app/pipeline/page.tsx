"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  GripVertical,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { BoardConstructorDialog } from "@/components/board/board-constructor-dialog";
import { CreateDealDialog } from "@/components/board/create-deal-dialog";
import { DealDetailDialog } from "@/components/board/deal-detail-dialog";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBoard } from "@/hooks/use-board";
import {
  FLAG_LABELS,
  blocksForDirection,
  formatBoardMoney,
  type CardFlag,
  type DealCard,
  type DirectionId,
} from "@/lib/board";
import { cn } from "@/lib/utils";

const flagClass: Record<CardFlag, string> = {
  overdue: "bg-[#fde8e4] text-[#9b3a2c]",
  viewed: "bg-[#e7f0ff] text-[#2f6fed]",
  deadline_changed: "bg-[#fff3d6] text-[#8a6a1a]",
  fields_filled: "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]",
  urgent: "bg-[#ffe8d6] text-[var(--pult-warm)]",
  needs_fill: "bg-[#fff3d6] text-[#8a6a1a]",
};

type DragPayload =
  | { type: "card"; cardId: string; fromBlockId: string }
  | { type: "block"; blockId: string };

export default function PipelinePage() {
  const board = useBoard();
  const [direction, setDirection] = useState<DirectionId>("fulfillment");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createBlockId, setCreateBlockId] = useState<string | undefined>();
  const [constructorOpen, setConstructorOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string[] | undefined>();
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [dropDenied, setDropDenied] = useState(false);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") !== "1") return;
    setCreateOpen(true);
    params.delete("create");
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    window.history.replaceState({}, "", next);
  }, []);

  const active = board.state.directions.find((d) => d.id === direction)!;
  const columns = blocksForDirection(board.state.blocks, direction);

  const deals = useMemo(() => {
    const q = query.trim().toLowerCase();
    return board.state.cards.filter((deal) => {
      if (deal.directionId !== direction) return false;
      if (!q) return true;
      return (
        deal.number.toLowerCase().includes(q) ||
        deal.client.toLowerCase().includes(q) ||
        deal.owner.toLowerCase().includes(q) ||
        deal.manufacturer.toLowerCase().includes(q) ||
        deal.workType.toLowerCase().includes(q) ||
        deal.body.toLowerCase().includes(q)
      );
    });
  }, [board.state.cards, direction, query]);

  const boardTotal = deals.reduce((sum, d) => sum + d.amount, 0);
  const selected = board.state.cards.find((c) => c.id === selectedId) ?? null;
  const selectedBlock = selected
    ? board.state.blocks.find((b) => b.id === selected.blockId)
    : undefined;
  const selectedDirection = selected
    ? board.state.directions.find((d) => d.id === selected.directionId)
    : undefined;

  function openCreate(blockId?: string) {
    setCreateBlockId(blockId);
    setCreateOpen(true);
  }

  function parseDrag(e: React.DragEvent): DragPayload | null {
    try {
      const raw = e.dataTransfer.getData("application/x-pult");
      if (!raw) return null;
      return JSON.parse(raw) as DragPayload;
    } catch {
      return null;
    }
  }

  function onCardDragStart(e: React.DragEvent, card: DealCard) {
    const payload: DragPayload = {
      type: "card",
      cardId: card.id,
      fromBlockId: card.blockId,
    };
    e.dataTransfer.setData("application/x-pult", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
  }

  function onBlockDragStart(e: React.DragEvent, blockId: string) {
    const payload: DragPayload = { type: "block", blockId };
    e.dataTransfer.setData("application/x-pult", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
    setDraggingBlockId(blockId);
  }

  function onBlockDragOver(e: React.DragEvent, blockId: string) {
    e.preventDefault();
    const types = Array.from(e.dataTransfer.types);
    if (!types.includes("application/x-pult")) return;
    setDropTarget(blockId);
  }

  function onColumnDrop(e: React.DragEvent, targetBlockId: string) {
    e.preventDefault();
    setDropTarget(null);
    setDropDenied(false);
    setDraggingBlockId(null);

    const payload = parseDrag(e);
    if (!payload) return;

    if (payload.type === "card") {
      const card = board.state.cards.find((c) => c.id === payload.cardId);
      const target = board.state.blocks.find((b) => b.id === targetBlockId);
      if (!card || !target) return;
      if (target.directionId !== card.directionId) {
        setDropDenied(true);
        window.setTimeout(() => setDropDenied(false), 900);
        return;
      }
      if (target.strictFlow) {
        setDropDenied(true);
        window.setTimeout(() => setDropDenied(false), 900);
        return;
      }
      if (card.blockId === targetBlockId) return;
      board.moveCard(card.id, targetBlockId, { kind: "manual" });
      return;
    }

    if (payload.type === "block") {
      board.reorderBlocks(direction, payload.blockId, targetBlockId);
    }
  }

  function handleAction(actionId: string) {
    if (!selected) return;
    const rule = selectedDirection?.transitions.find(
      (t) => t.fromBlockId === selected.blockId && t.actionId === actionId,
    );
    const result = board.runAction(selected.id, actionId);
    if (!result.ok) {
      setActionError(result.missing);
      return;
    }
    setActionError(undefined);
    if (actionId === "handoff_fulfillment" || rule?.targetBlockId.startsWith("ful_")) {
      setDirection("fulfillment");
    }
  }

  if (!board.ready) {
    return (
      <div className="rounded-2xl border border-[var(--pult-line)] bg-white/70 px-4 py-16 text-center text-sm text-muted-foreground">
        Загружаем доску…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Сделки"
        description="Канбан по направлениям: drag карточек и блоков, действия с автопереходом, конструктор полей."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setConstructorOpen(true)}
            >
              <Settings2 className="size-4" />
              Конструктор
            </Button>
            <Button
              className="rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90"
              onClick={() => openCreate()}
            >
              <Plus className="size-4" />
              Новая сделка
            </Button>
          </div>
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
                  {board.state.directions.map((item) => {
                    const count = board.state.cards.filter(
                      (d) => d.directionId === item.id,
                    ).length;
                    const selectedDir = item.id === direction;
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
                          selectedDir
                            ? "bg-[var(--pult-accent-soft)]/70 font-medium text-[var(--pult-ink)]"
                            : "text-[var(--pult-ink-soft)] hover:bg-[var(--pult-canvas)]",
                        )}
                      >
                        <span className="tracking-[0.04em] uppercase">{item.label}</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full",
                            selectedDir && "bg-white text-[var(--pult-accent)]",
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
                {formatBoardMoney(boardTotal)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-xs text-muted-foreground"
              onClick={board.resetBoard}
              title="Сбросить демо-данные доски"
            >
              Сброс
            </Button>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {board.state.directions.map((item) => {
            const selectedDir = item.id === direction;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDirection(item.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs tracking-[0.08em] uppercase transition-all",
                  selectedDir
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
          const columnDeals = deals.filter((d) => d.blockId === column.id);
          const sum = columnDeals.reduce((acc, d) => acc + d.amount, 0);
          const isDrop = dropTarget === column.id;
          const isDraggingBlock = draggingBlockId === column.id;

          return (
            <section
              key={column.id}
              className={cn(
                "flex min-w-[280px] max-w-[300px] flex-1 flex-col transition-opacity",
                isDraggingBlock && "opacity-60",
              )}
              onDragOver={(e) => onBlockDragOver(e, column.id)}
              onDragLeave={() => {
                if (dropTarget === column.id) setDropTarget(null);
              }}
              onDrop={(e) => onColumnDrop(e, column.id)}
            >
              <div
                draggable
                onDragStart={(e) => onBlockDragStart(e, column.id)}
                onDragEnd={() => {
                  setDraggingBlockId(null);
                  setDropTarget(null);
                }}
                className={cn(
                  "cursor-grab rounded-t-2xl px-3 py-2.5 text-white shadow-[var(--pult-shadow)] active:cursor-grabbing",
                  isDrop && !dropDenied && "ring-2 ring-white ring-offset-2 ring-offset-[var(--pult-canvas)]",
                  isDrop && dropDenied && "ring-2 ring-[#c45c4a] ring-offset-2",
                )}
                style={{ background: column.color }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-1.5">
                    <GripVertical className="mt-0.5 size-3.5 shrink-0 opacity-70" />
                    <h2 className="text-[11px] leading-snug font-semibold tracking-[0.08em] uppercase">
                      {column.title}
                    </h2>
                  </div>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium">
                    {columnDeals.length}
                  </span>
                </div>
                <div className="mt-1 text-xs text-white/85">{formatBoardMoney(sum)}</div>
              </div>

              <div
                className={cn(
                  "flex flex-1 flex-col gap-2 rounded-b-2xl border border-t-0 border-[var(--pult-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(235,239,236,0.55))] p-2 backdrop-blur-sm transition-colors",
                  isDrop && !dropDenied && "bg-[rgba(11,107,86,0.08)]",
                  isDrop && dropDenied && "bg-[rgba(196,92,74,0.12)]",
                )}
              >
                <button
                  type="button"
                  onClick={() => openCreate(column.id)}
                  className="rounded-xl border border-dashed border-[var(--pult-line)] bg-white/70 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-[var(--pult-accent)]/40 hover:text-[var(--pult-ink)]"
                >
                  + Быстрая сделка
                </button>

                {columnDeals.map((deal) => (
                  <article
                    key={deal.id}
                    draggable
                    onDragStart={(e) => onCardDragStart(e, deal)}
                    onClick={() => {
                      setSelectedId(deal.id);
                      setActionError(undefined);
                    }}
                    className="group cursor-grab rounded-2xl border border-[var(--pult-line)] bg-white p-3.5 shadow-[0_1px_0_rgba(12,18,16,0.03)] transition-all hover:-translate-y-0.5 hover:border-[var(--pult-gold)]/35 hover:shadow-[var(--pult-shadow)] active:cursor-grabbing"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                        {deal.number}
                      </div>
                      <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        {deal.contacts[0]?.phone ? (
                          <a
                            href={`tel:${deal.contacts[0].phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--pult-canvas)] text-[var(--pult-ink-soft)]"
                          >
                            <Phone className="size-3" />
                          </a>
                        ) : (
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--pult-canvas)] text-[var(--pult-ink-soft)]">
                            <Phone className="size-3" />
                          </span>
                        )}
                        {deal.maxChatUrl ? (
                          <a
                            href={deal.maxChatUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--pult-canvas)] text-[var(--pult-ink-soft)]"
                          >
                            <MessageCircle className="size-3" />
                          </a>
                        ) : (
                          <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--pult-canvas)] text-[var(--pult-ink-soft)]">
                            <MessageCircle className="size-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                      {formatBoardMoney(deal.amount)}
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
                        <dd className="font-medium">{deal.deadline || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-muted-foreground">Производитель</dt>
                        <dd className="text-right font-medium">{deal.manufacturer}</dd>
                      </div>
                    </dl>

                    {deal.body ? (
                      <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                        {deal.body}
                      </p>
                    ) : null}

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

                    <div className="mt-3 text-xs font-medium text-[var(--pult-accent)]">
                      Открыть · действия
                    </div>
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

      <CreateDealDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        directionId={direction}
        directions={board.state.directions}
        blocks={board.state.blocks}
        preferredBlockId={createBlockId}
        onCreate={(input) => {
          board.createCard(input);
          setDirection(input.directionId);
        }}
      />

      <DealDetailDialog
        card={selected}
        block={selectedBlock}
        direction={selectedDirection}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setActionError(undefined);
          }
        }}
        onAction={handleAction}
        actionError={actionError}
      />

      <BoardConstructorDialog
        open={constructorOpen}
        onOpenChange={setConstructorOpen}
        directionId={direction}
        directions={board.state.directions}
        blocks={board.state.blocks}
        onSaveTemplate={board.updateDirectionTemplate}
        onSaveTransitions={board.updateTransitions}
        onUpsertBlock={board.upsertBlock}
        onDeleteBlock={board.deleteBlock}
      />
    </div>
  );
}
