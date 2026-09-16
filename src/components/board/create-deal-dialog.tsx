"use client";

import { useEffect, useState } from "react";
import { Paperclip, Plus, X } from "lucide-react";
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
  type BoardBlock,
  type DealCard,
  type Direction,
  type DirectionId,
  blocksForDirection,
  missingRequiredFields,
  uid,
} from "@/lib/board";
import { doorCatalog } from "@/lib/doors";
import { team } from "@/lib/mock-data";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function CreateDealDialog({
  open,
  onOpenChange,
  directionId,
  directions,
  blocks,
  preferredBlockId,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  directionId: DirectionId;
  directions: Direction[];
  blocks: BoardBlock[];
  preferredBlockId?: string;
  onCreate: (card: Omit<DealCard, "id" | "history" | "createdAt" | "updatedAt" | "flags">) => void;
}) {
  const direction = directions.find((d) => d.id === directionId)!;
  const [dir, setDir] = useState<DirectionId>(directionId);
  const currentBlocks = blocksForDirection(blocks, dir);
  const [blockId, setBlockId] = useState(
    preferredBlockId && blocks.some((b) => b.id === preferredBlockId)
      ? preferredBlockId
      : blocksForDirection(blocks, directionId)[0]?.id ?? "",
  );
  const [client, setClient] = useState("");
  const [body, setBody] = useState("");
  const [amount, setAmount] = useState("");
  const [workType, setWorkType] = useState("Установка дверей");
  const [quantity, setQuantity] = useState("1");
  const [manufacturer, setManufacturer] = useState("");
  const [deadline, setDeadline] = useState("");
  const [installDeadline, setInstallDeadline] = useState("");
  const [doorRef, setDoorRef] = useState("");
  const [measurementRef, setMeasurementRef] = useState("");
  const [maxChatUrl, setMaxChatUrl] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [ownerId, setOwnerId] = useState("u1");
  const [documents, setDocuments] = useState<DealCard["documents"]>([]);
  const [error, setError] = useState<string[]>([]);

  const owner = team.find((m) => m.id === ownerId) ?? team[0];
  const template = directions.find((d) => d.id === dir)?.template ?? direction.template;

  function reset(nextDir = directionId, nextBlock = preferredBlockId) {
    setDir(nextDir);
    const fallback = blocksForDirection(blocks, nextDir)[0]?.id ?? "";
    const preferredOk =
      nextBlock &&
      blocks.some((b) => b.id === nextBlock && b.directionId === nextDir);
    setBlockId(preferredOk ? nextBlock! : fallback);
    setClient("");
    setBody("");
    setAmount("");
    setWorkType("Установка дверей");
    setQuantity("1");
    setManufacturer("");
    setDeadline("");
    setInstallDeadline("");
    setDoorRef("");
    setMeasurementRef("");
    setMaxChatUrl("");
    setContactName("");
    setContactPhone("");
    setOwnerId("u1");
    setDocuments([]);
    setError([]);
  }

  useEffect(() => {
    if (open) reset(directionId, preferredBlockId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, directionId, preferredBlockId]);

  function submit() {
    const draft: DealCard = {
      id: "tmp",
      number: `${Math.floor(500 + Math.random() * 200)}-2026`,
      directionId: dir,
      blockId,
      amount: Number(amount) || 0,
      client: client.trim(),
      owner: owner.name,
      ownerInitials: owner.initials,
      workType,
      quantity: Number(quantity) || 0,
      manufacturer: manufacturer || "—",
      body: body.trim(),
      deadline,
      installDeadline: installDeadline || undefined,
      maxChatUrl: maxChatUrl || undefined,
      doorRef: doorRef || undefined,
      measurementRef: measurementRef || undefined,
      contacts: contactName.trim()
        ? [{ name: contactName.trim(), phone: contactPhone || undefined }]
        : [],
      documents,
      responsible: [owner.name],
      flags: [],
      history: [],
      createdAt: "",
      updatedAt: "",
      createdBy: "Анна Крылова",
    };
    const missing = missingRequiredFields(draft, template, "create");
    if (!client.trim()) missing.unshift("Клиент");
    if (!blockId) missing.unshift("Блок");
    if (missing.length) {
      setError(missing);
      return;
    }
    onCreate({
      number: draft.number,
      directionId: dir,
      blockId,
      amount: draft.amount,
      client: draft.client,
      owner: draft.owner,
      ownerInitials: draft.ownerInitials,
      workType: draft.workType,
      quantity: draft.quantity,
      manufacturer: draft.manufacturer,
      body: draft.body,
      deadline: draft.deadline,
      installDeadline: draft.installDeadline,
      maxChatUrl: draft.maxChatUrl,
      doorRef: draft.doorRef,
      measurementRef: draft.measurementRef,
      contacts: draft.contacts,
      documents: draft.documents,
      responsible: draft.responsible,
      createdBy: draft.createdBy,
    });
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Новая сделка</DialogTitle>
          <DialogDescription>
            Выберите направление и блок. Поля шаблона — по конструктору направления.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Направление</Label>
              <select
                value={dir}
                onChange={(e) => {
                  const next = e.target.value as DirectionId;
                  setDir(next);
                  setBlockId(blocksForDirection(blocks, next)[0]?.id ?? "");
                }}
                className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm"
              >
                {directions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Блок</Label>
              <select
                value={blockId}
                onChange={(e) => setBlockId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm"
              >
                {currentBlocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Клиент</Label>
            <Input value={client} onChange={(e) => setClient(e.target.value)} className="bg-white" />
          </div>

          <div className="space-y-2">
            <Label>Суть</Label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[var(--pult-line)] bg-white px-3 py-2 text-sm"
              placeholder="Контекст заказа…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Сумма, ₽</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Ответственный</Label>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm"
              >
                {team
                  .filter((m) => m.active)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Контакт</Label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="ФИО"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Телефон</Label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Дверь / SKU</Label>
              <select
                value={doorRef}
                onChange={(e) => {
                  setDoorRef(e.target.value);
                  const model = doorCatalog.find((d) => d.sku === e.target.value);
                  if (model) setManufacturer(model.name.split(" ")[0] ?? model.name);
                }}
                className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm"
              >
                <option value="">—</option>
                {doorCatalog.map((d) => (
                  <option key={d.id} value={d.sku}>
                    {d.name} · {d.sku}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Замер (id)</Label>
              <Input
                value={measurementRef}
                onChange={(e) => setMeasurementRef(e.target.value)}
                placeholder="ms_1"
                className="bg-white"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Срок поставки</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Срок монтажа</Label>
              <Input
                type="date"
                value={installDeadline}
                onChange={(e) => setInstallDeadline(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Чат в Max</Label>
            <Input
              value={maxChatUrl}
              onChange={(e) => setMaxChatUrl(e.target.value)}
              placeholder="https://max.ru/chat/…"
              className="bg-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Вид работ</Label>
              <Input value={workType} onChange={(e) => setWorkType(e.target.value)} className="bg-white" />
            </div>
            <div className="space-y-2">
              <Label>Кол-во</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Документы</Label>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--pult-line)] bg-[var(--pult-canvas)]/70 px-4 py-4 text-center hover:border-[var(--pult-accent)]/40">
              <Paperclip className="size-4 text-[var(--pult-accent)]" />
              <span className="text-sm">Прикрепить файлы</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  setDocuments((prev) => [
                    ...prev,
                    ...Array.from(files).map((f) => ({
                      id: uid("doc"),
                      name: f.name,
                      sizeLabel: formatSize(f.size),
                    })),
                  ]);
                  e.target.value = "";
                }}
              />
            </label>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-[var(--pult-line)] bg-white px-3 py-2 text-sm"
              >
                <span>
                  {doc.name} · {doc.sizeLabel}
                </span>
                <button type="button" onClick={() => setDocuments((p) => p.filter((d) => d.id !== doc.id))}>
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          {error.length > 0 ? (
            <div className="rounded-xl bg-[#fde8e4] px-3 py-2 text-sm text-[#9b3a2c]">
              Заполните: {error.join(", ")}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            className="rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90"
            onClick={submit}
          >
            <Plus className="size-4" />
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
