"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import {
  FIELD_MODULE_CATALOG,
  type BoardBlock,
  type Direction,
  type DirectionId,
  type FieldModuleConfig,
  type TransitionRule,
  blocksForDirection,
  uid,
} from "@/lib/board";
import { cn } from "@/lib/utils";

const COLORS = ["#c45c4a", "#c4a035", "#d4a017", "#2aa3a0", "#0b6b56", "#2f6fed", "#9a7b4f", "#b86a3d"];

export function BoardConstructorDialog({
  open,
  onOpenChange,
  directionId,
  directions,
  blocks,
  onSaveTemplate,
  onSaveTransitions,
  onUpsertBlock,
  onDeleteBlock,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directionId: DirectionId;
  directions: Direction[];
  blocks: BoardBlock[];
  onSaveTemplate: (directionId: DirectionId, template: FieldModuleConfig[]) => void;
  onSaveTransitions: (directionId: DirectionId, transitions: TransitionRule[]) => void;
  onUpsertBlock: (block: BoardBlock) => void;
  onDeleteBlock: (blockId: string) => void;
}) {
  const direction = directions.find((d) => d.id === directionId)!;
  const dirBlocks = blocksForDirection(blocks, directionId);
  const [tab, setTab] = useState<"blocks" | "template" | "rules">("blocks");
  const [template, setTemplate] = useState<FieldModuleConfig[]>(direction.template);
  const [transitions, setTransitions] = useState<TransitionRule[]>(direction.transitions);
  const [blockTitle, setBlockTitle] = useState("");
  const [blockColor, setBlockColor] = useState(COLORS[0]);
  const [assigneeHint, setAssigneeHint] = useState("");

  useEffect(() => {
    if (!open) return;
    setTemplate(direction.template);
    setTransitions(direction.transitions);
  }, [open, direction]);

  function addBlock() {
    if (!blockTitle.trim()) return;
    onUpsertBlock({
      id: uid("block"),
      directionId,
      title: blockTitle.trim(),
      color: blockColor,
      order: dirBlocks.length,
      assigneeHint: assigneeHint.trim() || undefined,
    });
    setBlockTitle("");
    setAssigneeHint("");
  }

  function addRule() {
    const from = dirBlocks[0]?.id;
    const to = dirBlocks[1]?.id ?? dirBlocks[0]?.id;
    if (!from || !to) return;
    setTransitions((prev) => [
      ...prev,
      {
        id: uid("rule"),
        fromBlockId: from,
        targetBlockId: to,
        actionId: uid("act"),
        actionLabel: "Новое действие",
      },
    ]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Конструктор · {direction.short}</DialogTitle>
          <DialogDescription>
            Блоки, шаблон полей карточки и правила автопереходов — по docs/LOGIC.md.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-3 flex flex-wrap gap-2">
          {(
            [
              ["blocks", "Блоки"],
              ["template", "Шаблон карточки"],
              ["rules", "Переходы"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm",
                tab === id
                  ? "bg-[var(--pult-ink)] text-[var(--pult-paper)]"
                  : "bg-[var(--pult-canvas)] text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "blocks" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              {dirBlocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--pult-line)] bg-white px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="size-3.5 shrink-0 rounded-full"
                      style={{ background: block.color }}
                    />
                    <div className="min-w-0">
                      <Input
                        value={block.title}
                        onChange={(e) =>
                          onUpsertBlock({ ...block, title: e.target.value })
                        }
                        className="h-8 border-transparent bg-transparent px-0 font-medium shadow-none"
                      />
                      {block.assigneeHint ? (
                        <div className="text-[11px] text-muted-foreground">
                          Метка: {block.assigneeHint}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={block.color}
                      onChange={(e) => onUpsertBlock({ ...block, color: e.target.value })}
                      className="size-8 cursor-pointer rounded border-0 bg-transparent"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDeleteBlock(block.id)}
                      title="Удалить (только пустой блок)"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="grid gap-3 rounded-2xl bg-[var(--pult-canvas)]/70 p-4 sm:grid-cols-[1fr_auto_auto]">
              <div className="space-y-2">
                <Label>Новый блок</Label>
                <Input
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  placeholder="Название столбца"
                  className="bg-white"
                />
                <Input
                  value={assigneeHint}
                  onChange={(e) => setAssigneeHint(e.target.value)}
                  placeholder="Метка (напр. Ксения)"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Цвет</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBlockColor(c)}
                      className={cn(
                        "size-7 rounded-full ring-offset-2",
                        blockColor === c && "ring-2 ring-[var(--pult-ink)]",
                      )}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-end">
                <Button className="rounded-full" onClick={addBlock}>
                  <Plus className="size-4" />
                  Добавить
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "template" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Большой конструктор: что можно ставить в карточку этого направления.
            </p>
            {template
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((field) => {
                const meta = FIELD_MODULE_CATALOG.find((m) => m.id === field.id);
                return (
                  <div
                    key={field.id}
                    className="grid gap-3 rounded-2xl border border-[var(--pult-line)] bg-white p-3 sm:grid-cols-[1.2fr_repeat(3,auto)] sm:items-center"
                  >
                    <div>
                      <div className="font-medium">{field.label}</div>
                      <div className="text-xs text-muted-foreground">{meta?.description}</div>
                    </div>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        onChange={(e) =>
                          setTemplate((prev) =>
                            prev.map((f) =>
                              f.id === field.id ? { ...f, enabled: e.target.checked } : f,
                            ),
                          )
                        }
                      />
                      Вкл
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={field.requiredOnCreate}
                        onChange={(e) =>
                          setTemplate((prev) =>
                            prev.map((f) =>
                              f.id === field.id
                                ? { ...f, requiredOnCreate: e.target.checked }
                                : f,
                            ),
                          )
                        }
                      />
                      При создании
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={field.requiredOnExit}
                        onChange={(e) =>
                          setTemplate((prev) =>
                            prev.map((f) =>
                              f.id === field.id
                                ? { ...f, requiredOnExit: e.target.checked }
                                : f,
                            ),
                          )
                        }
                      />
                      При выходе
                    </label>
                  </div>
                );
              })}
            <Button
              className="rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90"
              onClick={() => onSaveTemplate(directionId, template)}
            >
              Сохранить шаблон
            </Button>
          </div>
        ) : null}

        {tab === "rules" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Действие в блоке → целевой блок (автопереход после выполнения).
            </p>
            {transitions.map((rule) => (
              <div
                key={rule.id}
                className="grid gap-2 rounded-2xl border border-[var(--pult-line)] bg-white p-3 sm:grid-cols-3"
              >
                <div className="space-y-1">
                  <Label className="text-[11px]">Из блока</Label>
                  <select
                    value={rule.fromBlockId}
                    onChange={(e) =>
                      setTransitions((prev) =>
                        prev.map((r) =>
                          r.id === rule.id ? { ...r, fromBlockId: e.target.value } : r,
                        ),
                      )
                    }
                    className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] px-2 text-sm"
                  >
                    {dirBlocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Действие</Label>
                  <Input
                    value={rule.actionLabel}
                    onChange={(e) =>
                      setTransitions((prev) =>
                        prev.map((r) =>
                          r.id === rule.id ? { ...r, actionLabel: e.target.value } : r,
                        ),
                      )
                    }
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">В блок</Label>
                  <div className="flex gap-2">
                    <select
                      value={rule.targetBlockId}
                      onChange={(e) =>
                        setTransitions((prev) =>
                          prev.map((r) =>
                            r.id === rule.id ? { ...r, targetBlockId: e.target.value } : r,
                          ),
                        )
                      }
                      className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] px-2 text-sm"
                    >
                      {dirBlocks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setTransitions((prev) => prev.filter((r) => r.id !== rule.id))
                      }
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-full" onClick={addRule}>
                <Plus className="size-4" />
                Правило
              </Button>
              <Button
                className="rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90"
                onClick={() => onSaveTransitions(directionId, transitions)}
              >
                Сохранить переходы
              </Button>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
