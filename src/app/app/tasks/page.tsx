"use client";

import { useMemo, useRef, useState } from "react";
import { FileText, Paperclip, Plus, X } from "lucide-react";
import { PageHeader, Surface } from "@/components/layout/page-header";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clientById, memberById, tasks as seedTasks, team } from "@/lib/mock-data";
import {
  PRIORITY_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  type TaskDocument,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function priorityClass(priority: string) {
  if (priority === "high") return "bg-[var(--pult-warm)] text-white";
  if (priority === "medium") return "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]";
  return "bg-secondary text-muted-foreground";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

const activeTeam = team.filter((m) => m.active);

export default function TasksPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string>("u1");
  const [items, setItems] = useState<TaskItem[]>(seedTasks);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [documents, setDocuments] = useState<TaskDocument[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assigneeId, setAssigneeId] = useState("u1");

  const selected = memberById(selectedId) ?? activeTeam[0];

  const filtered = useMemo(
    () => items.filter((task) => task.assigneeId === selectedId),
    [items, selectedId],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const member of activeTeam) {
      map.set(
        member.id,
        items.filter((t) => t.assigneeId === member.id && t.status !== "done").length,
      );
    }
    return map;
  }, [items]);

  function resetForm() {
    setTitle("");
    setBody("");
    setDocuments([]);
    setDueDate("");
    setPriority("medium");
    setStatus("todo");
    setAssigneeId(selectedId);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const next = Array.from(fileList).map((file) => ({
      id: `doc_${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      sizeLabel: formatSize(file.size),
    }));
    setDocuments((prev) => [...prev, ...next]);
  }

  function handleCreate() {
    if (!title.trim()) return;
    const next: TaskItem = {
      id: `t_${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      body: body.trim() || undefined,
      status,
      priority,
      assigneeId,
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      documents: documents.length ? documents : undefined,
    };
    setItems((prev) => [next, ...prev]);
    setSelectedId(assigneeId);
    setOpen(false);
    resetForm();
  }

  return (
    <div>
      <PageHeader
        title="Задачи"
        description="Вид шефа: выберите сотрудника — свои задачи тоже здесь, у Анны."
        actions={
          <Button
            className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
            onClick={() => {
              setAssigneeId(selectedId);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Новая задача
          </Button>
        }
      />

      <Surface className="mb-5 p-3 sm:p-4">
        <div className="mb-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Команда
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeTeam.map((member) => {
            const active = member.id === selectedId;
            const openCount = counts.get(member.id) ?? 0;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedId(member.id)}
                className={cn(
                  "flex min-w-[150px] shrink-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all",
                  active
                    ? "border-[var(--pult-accent)]/40 bg-[var(--pult-accent-soft)]/60 shadow-[var(--pult-shadow)]"
                    : "border-[var(--pult-line)] bg-white/80 hover:border-[var(--pult-gold)]/35",
                )}
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-[var(--pult-accent)]">
                  {member.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{member.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {ROLE_LABELS[member.role]} · {openCount} в работе
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Surface>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
            {selected.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {ROLE_LABELS[selected.role]} · {filtered.length} задач
            {selected.role === "owner" ? " · шеф салона" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            setAssigneeId(selectedId);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          Задача для {selected.initials}
        </Button>
      </div>

      <Surface className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Задача</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="hidden md:table-cell">Приоритет</TableHead>
              <TableHead className="hidden lg:table-cell">Клиент</TableHead>
              <TableHead className="text-right">Срок</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((task) => {
              const client = task.clientId ? clientById(task.clientId) : null;
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium">{task.title}</div>
                    {task.body ? (
                      <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {task.body}
                      </p>
                    ) : null}
                    {task.documents?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {task.documents.map((doc) => (
                          <span
                            key={doc.id}
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--pult-canvas)] px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            <FileText className="size-3" />
                            {doc.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{STATUS_LABELS[task.status]}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={priorityClass(task.priority)}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {client?.company ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {task.dueDate}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  У этого человека пока нет задач — создайте новую.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Surface>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
            <DialogDescription>
              Назначьте исполнителя и срок. Задача сразу появится в списке шефа.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Название</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например, согласовать замер"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-body">Суть задачи</Label>
              <textarea
                id="task-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="Что сделать, контекст, важные детали для исполнителя…"
                className="w-full resize-y rounded-xl border border-[var(--pult-line)] bg-white px-3 py-2.5 text-sm leading-relaxed outline-none focus-visible:border-[var(--pult-line-strong)] focus-visible:ring-2 focus-visible:ring-[var(--pult-accent)]/20"
              />
            </div>

            <div className="space-y-2">
              <Label>Документы</Label>
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--pult-line)] bg-[var(--pult-canvas)]/60 px-4 py-5 text-center transition-colors hover:border-[var(--pult-accent)]/40 hover:bg-[var(--pult-accent-soft)]/30"
              >
                <Paperclip className="size-4 text-[var(--pult-accent)]" />
                <span className="text-sm font-medium">Прикрепить файлы</span>
                <span className="text-xs text-muted-foreground">
                  КП, фото проёма, акт, схема — можно несколько
                </span>
              </button>
              {documents.length > 0 ? (
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--pult-line)] bg-white px-3 py-2"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm">
                        <FileText className="size-4 shrink-0 text-[var(--pult-gold)]" />
                        <span className="truncate">{doc.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {doc.sizeLabel}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="Убрать файл"
                        className="rounded-full p-1 text-muted-foreground hover:bg-[var(--pult-canvas)] hover:text-[var(--pult-ink)]"
                        onClick={() =>
                          setDocuments((prev) => prev.filter((item) => item.id !== doc.id))
                        }
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Исполнитель</Label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm outline-none"
              >
                {activeTeam.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {ROLE_LABELS[member.role]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-priority">Приоритет</Label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm outline-none"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-status">Статус</Label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm outline-none"
                >
                  <option value="todo">К работе</option>
                  <option value="doing">В работе</option>
                  <option value="blocked">Блок</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">Срок</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              className="rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90"
              onClick={handleCreate}
              disabled={!title.trim()}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
