"use client";

import { useEffect, useMemo, useState } from "react";
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
  blocksForDirection,
  formatBoardMoney,
  type BoardBlock,
  type DealCard,
  type Direction,
  type DirectionId,
} from "@/lib/board";

export function RestoreDealDialog({
  card,
  directions,
  blocks,
  open,
  onOpenChange,
  onConfirm,
}: {
  card: DealCard | null;
  directions: Direction[];
  blocks: BoardBlock[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (input: { directionId: DirectionId; blockId: string; note: string }) => void;
}) {
  const defaultDir =
    card?.archivedFromDirectionId ?? card?.directionId ?? "sales";
  const [directionId, setDirectionId] = useState<DirectionId>(defaultDir);
  const [blockId, setBlockId] = useState("");
  const [note, setNote] = useState("");

  const dirBlocks = useMemo(
    () => blocksForDirection(blocks, directionId),
    [blocks, directionId],
  );

  useEffect(() => {
    if (!open || !card) return;
    const dir = card.archivedFromDirectionId ?? card.directionId;
    setDirectionId(dir);
    const preferred = card.archivedFromBlockId ?? card.blockId;
    const list = blocksForDirection(blocks, dir);
    setBlockId(list.some((b) => b.id === preferred) ? preferred : list[0]?.id ?? "");
    setNote("");
  }, [open, card, blocks]);

  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Вернуть на доску · {card.number}</DialogTitle>
          <DialogDescription>
            {card.client} · {formatBoardMoney(card.amount)}. Статистика месяца закрытия
            не пересчитывается — карточка снова становится активной.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <Label htmlFor="restore-dir">Направление</Label>
            <select
              id="restore-dir"
              className="flex h-9 w-full rounded-xl border border-[var(--pult-line)] bg-white px-3 text-sm"
              value={directionId}
              onChange={(e) => {
                const next = e.target.value as DirectionId;
                setDirectionId(next);
                const list = blocksForDirection(blocks, next);
                setBlockId(list[0]?.id ?? "");
              }}
            >
              {directions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restore-block">Блок</Label>
            <select
              id="restore-block"
              className="flex h-9 w-full rounded-xl border border-[var(--pult-line)] bg-white px-3 text-sm"
              value={blockId}
              onChange={(e) => setBlockId(e.target.value)}
            >
              {dirBlocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restore-note">Комментарий</Label>
            <Input
              id="restore-note"
              placeholder="Почему возвращаем"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
            disabled={!blockId}
            onClick={() => {
              onConfirm({ directionId, blockId, note });
              onOpenChange(false);
            }}
          >
            Вернуть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
