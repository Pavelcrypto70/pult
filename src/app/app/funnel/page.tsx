"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  MessageCircle,
  Phone,
  Sparkles,
  Zap,
} from "lucide-react";
import { ArchiveDealDialog } from "@/components/board/archive-deal-dialog";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBoard } from "@/hooks/use-board";
import {
  activeCards,
  blocksForDirection,
  formatBoardMoney,
  type DealCard,
  type DirectionId,
} from "@/lib/board";
import { cn } from "@/lib/utils";

const PIPELINES: { id: DirectionId; label: string; robotHint: string }[] = [
  {
    id: "sales",
    label: "Продажа дверей",
    robotHint: "После «Предоплата» → задача менеджеру + шаблон в Max",
  },
  {
    id: "fulfillment",
    label: "Поставка / монтаж",
    robotHint: "Вход в «У поставщика» → статус клиенту в Max",
  },
  {
    id: "warranty",
    label: "Сервис",
    robotHint: "Новое обращение → задача сервису",
  },
];

export default function AmoFunnelPreviewPage() {
  const board = useBoard();
  const [pipelineId, setPipelineId] = useState<DirectionId>("sales");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const pipeline = PIPELINES.find((p) => p.id === pipelineId)!;
  const stages = blocksForDirection(board.state.blocks, pipelineId);
  const deals = activeCards(board.state.cards).filter(
    (c) => c.directionId === pipelineId,
  );
  const selected = deals.find((c) => c.id === selectedId) ?? null;
  const selectedStage = selected
    ? stages.find((s) => s.id === selected.blockId)
    : undefined;
  const actions =
    board.state.directions
      .find((d) => d.id === pipelineId)
      ?.transitions.filter((t) => t.fromBlockId === selected?.blockId) ?? [];

  const totals = useMemo(() => {
    const sum = deals.reduce((a, d) => a + d.amount, 0);
    return { count: deals.length, sum };
  }, [deals]);

  if (!board.ready) {
    return (
      <div className="rounded-2xl border border-[var(--pult-line)] bg-white/70 px-4 py-16 text-center text-sm text-muted-foreground">
        Загружаем воронку…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Воронка"
        description="Стадии слева направо, сделка в центре, чат и автоматизации на стадии."
      />

      <Surface className="mb-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {PIPELINES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPipelineId(p.id);
                  setSelectedId(null);
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs tracking-[0.06em] uppercase transition-all",
                  p.id === pipelineId
                    ? "bg-[var(--pult-ink)] text-[var(--pult-paper)]"
                    : "bg-[var(--pult-canvas)] text-muted-foreground hover:text-[var(--pult-ink)]",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {totals.count} сделок ·{" "}
            <span className="font-medium text-[var(--pult-ink)]">
              {formatBoardMoney(totals.sum)}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-[var(--pult-accent-soft)]/50 px-3 py-2.5 text-xs text-[var(--pult-ink-soft)]">
          <Bot className="mt-0.5 size-3.5 shrink-0 text-[var(--pult-accent)]" />
          <span>{pipeline.robotHint}</span>
        </div>
      </Surface>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {stages.map((stage) => {
            const columnDeals = deals.filter((d) => d.blockId === stage.id);
            const sum = columnDeals.reduce((a, d) => a + d.amount, 0);
            return (
              <section
                key={stage.id}
                className="flex w-[260px] shrink-0 flex-col"
              >
                <div className="mb-2 flex items-start justify-between gap-2 px-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: stage.color }}
                      />
                      <h2 className="text-[12px] font-semibold tracking-wide uppercase">
                        {stage.title}
                      </h2>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {columnDeals.length} · {formatBoardMoney(sum)}
                    </div>
                  </div>
                  <span
                    title="Автоматика на стадии"
                    className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--pult-canvas)] text-[var(--pult-accent)]"
                  >
                    <Zap className="size-3" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-[var(--pult-line)] bg-[var(--pult-canvas)]/40 p-2 min-h-[320px]">
                  {columnDeals.map((deal) => (
                    <FunnelCard
                      key={deal.id}
                      deal={deal}
                      active={deal.id === selectedId}
                      onClick={() => setSelectedId(deal.id)}
                    />
                  ))}
                  {columnDeals.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--pult-line)] px-3 py-8 text-center text-[11px] text-muted-foreground">
                      Пусто
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="xl:sticky xl:top-20 xl:self-start">
          <Surface className="overflow-hidden p-0">
            {selected ? (
              <>
                <div className="border-b border-[var(--pult-line)] bg-[linear-gradient(135deg,rgba(11,107,86,0.08),rgba(154,123,79,0.08))] px-4 py-4">
                  <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                    Сделка · {selected.number}
                  </div>
                  <div className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight">
                    {formatBoardMoney(selected.amount)}
                  </div>
                  <div className="mt-1 text-sm font-medium">{selected.client}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="rounded-full">
                      {selectedStage?.title ?? "—"}
                    </Badge>
                    {selected.maxChatUrl || selected.contacts[0]?.phone ? (
                      <Badge className="rounded-full bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]">
                        чат привязан
                      </Badge>
                    ) : (
                      <Badge className="rounded-full bg-[#fff3d6] text-[#8a6a1a]">
                        нет Max
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selected.body || "Без описания"}
                  </p>

                  <dl className="grid gap-1.5 text-xs">
                    <Row label="Ответственный" value={selected.owner} />
                    <Row label="Дверь" value={selected.doorRef || "—"} />
                    <Row label="Срок" value={selected.deadline || "—"} />
                    <Row
                      label="Телефон"
                      value={selected.contacts[0]?.phone || "—"}
                    />
                  </dl>

                  <div className="rounded-2xl border border-[var(--pult-line)] bg-[var(--pult-canvas)]/60 p-3">
                    <div className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                      <MessageCircle className="size-3.5 text-[var(--pult-accent)]" />
                      Чат сделки
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
                        Здравствуйте! Хотим обратную связь по заказу{" "}
                        {selected.number}.
                      </div>
                      <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-[var(--pult-accent)] px-3 py-2 text-white">
                        Приняли заявку. Менеджер ответит в этом же чате.
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      {selected.contacts[0]?.phone ? (
                        <Button variant="outline" size="sm" className="rounded-full">
                          <Phone className="size-3.5" />
                          {selected.contacts[0].phone}
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)]"
                        disabled={!selected.maxChatUrl && !selected.contacts[0]?.phone}
                      >
                        Ответить в Max
                      </Button>
                    </div>
                  </div>

                  {actions.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                        <Sparkles className="size-3.5 text-[var(--pult-gold)]" />
                        Следующий шаг
                      </div>
                      {actions.map((a) => (
                        <Button
                          key={a.id}
                          className="w-full rounded-full"
                          variant="outline"
                          onClick={() => {
                            const result = board.runAction(selected.id, a.actionId);
                            if (!result.ok) return;
                            if (a.actionId === "handoff_fulfillment") {
                              setPipelineId("fulfillment");
                            }
                          }}
                        >
                          {a.actionLabel}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      На этой стадии нет авто-действий — перетащите в текущем канбане
                      или добавьте правило в конструкторе.
                    </p>
                  )}

                  <Button
                    variant="outline"
                    className="w-full rounded-full border-[#e8c4bc] text-[#9b3a2c] hover:bg-[#fde8e4]"
                    onClick={() => setArchiveOpen(true)}
                  >
                    Закрыть в архив
                  </Button>
                </div>
              </>
            ) : (
              <div className="px-5 py-16 text-center text-sm text-muted-foreground">
                Выберите сделку в воронке — справа откроются поля, чат и шаги.
              </div>
            )}
          </Surface>
        </aside>
      </div>

      <ArchiveDealDialog
        card={selected}
        open={archiveOpen && Boolean(selected)}
        onOpenChange={setArchiveOpen}
        onConfirm={(input) => {
          if (!selected) return;
          board.archiveCard(selected.id, input);
          setArchiveOpen(false);
          setSelectedId(null);
        }}
      />
    </div>
  );
}

function FunnelCard({
  deal,
  active,
  onClick,
}: {
  deal: DealCard;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border bg-white p-3 text-left shadow-sm transition-all",
        active
          ? "border-[var(--pult-accent)] ring-2 ring-[var(--pult-accent)]/20"
          : "border-[var(--pult-line)] hover:border-[var(--pult-gold)]/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
          {deal.number}
        </div>
        {deal.maxChatUrl || deal.contacts[0]?.phone ? (
          <MessageCircle className="size-3.5 text-[var(--pult-accent)]" />
        ) : null}
      </div>
      <div className="mt-1 font-[family-name:var(--font-display)] text-base tracking-tight">
        {formatBoardMoney(deal.amount)}
      </div>
      <div className="mt-0.5 truncate text-sm font-medium">{deal.client}</div>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex size-6 items-center justify-center rounded-full bg-[var(--pult-accent-soft)] text-[10px] font-semibold text-[var(--pult-accent)]">
          {deal.ownerInitials}
        </span>
        <span className="truncate text-[11px] text-muted-foreground">
          {deal.owner}
        </span>
      </div>
      {deal.deadline ? (
        <div className="mt-2 text-[10px] text-muted-foreground">
          след. контроль · {deal.deadline}
        </div>
      ) : null}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
