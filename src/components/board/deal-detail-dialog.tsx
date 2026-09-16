"use client";

import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FLAG_LABELS,
  formatBoardMoney,
  type BoardBlock,
  type DealCard,
  type Direction,
  type TransitionRule,
} from "@/lib/board";
import { cn } from "@/lib/utils";

const flagClass: Record<string, string> = {
  overdue: "bg-[#fde8e4] text-[#9b3a2c]",
  viewed: "bg-[#e7f0ff] text-[#2f6fed]",
  deadline_changed: "bg-[#fff3d6] text-[#8a6a1a]",
  fields_filled: "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]",
  urgent: "bg-[#ffe8d6] text-[var(--pult-warm)]",
  needs_fill: "bg-[#fff3d6] text-[#8a6a1a]",
};

export function DealDetailDialog({
  card,
  block,
  direction,
  open,
  onOpenChange,
  onAction,
  actionError,
}: {
  card: DealCard | null;
  block?: BoardBlock;
  direction?: Direction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (actionId: string) => void;
  actionError?: string[];
}) {
  if (!card || !direction) return null;

  const actions: TransitionRule[] = direction.transitions.filter(
    (t) => t.fromBlockId === card.blockId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3 pr-8">
            <span>{card.number}</span>
            <span className="font-[family-name:var(--font-display)] text-xl">
              {formatBoardMoney(card.amount)}
            </span>
          </DialogTitle>
          <DialogDescription>
            {card.client} · блок «{block?.title ?? "—"}»
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {card.flags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {card.flags.map((flag) => (
                <Badge key={flag} className={cn("rounded-full", flagClass[flag])}>
                  {FLAG_LABELS[flag]}
                </Badge>
              ))}
            </div>
          ) : null}

          <p className="leading-relaxed text-muted-foreground">{card.body || "Без описания"}</p>

          <dl className="grid gap-2 rounded-2xl bg-[var(--pult-canvas)]/80 p-3">
            <Row label="Ответственный" value={card.owner} />
            <Row label="Вид работ" value={card.workType} />
            <Row label="Кол-во" value={String(card.quantity)} />
            <Row label="Производитель" value={card.manufacturer} />
            <Row label="Срок поставки" value={card.deadline || "—"} />
            <Row label="Срок монтажа" value={card.installDeadline || "—"} />
            <Row label="Дверь" value={card.doorRef || "—"} />
            <Row label="Замер" value={card.measurementRef || "—"} />
          </dl>

          {card.contacts.length > 0 ? (
            <div>
              <div className="mb-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                Контакты
              </div>
              {card.contacts.map((c) => (
                <div key={c.name} className="text-sm">
                  {c.name}
                  {c.phone ? ` · ${c.phone}` : ""}
                  {c.messenger ? ` · ${c.messenger}` : ""}
                </div>
              ))}
            </div>
          ) : null}

          {card.documents.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {card.documents.map((doc) => (
                <span
                  key={doc.id}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--pult-canvas)] px-2 py-1 text-[11px]"
                >
                  <FileText className="size-3" />
                  {doc.name}
                </span>
              ))}
            </div>
          ) : null}

          {card.maxChatUrl ? (
            <Button
              variant="outline"
              className="w-full rounded-full"
              render={<Link href={card.maxChatUrl} target="_blank" rel="noreferrer" />}
            >
              Открыть чат в Max
              <ExternalLink className="size-3.5" />
            </Button>
          ) : null}

          {card.doorRef ? (
            <Button
              variant="outline"
              className="w-full rounded-full"
              render={<Link href="/app/doors" />}
            >
              К витрине · {card.doorRef}
            </Button>
          ) : null}

          <div>
            <div className="mb-2 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              История
            </div>
            <ul className="max-h-36 space-y-2 overflow-y-auto">
              {card.history.slice(0, 8).map((h) => (
                <li key={h.id} className="rounded-xl border border-[var(--pult-line)] px-3 py-2 text-xs">
                  <div className="font-medium">
                    {h.actionLabel ?? (h.kind === "manual" ? "Ручной перенос" : "Создание")}
                  </div>
                  <div className="text-muted-foreground">
                    {h.userName} · {new Date(h.at).toLocaleString("ru-RU")}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {actionError?.length ? (
            <div className="rounded-xl bg-[#fde8e4] px-3 py-2 text-sm text-[#9b3a2c]">
              Заполните перед действием: {actionError.join(", ")}
            </div>
          ) : null}

          {actions.length > 0 ? (
            <div className="space-y-2">
              <div className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                Действия → следующий блок
              </div>
              <div className="flex flex-col gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.id}
                    className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
                    onClick={() => onAction(action.actionId)}
                  >
                    {action.actionLabel}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Для этого блока нет авто-действий — перенесите карточку вручную.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
