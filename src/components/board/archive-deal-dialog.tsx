"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CLOSE_OUTCOME_LABELS,
  CLOSE_REASON_PRESETS,
  formatBoardMoney,
  type CloseOutcome,
  type DealCard,
} from "@/lib/board";

const OUTCOMES: CloseOutcome[] = ["won", "lost", "cancelled", "duplicate", "other"];

export function ArchiveDealDialog({
  card,
  open,
  onOpenChange,
  onConfirm,
}: {
  card: DealCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: { closeOutcome: CloseOutcome; closeReason: string }) => void;
}) {
  const [outcome, setOutcome] = useState<CloseOutcome>("lost");
  const [reasonPreset, setReasonPreset] = useState<string>(CLOSE_REASON_PRESETS[0]);
  const [reasonCustom, setReasonCustom] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setOutcome("lost");
    setReasonPreset(CLOSE_REASON_PRESETS[0]);
    setReasonCustom("");
    setError("");
  }, [open, card?.id]);

  if (!card) return null;

  function submit() {
    const reason =
      reasonPreset === "Иное" || outcome === "other"
        ? reasonCustom.trim()
        : reasonPreset;
    if (!reason) {
      setError("Укажите причину закрытия");
      return;
    }
    onConfirm({ closeOutcome: outcome, closeReason: reason });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>В архив · {card.number}</DialogTitle>
          <DialogDescription>
            {card.client} · {formatBoardMoney(card.amount)}. Сделка исчезнет с активной
            воронки и попадёт в статистику месяца закрытия.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <Label>Исход</Label>
            <div className="flex flex-wrap gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(o)}
                  className={
                    outcome === o
                      ? "rounded-full bg-[var(--pult-ink)] px-3 py-1.5 text-xs text-[var(--pult-paper)]"
                      : "rounded-full border border-[var(--pult-line)] bg-white px-3 py-1.5 text-xs hover:border-[var(--pult-gold)]/50"
                  }
                >
                  {CLOSE_OUTCOME_LABELS[o]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="archive-reason">Причина</Label>
            <select
              id="archive-reason"
              className="flex h-9 w-full rounded-xl border border-[var(--pult-line)] bg-white px-3 text-sm"
              value={reasonPreset}
              onChange={(e) => setReasonPreset(e.target.value)}
            >
              {CLOSE_REASON_PRESETS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {(reasonPreset === "Иное" || outcome === "other") && (
              <Input
                placeholder="Свой комментарий"
                value={reasonCustom}
                onChange={(e) => setReasonCustom(e.target.value)}
                className="rounded-xl"
              />
            )}
          </div>

          {error ? (
            <div className="rounded-xl bg-[#fde8e4] px-3 py-2 text-sm text-[#9b3a2c]">
              {error}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
            onClick={submit}
          >
            Закрыть и в архив
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
